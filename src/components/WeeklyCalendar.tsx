import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Staff {
  id: number;
  name: string;
  department: string;
  shift: string;
  avatar: string;
  day?: string;
}

interface WeeklyCalendarProps {
  staff: Staff[];
  onStaffDrop: (staffId: number, newDay: string, newShift: string) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = [
  { label: "Morning", time: "7AM-3PM", shift: "Morning" },
  { label: "Day", time: "8AM-4PM", shift: "Day" },
  { label: "Evening", time: "3PM-11PM", shift: "Evening" },
  { label: "Night", time: "11PM-7AM", shift: "Night" },
  { label: "Split", time: "Split Shift", shift: "Split" },
];

const DEPARTMENT_COLORS: Record<string, string> = {
  frontdesk: "bg-dept-frontdesk/20 border-dept-frontdesk text-dept-frontdesk",
  housekeeping: "bg-dept-housekeeping/20 border-dept-housekeeping text-dept-housekeeping",
  maintenance: "bg-dept-maintenance/20 border-dept-maintenance text-dept-maintenance",
  restaurant: "bg-dept-restaurant/20 border-dept-restaurant text-dept-restaurant",
};

export function WeeklyCalendar({ staff, onStaffDrop }: WeeklyCalendarProps) {
  const [draggedStaff, setDraggedStaff] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ day: string; shift: string } | null>(null);

  const getStaffForDayAndShift = (day: string, shift: string) => {
    return staff.filter(s => s.day === day && s.shift === shift);
  };

  const handleDragStart = (e: React.DragEvent, staffId: number) => {
    setDraggedStaff(staffId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("staffId", staffId.toString());
  };

  const handleDragEnd = () => {
    setDraggedStaff(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, day: string, shift: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget({ day, shift });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, day: string, shift: string) => {
    e.preventDefault();
    const staffId = parseInt(e.dataTransfer.getData("staffId"));
    
    if (staffId) {
      onStaffDrop(staffId, day, shift);
    }
    
    setDraggedStaff(null);
    setDropTarget(null);
  };

  const isDropTarget = (day: string, shift: string) => {
    return dropTarget?.day === day && dropTarget?.shift === shift;
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-border bg-muted/30">
              <div className="p-4 font-semibold text-foreground">Time Slot</div>
              {DAYS.map((day) => (
                <div key={day} className="border-l border-border p-4 text-center font-semibold text-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {TIME_SLOTS.map((slot, idx) => (
              <div key={slot.label} className={`grid grid-cols-8 ${idx !== TIME_SLOTS.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="border-r border-border bg-muted/20 p-4">
                  <div className="font-semibold text-foreground">{slot.label}</div>
                  <div className="text-xs text-muted-foreground">{slot.time}</div>
                </div>
                {DAYS.map((day) => {
                  const staffInSlot = getStaffForDayAndShift(day, slot.shift);
                  const isTarget = isDropTarget(day, slot.shift);
                  
                  return (
                    <div 
                      key={day} 
                      className={cn(
                        "border-l border-border p-3 transition-all min-h-[80px]",
                        isTarget && "bg-accent/20 ring-2 ring-accent ring-inset"
                      )}
                      onDragOver={(e) => handleDragOver(e, day, slot.shift)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day, slot.shift)}
                    >
                      <div className="text-[10px] text-muted-foreground mb-2 font-medium">
                        {slot.time}
                      </div>
                      <div className="space-y-1">
                        {staffInSlot.map((s) => (
                          <Badge
                            key={s.id}
                            variant="outline"
                            draggable
                            onDragStart={(e) => handleDragStart(e, s.id)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                              "w-full justify-start text-xs cursor-move transition-all",
                              DEPARTMENT_COLORS[s.department],
                              draggedStaff === s.id && "opacity-50 scale-95",
                              "hover:scale-105 hover:shadow-md"
                            )}
                          >
                            <span className="truncate">{s.name.split(' ')[0]}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Department Legend</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-dept-frontdesk/20 border-dept-frontdesk text-dept-frontdesk">
            Front Desk
          </Badge>
          <Badge variant="outline" className="bg-dept-housekeeping/20 border-dept-housekeeping text-dept-housekeeping">
            Housekeeping
          </Badge>
          <Badge variant="outline" className="bg-dept-maintenance/20 border-dept-maintenance text-dept-maintenance">
            Maintenance
          </Badge>
          <Badge variant="outline" className="bg-dept-restaurant/20 border-dept-restaurant text-dept-restaurant">
            Restaurant
          </Badge>
        </div>
      </Card>
    </div>
  );
}
