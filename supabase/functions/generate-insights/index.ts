import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { month, transactions } = await req.json() as {
      month: string;
      transactions: Transaction[];
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate spending summary
    const expenses = transactions.filter(t => t.type === "debit");
    const income = transactions.filter(t => t.type === "credit");
    
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });
    
    const categoryBreakdown = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => `${category}: $${amount.toFixed(2)}`)
      .join(", ");

    const prompt = `You are a financial advisor AI. Analyze this user's monthly spending data for ${month} and provide personalized insights.

SPENDING SUMMARY:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Net: $${(totalIncome - totalExpenses).toFixed(2)}
- Category Breakdown: ${categoryBreakdown || "No expenses"}
- Number of Transactions: ${transactions.length}

Based on this data, provide:
1. Exactly 3 specific spending insights (observations about their spending patterns)
2. 1 warning about a potential financial concern
3. 1 actionable saving tip they can implement

Respond in this exact JSON format:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "warning": "warning message",
  "tip": "saving tip"
}

Be specific, helpful, and use the actual numbers from their data. Keep each insight under 100 characters.`;

    console.log("Calling Lovable AI Gateway for insights...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a helpful financial advisor. Always respond with valid JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI Response content:", content);

    // Parse the JSON response
    let insights;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      insights = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback insights
      insights = {
        insights: [
          `Total spending this month: $${totalExpenses.toFixed(2)}`,
          categoryBreakdown ? `Top category: ${Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}` : "No spending data available",
          `${transactions.length} transactions recorded`,
        ],
        warning: totalExpenses > totalIncome ? "Your expenses exceed your income this month." : "Monitor your spending to stay on budget.",
        tip: "Try setting a monthly budget to track your spending goals.",
      };
    }

    // Add generation timestamp
    insights.generatedAt = new Date().toISOString();

    console.log("Generated insights:", insights);

    return new Response(JSON.stringify({ insights }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
