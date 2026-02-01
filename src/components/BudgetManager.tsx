import { useState } from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useBudget, useSetBudget } from "@/hooks/useBudget";
import { useTransactions } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";

export function BudgetManager() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: budget, isLoading: budgetLoading } = useBudget(currentMonth);
  const { data: transactions = [] } = useTransactions();
  const setBudgetMutation = useSetBudget();
  
  const [newBudget, setNewBudget] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Calculate monthly expenses
  const monthlyExpenses = transactions
    .filter(t => t.type === "debit" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const budgetAmount = budget ? Number(budget.budget_amount) : 0;
  const budgetUsedPercent = budgetAmount > 0 ? (monthlyExpenses / budgetAmount) * 100 : 0;
  const remaining = budgetAmount - monthlyExpenses;

  const handleSetBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) return;

    await setBudgetMutation.mutateAsync({ month: currentMonth, amount });
    setIsEditing(false);
    setNewBudget("");
  };

  // Determine alert level
  const getAlertLevel = () => {
    if (budgetUsedPercent >= 100) return { level: "exceeded", color: "destructive" };
    if (budgetUsedPercent >= 90) return { level: "critical", color: "destructive" };
    if (budgetUsedPercent >= 70) return { level: "warning", color: "warning" };
    return { level: "good", color: "primary" };
  };

  const alert = getAlertLevel();

  if (budgetLoading) {
    return (
      <Card className="stat-card">
        <CardContent className="p-6 h-32 animate-pulse" />
      </Card>
    );
  }

  return (
    <Card className={cn(
      "stat-card transition-all",
      alert.level === "exceeded" && "border-destructive/50 pulse-warning",
      alert.level === "critical" && "border-destructive/30",
      alert.level === "warning" && "border-warning/30"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Monthly Budget</span>
          {!isEditing && budget && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(true);
                setNewBudget(budgetAmount.toString());
              }}
            >
              Edit
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!budget && !isEditing ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Set a monthly budget to track your spending and receive alerts.
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter budget amount"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSetBudget} disabled={!newBudget || setBudgetMutation.isPending}>
                Set Budget
              </Button>
            </div>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSetBudget} disabled={setBudgetMutation.isPending}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spent</span>
                <span className={cn(
                  "font-medium",
                  alert.level === "exceeded" || alert.level === "critical" 
                    ? "text-destructive" 
                    : alert.level === "warning" 
                      ? "text-warning" 
                      : "text-foreground"
                )}>
                  ${monthlyExpenses.toFixed(2)} / ${budgetAmount.toFixed(2)}
                </span>
              </div>
              
              <Progress
                value={Math.min(budgetUsedPercent, 100)}
                className={cn(
                  "h-3",
                  alert.level === "exceeded" || alert.level === "critical" 
                    ? "[&>div]:bg-destructive" 
                    : alert.level === "warning" 
                      ? "[&>div]:bg-warning" 
                      : "[&>div]:bg-primary"
                )}
              />
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {budgetUsedPercent.toFixed(0)}% used
                </span>
                <span className={cn(
                  remaining >= 0 ? "text-primary" : "text-destructive"
                )}>
                  {remaining >= 0 ? `$${remaining.toFixed(2)} remaining` : `$${Math.abs(remaining).toFixed(2)} over budget`}
                </span>
              </div>
            </div>

            {/* Alert messages */}
            {alert.level !== "good" && (
              <div className={cn(
                "flex items-center gap-2 p-3 rounded-lg text-sm",
                alert.level === "exceeded" && "bg-destructive/10 text-destructive border border-destructive/20",
                alert.level === "critical" && "bg-destructive/10 text-destructive border border-destructive/20",
                alert.level === "warning" && "bg-warning/10 text-warning border border-warning/20"
              )}>
                {alert.level === "exceeded" ? (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span>You've exceeded your budget! Time to cut back.</span>
                  </>
                ) : alert.level === "critical" ? (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>90% of budget used! Be careful with remaining spending.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>70% of budget used. Consider slowing down.</span>
                  </>
                )}
              </div>
            )}

            {alert.level === "good" && budgetUsedPercent < 50 && (
              <div className="flex items-center gap-2 p-3 rounded-lg text-sm bg-primary/10 text-primary border border-primary/20">
                <CheckCircle className="h-4 w-4" />
                <span>Great job! You're well within your budget.</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
