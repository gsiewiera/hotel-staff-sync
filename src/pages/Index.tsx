import { useState } from "react";
import { Calendar, Users, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffCard } from "@/components/StaffCard";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";

const DEPARTMENTS = [
  { id: "all", name: "All Departments", color: "muted" },
  { id: "frontdesk", name: "Front Desk", color: "dept-frontdesk" },
  { id: "housekeeping", name: "Housekeeping", color: "dept-housekeeping" },
  { id: "maintenance", name: "Maintenance", color: "dept-maintenance" },
  { id: "restaurant", name: "Restaurant", color: "dept-restaurant" },
];

const MOCK_STAFF = [
  { id: 1, name: "Sarah Johnson", department: "frontdesk", shift: "Morning (7AM-3PM)", avatar: "SJ" },
  { id: 2, name: "Michael Chen", department: "frontdesk", shift: "Evening (3PM-11PM)", avatar: "MC" },
  { id: 3, name: "Emma Williams", department: "housekeeping", shift: "Morning (7AM-3PM)", avatar: "EW" },
  { id: 4, name: "James Martinez", department: "housekeeping", shift: "Morning (7AM-3PM)", avatar: "JM" },
  { id: 5, name: "Lisa Anderson", department: "maintenance", shift: "Day (8AM-4PM)", avatar: "LA" },
  { id: 6, name: "David Thompson", department: "restaurant", shift: "Split (11AM-2PM, 5PM-10PM)", avatar: "DT" },
  { id: 7, name: "Sophie Brown", department: "restaurant", shift: "Evening (5PM-11PM)", avatar: "SB" },
  { id: 8, name: "Ryan Davis", department: "frontdesk", shift: "Night (11PM-7AM)", avatar: "RD" },
];

const Index = () => {
  const [selectedDept, setSelectedDept] = useState("all");

  const filteredStaff = selectedDept === "all" 
    ? MOCK_STAFF 
    : MOCK_STAFF.filter(staff => staff.department === selectedDept);

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
                {MOCK_STAFF.length} Staff Members
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
            <WeeklyCalendar staff={MOCK_STAFF} />
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
