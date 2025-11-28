import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { ShiftTemplates } from "@/components/ShiftTemplates";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export interface StaffMember {
  id: string;
  name: string;
  department: string;
  shift: string;
  avatar: string;
  day?: string;
  hourly_rate: number;
}

const SHIFT_HOURS: Record<string, number> = {
  Morning: 8,
  Day: 8,
  Evening: 8,
  Night: 8,
  Split: 6,
};

export function Schedule() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyBudget, setWeeklyBudget] = useState(0);
  const [weeklyCost, setWeeklyCost] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    fetchStaff();
    fetchWeeklyBudget();
  }, []);

  const fetchWeeklyBudget = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('weekly_budget')
        .eq('department', 'overall')
        .eq('month', new Date().getMonth() + 1)
        .eq('year', new Date().getFullYear())
        .maybeSingle();

      if (error) throw error;
      setWeeklyBudget(data ? parseFloat(data.weekly_budget.toString()) : 0);
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };

  const calculateWeeklyCost = (staffList: StaffMember[]) => {
    const total = staffList.reduce((sum, s) => {
      if (!s.day) return sum;
      const hours = SHIFT_HOURS[s.shift] || 8;
      return sum + (s.hourly_rate * hours);
    }, 0);
    setWeeklyCost(total);
  };

  const fetchStaff = async () => {
    try {
      const { data: staffData, error: staffError } = await supabase
        .from('staff_members')
        .select('*');

      if (staffError) throw staffError;

      // Fetch existing schedules
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('shift_schedules')
        .select('*')
        .eq('week_number', Math.floor(new Date().getTime() / (7 * 24 * 60 * 60 * 1000)))
        .eq('year', new Date().getFullYear());

      if (scheduleError) throw scheduleError;

      // Create a map of schedules by staff_id
      const scheduleMap = new Map(
        (scheduleData || []).map(s => [s.staff_id, { day: s.day_of_week, shift: s.shift_type }])
      );

      // Merge staff with their schedules
      const staffWithSchedules = (staffData || []).map(s => ({
        id: s.id,
        name: s.name,
        department: s.department,
        avatar: s.avatar || s.name.split(' ').map((n: string) => n[0]).join(''),
        hourly_rate: parseFloat(s.hourly_rate.toString()),
        day: scheduleMap.get(s.id)?.day,
        shift: scheduleMap.get(s.id)?.shift || 'Morning',
      }));

      setStaff(staffWithSchedules);
      calculateWeeklyCost(staffWithSchedules);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffDrop = async (staffId: string, newDay: string, newShift: string) => {
    try {
      // Update local state
      setStaff(prevStaff => 
        prevStaff.map(s => 
          s.id === staffId 
            ? { ...s, day: newDay, shift: newShift }
            : s
        )
      );

      // Save to database
      const weekNumber = Math.floor(new Date().getTime() / (7 * 24 * 60 * 60 * 1000));
      const year = new Date().getFullYear();
      const hours = SHIFT_HOURS[newShift] || 8;

      const { error } = await supabase
        .from('shift_schedules')
        .upsert({
          staff_id: staffId,
          day_of_week: newDay,
          shift_type: newShift,
          hours: hours,
          week_number: weekNumber,
          year: year,
        }, {
          onConflict: 'staff_id,week_number,year'
        });

      if (error) throw error;

      const staffMember = staff.find(s => s.id === staffId);
      toast.success(`${staffMember?.name} ${t("movedToShift")} ${newDay} ${newShift} ${t("shift")}`);
      
      // Recalculate weekly cost
      calculateWeeklyCost(staff);
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error("Failed to update schedule");
    }
  };

  const handleApplyTemplate = async (staffId: string, pattern: { day: string; shift: string }[]) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;

    try {
      // Remove existing schedules for this staff member
      const weekNumber = Math.floor(new Date().getTime() / (7 * 24 * 60 * 60 * 1000));
      const year = new Date().getFullYear();

      await supabase
        .from('shift_schedules')
        .delete()
        .eq('staff_id', staffId)
        .eq('week_number', weekNumber)
        .eq('year', year);

      // Insert new schedules
      const schedules = pattern.map(slot => ({
        staff_id: staffId,
        day_of_week: slot.day,
        shift_type: slot.shift,
        hours: SHIFT_HOURS[slot.shift] || 8,
        week_number: weekNumber,
        year: year,
      }));

      const { error } = await supabase
        .from('shift_schedules')
        .insert(schedules);

      if (error) throw error;

      toast.success(`${t("appliedTemplate")} ${staffMember.name}`);
      fetchStaff(); // Refresh data
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error("Failed to apply template");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Budget Summary */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t("weeklyBudget")}</p>
            <p className="text-3xl font-bold text-foreground">${weeklyBudget.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t("actualCost")}</p>
            <p className="text-3xl font-bold text-foreground">${weeklyCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {weeklyCost <= weeklyBudget ? t("underBudget") : t("overBudget")}
            </p>
            <p className={`text-3xl font-bold ${weeklyCost <= weeklyBudget ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(weeklyBudget - weeklyCost).toFixed(2)}
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{t("budgetUsage")}</span>
                <span>{weeklyBudget > 0 ? ((weeklyCost / weeklyBudget) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${weeklyCost > weeklyBudget ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((weeklyCost / weeklyBudget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-4 print:hidden">
        <Card className="flex-1 p-4 bg-accent/10 border-accent">
          <p className="text-sm text-foreground">
            <strong>💡 {t("tip")}:</strong> {t("dragDropTip")}
          </p>
        </Card>
        <div className="flex gap-2">
          <ShiftTemplates staff={staff} onApplyTemplate={handleApplyTemplate} />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-4 w-4" />
            {t("print")}
          </button>
        </div>
      </div>
      <WeeklyCalendar staff={staff} onStaffDrop={handleStaffDrop} />
    </div>
  );
}
