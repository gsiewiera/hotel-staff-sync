import { useState } from "react";
import { Card } from "@/components/ui/card";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { ShiftTemplates } from "@/components/ShiftTemplates";
import { Printer } from "lucide-react";
import { toast } from "sonner";

export interface StaffMember {
  id: number;
  name: string;
  department: string;
  shift: string;
  avatar: string;
  day?: string;
}

const INITIAL_STAFF: StaffMember[] = [
  { id: 1, name: "Sarah Johnson", department: "frontdesk", shift: "Morning", avatar: "SJ", day: "Monday" },
  { id: 2, name: "Michael Chen", department: "frontdesk", shift: "Evening", avatar: "MC", day: "Monday" },
  { id: 3, name: "Emma Williams", department: "housekeeping", shift: "Morning", avatar: "EW", day: "Tuesday" },
  { id: 4, name: "James Martinez", department: "housekeeping", shift: "Morning", avatar: "JM", day: "Wednesday" },
  { id: 5, name: "Lisa Anderson", department: "maintenance", shift: "Day", avatar: "LA", day: "Thursday" },
  { id: 6, name: "David Thompson", department: "restaurant", shift: "Split", avatar: "DT", day: "Friday" },
  { id: 7, name: "Sophie Brown", department: "restaurant", shift: "Evening", avatar: "SB", day: "Saturday" },
  { id: 8, name: "Ryan Davis", department: "frontdesk", shift: "Night", avatar: "RD", day: "Sunday" },
];

export function Schedule() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);

  const handleStaffDrop = (staffId: number, newDay: string, newShift: string) => {
    setStaff(prevStaff => 
      prevStaff.map(s => 
        s.id === staffId 
          ? { ...s, day: newDay, shift: newShift }
          : s
      )
    );
    
    const staffMember = staff.find(s => s.id === staffId);
    toast.success(`${staffMember?.name} moved to ${newDay} ${newShift} shift`);
  };

  const handleApplyTemplate = (staffId: number, pattern: { day: string; shift: string }[]) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;

    // Remove existing assignments for this staff member
    setStaff(prevStaff => prevStaff.filter(s => s.id !== staffId));

    // Add new assignments based on template
    const newAssignments = pattern.map((slot, idx) => ({
      ...staffMember,
      id: staffId + idx * 1000,
      day: slot.day,
      shift: slot.shift,
    }));

    setStaff(prevStaff => {
      const filtered = prevStaff.filter(s => s.id < 1000 || s.id % 1000 !== staffId);
      return [...filtered, ...newAssignments];
    });

    toast.success(`Applied template to ${staffMember.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Card className="flex-1 p-4 bg-accent/10 border-accent">
          <p className="text-sm text-foreground">
            <strong>💡 Tip:</strong> Drag and drop staff members to reassign them to different days and shifts
          </p>
        </Card>
        <div className="flex gap-2">
          <ShiftTemplates staff={staff} onApplyTemplate={handleApplyTemplate} />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>
      <WeeklyCalendar staff={staff} onStaffDrop={handleStaffDrop} />
    </div>
  );
}
