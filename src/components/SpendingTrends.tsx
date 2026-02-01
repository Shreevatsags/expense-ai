import { useMemo } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/hooks/useTransactions";

export function SpendingTrends() {
  const { data: transactions = [], isLoading } = useTransactions();
  
  // Daily spending for the current month
  const dailyData = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    
    const dailyTotals: Record<string, { expenses: number; income: number }> = {};
    
    monthlyTransactions.forEach(t => {
      const day = t.date.split("-")[2];
      if (!dailyTotals[day]) {
        dailyTotals[day] = { expenses: 0, income: 0 };
      }
      if (t.type === "debit") {
        dailyTotals[day].expenses += Number(t.amount);
      } else {
        dailyTotals[day].income += Number(t.amount);
      }
    });
    
    return Object.entries(dailyTotals)
      .map(([day, data]) => ({
        day: parseInt(day),
        expenses: Number(data.expenses.toFixed(2)),
        income: Number(data.income.toFixed(2)),
      }))
      .sort((a, b) => a.day - b.day);
  }, [transactions]);

  // Top merchants
  const topMerchants = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = transactions.filter(
      t => t.type === "debit" && t.date.startsWith(currentMonth)
    );
    
    const merchantTotals: Record<string, number> = {};
    
    monthlyExpenses.forEach(t => {
      const merchant = t.merchant || t.description.split(/[\s\-]/)[0];
      merchantTotals[merchant] = (merchantTotals[merchant] || 0) + Number(t.amount);
    });
    
    return Object.entries(merchantTotals)
      .map(([name, amount]) => ({ name: name.substring(0, 15), amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  if (isLoading) {
    return (
      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Spending Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle>Spending Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-[300px]">
            <TabsTrigger value="daily">Daily Trend</TabsTrigger>
            <TabsTrigger value="merchants">Top Merchants</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="h-[300px]">
            {dailyData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No data for this month</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(day) => `${day}`}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium mb-1">Day {label}</p>
                            {payload.map((item, i) => (
                              <p key={i} style={{ color: item.color }}>
                                {item.name}: ${Number(item.value).toFixed(2)}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(0, 84%, 60%)"
                    fill="url(#expenseGradient)"
                    strokeWidth={2}
                    name="Expenses"
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(160, 84%, 39%)"
                    fill="url(#incomeGradient)"
                    strokeWidth={2}
                    name="Income"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          
          <TabsContent value="merchants" className="h-[300px]">
            {topMerchants.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No merchant data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMerchants} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-destructive">${data.amount.toFixed(2)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="hsl(263, 70%, 50%)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
