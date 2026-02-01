import { TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudget } from "@/hooks/useBudget";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: "default" | "income" | "expense" | "neutral";
  className?: string;
}

function StatCard({ title, value, subtitle, icon, variant = "default", className }: StatCardProps) {
  const borderColors = {
    default: "border-l-border",
    income: "border-l-primary",
    expense: "border-l-destructive",
    neutral: "border-l-accent",
  };

  return (
    <Card className={cn("stat-card border-l-4", borderColors[variant], className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold number-animate">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-secondary/50">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsOverview() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: budget } = useBudget();
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const monthlyTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth)
  );
  
  const totalIncome = monthlyTransactions
    .filter(t => t.type === "credit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalExpenses = monthlyTransactions
    .filter(t => t.type === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const netBalance = totalIncome - totalExpenses;
  const transactionCount = monthlyTransactions.length;
  
  const budgetUsed = budget ? (totalExpenses / Number(budget.budget_amount)) * 100 : 0;
  const budgetRemaining = budget ? Number(budget.budget_amount) - totalExpenses : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="stat-card animate-pulse">
            <CardContent className="p-6 h-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Income"
        value={`$${totalIncome.toFixed(2)}`}
        subtitle={`${monthlyTransactions.filter(t => t.type === "credit").length} credits`}
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        variant="income"
      />
      
      <StatCard
        title="Total Expenses"
        value={`$${totalExpenses.toFixed(2)}`}
        subtitle={`${monthlyTransactions.filter(t => t.type === "debit").length} debits`}
        icon={<TrendingDown className="h-5 w-5 text-destructive" />}
        variant="expense"
      />
      
      <StatCard
        title="Net Balance"
        value={`${netBalance >= 0 ? "+" : ""}$${netBalance.toFixed(2)}`}
        subtitle={netBalance >= 0 ? "You're on track!" : "Spending exceeds income"}
        icon={<Wallet className="h-5 w-5 text-accent" />}
        variant="neutral"
      />
      
      <StatCard
        title="Budget Status"
        value={budget ? `$${budgetRemaining.toFixed(0)}` : "Not Set"}
        subtitle={budget ? `${budgetUsed.toFixed(0)}% used` : "Set your monthly budget"}
        icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
        variant="default"
      />
    </div>
  );
}
