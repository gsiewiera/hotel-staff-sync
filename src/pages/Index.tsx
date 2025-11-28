import { useState } from "react";
import { Calendar, Users, Clock, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffCard } from "@/components/StaffCard";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { toast } from "sonner";

export interface StaffMember {
  id: number;
  name: string;
  department: string;
  shift: string;
  avatar: string;
  day?: string;
}

const DEPARTMENTS = [
  { id: "all", name: "All Departments", color: "muted" },
  { id: "frontdesk", name: "Front Desk", color: "dept-frontdesk" },
  { id: "housekeeping", name: "Housekeeping", color: "dept-housekeeping" },
  { id: "maintenance", name: "Maintenance", color: "dept-maintenance" },
  { id: "restaurant", name: "Restaurant", color: "dept-restaurant" },
];

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

const Index = () => {
  const [selectedDept, setSelectedDept] = useState("all");
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);

  const filteredStaff = selectedDept === "all" 
    ? staff 
    : staff.filter(s => s.department === selectedDept);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                <Calendar className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Hotel Staff Scheduler</h1>
                <p className="text-sm text-muted-foreground">Manage your team's schedule efficiently</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                {staff.length} Staff Members
              </Badge>
              <Badge variant="outline" className="gap-2">
                <Clock className="h-4 w-4" />
                Week 47, 2025
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="staff">Staff List</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="flex items-center justify-between gap-4 print:hidden">
              <Card className="flex-1 p-4 bg-accent/10 border-accent">
                <p className="text-sm text-foreground">
                  <strong>💡 Tip:</strong> Drag and drop staff members to reassign them to different days and shifts
                </p>
              </Card>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print Schedule
              </button>
            </div>
            <WeeklyCalendar staff={staff} onStaffDrop={handleStaffDrop} />
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            {/* Department Filter */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Filter by Department</h3>
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

            {/* Staff Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStaff.map((staff) => (
                <StaffCard key={staff.id} staff={staff} />
              ))}
            </div>

            {filteredStaff.length === 0 && (
              <Card className="p-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No staff members in this department</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
