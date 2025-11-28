import { useState } from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StaffCard } from "@/components/StaffCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface StaffMember {
  id: number;
  name: string;
  department: string;
  shift: string;
  avatar: string;
  day?: string;
}

export function Staff() {
  const [selectedDept, setSelectedDept] = useState("all");
  const { t } = useLanguage();

  const DEPARTMENTS = [
    { id: "all", name: t("allDepartments") },
    { id: "frontdesk", name: t("frontDesk") },
    { id: "housekeeping", name: t("housekeeping") },
    { id: "maintenance", name: t("maintenance") },
    { id: "restaurant", name: t("restaurant") },
  ];

  const MOCK_STAFF: StaffMember[] = [
    { id: 1, name: "Sarah Johnson", department: "frontdesk", shift: "Morning", avatar: "SJ", day: "Monday" },
    { id: 2, name: "Michael Chen", department: "frontdesk", shift: "Evening", avatar: "MC", day: "Monday" },
    { id: 3, name: "Emma Williams", department: "housekeeping", shift: "Morning", avatar: "EW", day: "Tuesday" },
    { id: 4, name: "James Martinez", department: "housekeeping", shift: "Morning", avatar: "JM", day: "Wednesday" },
    { id: 5, name: "Lisa Anderson", department: "maintenance", shift: "Day", avatar: "LA", day: "Thursday" },
    { id: 6, name: "David Thompson", department: "restaurant", shift: "Split", avatar: "DT", day: "Friday" },
    { id: 7, name: "Sophie Brown", department: "restaurant", shift: "Evening", avatar: "SB", day: "Saturday" },
    { id: 8, name: "Ryan Davis", department: "frontdesk", shift: "Night", avatar: "RD", day: "Sunday" },
  ];

  const filteredStaff = selectedDept === "all" 
    ? MOCK_STAFF 
    : MOCK_STAFF.filter(s => s.department === selectedDept);

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
        {filteredStaff.map((staff) => (
          <StaffCard key={staff.id} staff={staff} />
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
