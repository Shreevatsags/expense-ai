import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface InsightData {
  insights: string[];
  warning: string;
  tip: string;
  generatedAt: string;
}

export interface Insight {
  id: string;
  user_id: string;
  month: string;
  ai_summary: InsightData;
  created_at: string;
}

export function useInsights(month?: string) {
  const { user } = useAuth();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ["insights", user?.id, currentMonth],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        ai_summary: data.ai_summary as unknown as InsightData,
      } as Insight;
    },
    enabled: !!user,
  });
}

export function useGenerateInsights() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, transactions }: { month: string; transactions: any[] }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("generate-insights", {
        body: { month, transactions },
      });

      if (error) throw error;

      // Store the insights
      const { error: insertError } = await supabase
        .from("insights")
        .upsert({
          user_id: user.id,
          month,
          ai_summary: data.insights,
        }, {
          onConflict: 'user_id,month'
        });

      if (insertError) throw insertError;

      return data.insights as InsightData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      toast.success("AI insights generated!");
    },
    onError: (error) => {
      console.error("Insight generation error:", error);
      toast.error(`Failed to generate insights: ${error.message}`);
    },
  });
}
