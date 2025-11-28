import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

interface StaffCardProps {
  staff: {
    id: number;
    name: string;
    department: string;
    shift: string;
    avatar: string;
  };
}

const DEPARTMENT_CONFIG: Record<string, { label: string; colorClass: string }> = {
  frontdesk: { label: "Front Desk", colorClass: "bg-dept-frontdesk/10 text-dept-frontdesk border-dept-frontdesk/20" },
  housekeeping: { label: "Housekeeping", colorClass: "bg-dept-housekeeping/10 text-dept-housekeeping border-dept-housekeeping/20" },
  maintenance: { label: "Maintenance", colorClass: "bg-dept-maintenance/10 text-dept-maintenance border-dept-maintenance/20" },
  restaurant: { label: "Restaurant", colorClass: "bg-dept-restaurant/10 text-dept-restaurant border-dept-restaurant/20" },
};

export function StaffCard({ staff }: StaffCardProps) {
  const deptConfig = DEPARTMENT_CONFIG[staff.department];

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {staff.avatar}
            </AvatarFallback>
          </Avatar>
          <Badge variant="outline" className={deptConfig.colorClass}>
            {deptConfig.label}
          </Badge>
        </div>
        
        <h3 className="mb-2 text-lg font-semibold text-foreground">{staff.name}</h3>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{staff.shift}</span>
        </div>
      </div>
    </Card>
  );
}
