import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface BudgetData {
  department: string;
  weekly_budget: number;
  actual_cost: number;
  percentage: number;
  variance: number;
}

export function Budget() {
  const { t } = useLanguage();
  const [budgets, setBudgets] = useState<BudgetData[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalActual, setTotalActual] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      // Fetch budgets
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', new Date().getMonth() + 1)
        .eq('year', new Date().getFullYear());

      if (budgetError) throw budgetError;

      // Fetch staff with their schedules
      const { data: staffData, error: staffError } = await supabase
        .from('staff_members')
        .select(`
          id,
          department,
          hourly_rate,
          shift_schedules (
            hours
          )
        `);

      if (staffError) throw staffError;

      // Calculate actual costs per department
      const costsByDept: Record<string, number> = {};
      
      staffData?.forEach((staff: any) => {
        const totalHours = staff.shift_schedules?.reduce(
          (sum: number, schedule: any) => sum + parseFloat(schedule.hours || '0'), 
          0
        ) || 0;
        const cost = totalHours * parseFloat(staff.hourly_rate || '0');
        costsByDept[staff.department] = (costsByDept[staff.department] || 0) + cost;
      });

      // Merge budget data with actual costs
      const budgetWithActual: BudgetData[] = (budgetData || [])
        .filter(b => b.department !== 'overall')
        .map(budget => {
          const actual = costsByDept[budget.department] || 0;
          const budgetAmount = parseFloat(budget.weekly_budget.toString());
          return {
            department: budget.department,
            weekly_budget: budgetAmount,
            actual_cost: actual,
            percentage: budgetAmount > 0 ? (actual / budgetAmount) * 100 : 0,
            variance: budgetAmount - actual,
          };
        });

      setBudgets(budgetWithActual);

      // Calculate totals
      const total = budgetWithActual.reduce((sum, b) => sum + b.weekly_budget, 0);
      const actualTotal = budgetWithActual.reduce((sum, b) => sum + b.actual_cost, 0);
      setTotalBudget(total);
      setTotalActual(actualTotal);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (dept: string) => {
    const map: Record<string, string> = {
      frontdesk: t("frontDesk"),
      housekeeping: t("housekeeping"),
      maintenance: t("maintenance"),
      restaurant: t("restaurant"),
    };
    return map[dept] || dept;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage > 100) return "text-red-600";
    if (percentage > 80) return "text-orange-600";
    return "text-green-600";
  };

  const getStatusIcon = (variance: number) => {
    if (variance < 0) return <TrendingUp className="h-4 w-4 text-red-600" />;
    return <TrendingDown className="h-4 w-4 text-green-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{t("loadingBudgetData")}</p>
      </div>
    );
  }

  const totalPercentage = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t("budgetAnalysis")}</h2>
        <p className="text-muted-foreground">
          {t("budgetDesc")}
        </p>
      </Card>

      {/* Overall Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("totalBudget")}</p>
              <p className="text-2xl font-bold text-foreground">${totalBudget.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-3">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("actualCost")}</p>
              <p className="text-2xl font-bold text-foreground">${totalActual.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/20 p-3">
              <AlertCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("variance")}</p>
              <p className={`text-2xl font-bold ${totalBudget - totalActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(totalBudget - totalActual).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">{t("overallBudgetUsage")}</h3>
            <Badge variant={totalPercentage > 100 ? "destructive" : "default"}>
              {totalPercentage.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={Math.min(totalPercentage, 100)} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {totalPercentage > 100 
              ? `${t("overBudget")} $${(totalActual - totalBudget).toFixed(2)}`
              : `${t("remaining")}: $${(totalBudget - totalActual).toFixed(2)}`
            }
          </p>
        </div>
      </Card>

      {/* Department Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t("departmentBreakdown")}</h3>
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.department} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">
                    {getDepartmentName(budget.department)}
                  </span>
                  {getStatusIcon(budget.variance)}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      ${budget.actual_cost.toFixed(2)} / ${budget.weekly_budget.toFixed(2)}
                    </p>
                    <p className={`text-xs ${getStatusColor(budget.percentage)}`}>
                      {budget.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <Progress 
                value={Math.min(budget.percentage, 100)} 
                className="h-2"
              />
              {budget.variance < 0 && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {t("overBudget")} ${Math.abs(budget.variance).toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
