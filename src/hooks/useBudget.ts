import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Budget {
  id: string;
  user_id: string;
  month: string;
  budget_amount: number;
  created_at: string;
  updated_at: string;
}

export function useBudget(month?: string) {
  const { user } = useAuth();
  const currentMonth = month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ["budget", user?.id, currentMonth],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .maybeSingle();

      if (error) throw error;
      return data as Budget | null;
    },
    enabled: !!user,
  });
}

export function useSetBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, amount }: { month: string; amount: number }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("budgets")
        .select("id")
        .eq("user_id", user.id)
        .eq("month", month)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("budgets")
          .update({ budget_amount: amount })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("budgets")
          .insert({
            user_id: user.id,
            month,
            budget_amount: amount,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      toast.success("Budget updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update budget: ${error.message}`);
    },
  });
}
