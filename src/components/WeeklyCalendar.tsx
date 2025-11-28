import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Staff {
  id: string;
  name: string;
  department: string;
  shift: string;
  avatar: string;
  day?: string;
  hourly_rate: number;
}

interface WeeklyCalendarProps {
  staff: Staff[];
  onStaffDrop: (staffId: string, newDay: string, newShift: string, sourceDay?: string, sourceShift?: string) => void;
  draggedStaff: string | null;
  onDragStart: (staffId: string) => void;
  onDragEnd: () => void;
}

const SHIFT_HOURS: Record<string, number> = {
  Morning: 8,
  Day: 8,
  Evening: 8,
  Night: 8,
  Split: 6,
};

const DEPARTMENT_COLORS: Record<string, string> = {
  frontdesk: "bg-dept-frontdesk/20 border-dept-frontdesk text-dept-frontdesk",
  housekeeping: "bg-dept-housekeeping/20 border-dept-housekeeping text-dept-housekeeping",
  maintenance: "bg-dept-maintenance/20 border-dept-maintenance text-dept-maintenance",
  restaurant: "bg-dept-restaurant/20 border-dept-restaurant text-dept-restaurant",
};

export function WeeklyCalendar({ 
  staff, 
  onStaffDrop,
  draggedStaff,
  onDragStart,
  onDragEnd
}: WeeklyCalendarProps) {
  const [dropTarget, setDropTarget] = useState<{ day: string; shift: string } | null>(null);
  const { t } = useLanguage();

  const DAYS = [t("monday"), t("tuesday"), t("wednesday"), t("thursday"), t("friday"), t("saturday"), t("sunday")];
  const DAYS_EN = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  const TIME_SLOTS = [
    { label: t("morning"), time: t("morningTime"), shift: "Morning" },
    { label: t("day"), time: t("dayTime"), shift: "Day" },
    { label: t("evening"), time: t("eveningTime"), shift: "Evening" },
    { label: t("night"), time: t("nightTime"), shift: "Night" },
    { label: t("split"), time: t("splitTime"), shift: "Split" },
  ];

  const getStaffForDayAndShift = (day: string, shift: string) => {
    return staff.filter(s => s.day === day && s.shift === shift);
  };

  const getDailyCost = (dayTranslated: string) => {
    const dayIndex = DAYS.indexOf(dayTranslated);
    const dayEn = DAYS_EN[dayIndex];
    const staffOnDay = staff.filter(s => s.day === dayEn);
    return staffOnDay.reduce((total, s) => {
      const hours = SHIFT_HOURS[s.shift] || 8;
      return total + (s.hourly_rate * hours);
    }, 0);
  };

  const getShiftCost = (staffMember: Staff) => {
    const hours = SHIFT_HOURS[staffMember.shift] || 8;
    return staffMember.hourly_rate * hours;
  };

  const handleDragStart = (e: React.DragEvent, staffId: string, sourceDay?: string, sourceShift?: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("staffId", staffId.toString());
    e.dataTransfer.setData("sourceDay", sourceDay || "");
    e.dataTransfer.setData("sourceShift", sourceShift || "");
    onDragStart(staffId);
  };

  const handleDragEnd = () => {
    onDragEnd();
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
    const staffId = e.dataTransfer.getData("staffId");
    const sourceDay = e.dataTransfer.getData("sourceDay");
    const sourceShift = e.dataTransfer.getData("sourceShift");
    
    if (staffId) {
      // Convert translated day back to English for storage
      const dayIndex = DAYS.indexOf(day);
      const englishDay = DAYS_EN[dayIndex];
      
      // Pass source day/shift for proper state management
      onStaffDrop(staffId, englishDay, shift, sourceDay || undefined, sourceShift || undefined);
    }
    
    onDragEnd();
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
              <div className="p-4 font-semibold text-foreground">{t("timeSlot")}</div>
              {DAYS.map((day) => {
                const dayCost = getDailyCost(day);
                return (
                  <div key={day} className="border-l border-border p-4 text-center">
                    <div className="font-semibold text-foreground">{day}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ${dayCost.toFixed(2)}
                    </div>
                  </div>
                );
              })}
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
                        {staffInSlot.map((s) => {
                          const shiftCost = getShiftCost(s);
                          return (
                            <Badge
                              key={s.id}
                              variant="outline"
                              draggable
                              onDragStart={(e) => handleDragStart(e, s.id, s.day, s.shift)}
                              onDragEnd={handleDragEnd}
                              className={cn(
                                "w-full justify-between text-xs cursor-move transition-all px-2 py-1",
                                DEPARTMENT_COLORS[s.department],
                                draggedStaff === s.id && "opacity-50 scale-95",
                                "hover:scale-105 hover:shadow-md"
                              )}
                            >
                              <span className="truncate">{s.name.split(' ')[0]}</span>
                              <span className="text-[10px] font-medium ml-1">
                                ${shiftCost.toFixed(0)}
                              </span>
                            </Badge>
                          );
                        })}
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
        <h3 className="mb-3 text-sm font-semibold text-foreground">{t("departmentLegend")}</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-dept-frontdesk/20 border-dept-frontdesk text-dept-frontdesk">
            {t("frontDesk")}
          </Badge>
          <Badge variant="outline" className="bg-dept-housekeeping/20 border-dept-housekeeping text-dept-housekeeping">
            {t("housekeeping")}
          </Badge>
          <Badge variant="outline" className="bg-dept-maintenance/20 border-dept-maintenance text-dept-maintenance">
            {t("maintenance")}
          </Badge>
          <Badge variant="outline" className="bg-dept-restaurant/20 border-dept-restaurant text-dept-restaurant">
            {t("restaurant")}
          </Badge>
        </div>
      </Card>
    </div>
  );
}
