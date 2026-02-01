import { useState } from "react";
import { Sparkles, Lightbulb, AlertTriangle, PiggyBank, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInsights, useGenerateInsights } from "@/hooks/useInsights";
import { useTransactions } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function AIInsights() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: insights, isLoading } = useInsights(currentMonth);
  const { data: transactions = [] } = useTransactions();
  const generateMutation = useGenerateInsights();

  const handleGenerate = async () => {
    const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    await generateMutation.mutateAsync({
      month: currentMonth,
      transactions: monthlyTransactions,
    });
  };

  const hasEnoughData = transactions.filter(t => t.date.startsWith(currentMonth)).length >= 3;

  if (isLoading) {
    return (
      <Card className="stat-card-insight">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-secondary rounded w-3/4" />
            <div className="h-4 bg-secondary rounded w-full" />
            <div className="h-4 bg-secondary rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="stat-card-insight">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/20">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Insights</CardTitle>
              <CardDescription>
                {insights?.ai_summary?.generatedAt 
                  ? `Generated ${format(new Date(insights.ai_summary.generatedAt), "MMM d, h:mm a")}`
                  : "Powered by AI analysis"
                }
              </CardDescription>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !hasEnoughData}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", generateMutation.isPending && "animate-spin")} />
            {generateMutation.isPending ? "Analyzing..." : insights ? "Refresh" : "Generate"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasEnoughData ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              Add at least 3 transactions this month to generate AI insights.
            </p>
          </div>
        ) : !insights?.ai_summary ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Get personalized spending insights powered by AI.
            </p>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Insights
            </Button>
          </div>
        ) : (
          <div className="space-y-4 fade-in">
            {/* Insights */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lightbulb className="h-4 w-4 text-accent" />
                Key Insights
              </div>
              <div className="space-y-2">
                {insights.ai_summary.insights?.map((insight, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-secondary/50 text-sm border border-border/50"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            {/* Warning */}
            {insights.ai_summary.warning && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Warning
                </div>
                <div className="p-3 rounded-lg bg-warning/10 text-sm border border-warning/20 text-warning">
                  {insights.ai_summary.warning}
                </div>
              </div>
            )}

            {/* Tip */}
            {insights.ai_summary.tip && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <PiggyBank className="h-4 w-4 text-primary" />
                  Saving Tip
                </div>
                <div className="p-3 rounded-lg bg-primary/10 text-sm border border-primary/20 text-primary">
                  {insights.ai_summary.tip}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
