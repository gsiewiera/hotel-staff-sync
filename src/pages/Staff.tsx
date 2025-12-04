import { useState, useEffect } from "react";
import { Users, DollarSign, Clock, CalendarCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StaffCard } from "@/components/StaffCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface StaffMember {
  id: string;
  name: string;
  department: string;
  hourly_rate: number;
  avatar: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  date_of_birth?: string | null;
  hire_date?: string | null;
}

export function Staff() {
  const [selectedDept, setSelectedDept] = useState("all");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const DEPARTMENTS = [
    { id: "all", name: t("allDepartments") },
    { id: "frontdesk", name: t("frontDesk") },
    { id: "housekeeping", name: t("housekeeping") },
    { id: "maintenance", name: t("maintenance") },
    { id: "restaurant", name: t("restaurant") },
  ];

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .order('name');

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledCount = async () => {
    const currentDate = new Date();
    const weekNumber = Math.ceil((currentDate.getDate() - currentDate.getDay() + 1) / 7);
    const year = currentDate.getFullYear();
    
    try {
      const { data, error } = await supabase
        .from('shift_schedules')
        .select('staff_id')
        .eq('week_number', weekNumber)
        .eq('year', year);

      if (error) throw error;
      const uniqueStaffIds = new Set(data?.map(s => s.staff_id) || []);
      setScheduledCount(uniqueStaffIds.size);
    } catch (error) {
      console.error('Error fetching scheduled count:', error);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchScheduledCount();
  }, []);

  const filteredStaff = selectedDept === "all" 
    ? staff 
    : staff.filter(s => s.department === selectedDept);

  const totalStaff = staff.length;
  const avgHourlyRate = staff.length > 0 
    ? staff.reduce((sum, s) => sum + Number(s.hourly_rate), 0) / staff.length 
    : 0;
  const estimatedWeeklyCost = staff.reduce((sum, s) => sum + Number(s.hourly_rate) * 40, 0);
  const departmentCount = new Set(staff.map(s => s.department)).size;

  const kpis = [
    { 
      label: t("totalStaff"), 
      value: totalStaff, 
      subtext: t("staffMembers"),
      icon: Users, 
      color: "text-blue-500" 
    },
    { 
      label: t("avgHourlyRate"), 
      value: `$${avgHourlyRate.toFixed(2)}`, 
      subtext: t("perHour"),
      icon: DollarSign, 
      color: "text-green-500" 
    },
    { 
      label: t("totalWeeklyCost"), 
      value: `$${estimatedWeeklyCost.toLocaleString()}`, 
      subtext: t("estimated"),
      icon: Clock, 
      color: "text-orange-500" 
    },
    { 
      label: t("scheduledThisWeek"), 
      value: scheduledCount, 
      subtext: `/ ${totalStaff} ${t("staffMembers")}`,
      icon: CalendarCheck, 
      color: "text-purple-500" 
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading staff...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.subtext}</p>
              </div>
              <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">{t("filterByDepartment")}</h3>
        <div className="flex flex-wrap gap-2">
          {DEPARTMENTS.map((dept) => (
            <Badge
              key={dept.id}
              variant={selectedDept === dept.id ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => setSelectedDept(dept.id)}
            >
              {dept.name}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredStaff.map((staffMember) => (
          <StaffCard key={staffMember.id} staff={staffMember} onUpdate={fetchStaff} />
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t("noStaffInDepartment")}</p>
        </Card>
      )}
    </div>
  );
}
