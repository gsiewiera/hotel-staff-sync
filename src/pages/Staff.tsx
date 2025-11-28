import { useState, useEffect } from "react";
import { Users } from "lucide-react";
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
}

export function Staff() {
  const [selectedDept, setSelectedDept] = useState("all");
  const [staff, setStaff] = useState<StaffMember[]>([]);
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

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = selectedDept === "all" 
    ? staff 
    : staff.filter(s => s.department === selectedDept);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading staff...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
