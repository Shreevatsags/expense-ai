import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { CATEGORY_CONFIG, Category } from "@/lib/categories";

const CHART_COLORS = [
  "hsl(160, 84%, 39%)", // Primary
  "hsl(0, 84%, 60%)",   // Destructive
  "hsl(263, 70%, 50%)", // Accent
  "hsl(38, 92%, 50%)",  // Warning
  "hsl(200, 84%, 45%)", // Blue
  "hsl(320, 70%, 50%)", // Pink
  "hsl(280, 70%, 55%)", // Purple
  "hsl(45, 90%, 50%)",  // Yellow
  "hsl(180, 60%, 45%)", // Cyan
];

export function CategoryChart() {
  const { data: transactions = [], isLoading } = useTransactions();
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const chartData = useMemo(() => {
    const monthlyExpenses = transactions.filter(
      t => t.type === "debit" && t.date.startsWith(currentMonth)
    );
    
    const categoryTotals: Record<string, number> = {};
    
    monthlyExpenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });
    
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, currentMonth]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) {
    return (
      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            No expense data for this month.<br />
            Upload a bank statement to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = ((data.value / total) * 100).toFixed(1);
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-primary">${data.value.toFixed(2)}</p>
                        <p className="text-muted-foreground text-sm">{percentage}% of total</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Category breakdown */}
        <div className="mt-4 space-y-2">
          {chartData.slice(0, 5).map((item, index) => {
            const percentage = (item.value / total) * 100;
            const config = CATEGORY_CONFIG[item.name as Category];
            
            return (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="flex-1 text-sm">{item.name}</span>
                <span className="text-sm text-muted-foreground">
                  {percentage.toFixed(1)}%
                </span>
                <span className="text-sm font-medium w-24 text-right">
                  ${item.value.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
