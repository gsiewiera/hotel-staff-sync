import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Staff {
  id: string;
  name: string;
  department: string;
  avatar: string;
  hourly_rate: number;
}

interface UnassignedStaffPanelProps {
  staff: Staff[];
  onDragStart: (e: React.DragEvent, staffId: string) => void;
  onDragEnd: () => void;
  draggedStaff: string | null;
}

const DEPARTMENT_COLORS: Record<string, string> = {
  frontdesk: "bg-dept-frontdesk/20 border-dept-frontdesk text-dept-frontdesk",
  housekeeping: "bg-dept-housekeeping/20 border-dept-housekeeping text-dept-housekeeping",
  maintenance: "bg-dept-maintenance/20 border-dept-maintenance text-dept-maintenance",
  restaurant: "bg-dept-restaurant/20 border-dept-restaurant text-dept-restaurant",
};

export function UnassignedStaffPanel({ 
  staff, 
  onDragStart, 
  onDragEnd,
  draggedStaff 
}: UnassignedStaffPanelProps) {
  const { t } = useLanguage();
  if (staff.length === 0) return null;

  return (
    <Card className="p-4 bg-muted/30">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm text-foreground">
          {t("unassignedStaff")} ({staff.length})
        </h3>
        <span className="text-xs text-muted-foreground">
          {t("dragStaffToSchedule")}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {staff.map((s) => (
          <Badge
            key={s.id}
            variant="outline"
            draggable
            onDragStart={(e) => onDragStart(e, s.id)}
            onDragEnd={onDragEnd}
            className={cn(
              "cursor-move transition-all hover:scale-105 hover:shadow-md px-3 py-2",
              DEPARTMENT_COLORS[s.department],
              draggedStaff === s.id && "opacity-50 scale-95"
            )}
          >
            <span className="font-medium">{s.name}</span>
            <span className="text-[10px] ml-2 opacity-70">
              ${s.hourly_rate.toFixed(2)}/hr
            </span>
          </Badge>
        ))}
      </div>
    </Card>
  );
}
