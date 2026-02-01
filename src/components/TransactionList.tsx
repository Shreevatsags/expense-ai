import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions, useDeleteTransaction, useUpdateTransactionCategory } from "@/hooks/useTransactions";
import { CATEGORIES, getCategoryIcon, getCategoryColor, getCategoryBgColor } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function TransactionList() {
  const { data: transactions = [], isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();
  const updateCategoryMutation = useUpdateTransactionCategory();

  if (isLoading) {
    return (
      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="stat-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No transactions yet. Upload a bank statement to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle>Recent Transactions ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-auto">
          {transactions.slice(0, 20).map((transaction) => {
            const Icon = getCategoryIcon(transaction.category);
            const colorClass = getCategoryColor(transaction.category);
            const bgClass = getCategoryBgColor(transaction.category);

            return (
              <div
                key={transaction.id}
                className="transaction-row group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn("p-2 rounded-lg", bgClass)}>
                    <Icon className={cn("h-4 w-4", colorClass)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={transaction.category}
                    onValueChange={(value) =>
                      updateCategoryMutation.mutate({ id: transaction.id, category: value })
                    }
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span
                    className={cn(
                      "font-semibold text-right min-w-[80px]",
                      transaction.type === "credit" ? "text-primary" : "text-destructive"
                    )}
                  >
                    {transaction.type === "credit" ? "+" : "-"}${Number(transaction.amount).toFixed(2)}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteMutation.mutate(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
