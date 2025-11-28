import { BarChart3, Users, Clock, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

export function Reports() {
  const stats = [
    { label: "Total Staff", value: "8", icon: Users, color: "text-blue-600" },
    { label: "This Week", value: "Week 47", icon: Calendar, color: "text-green-600" },
    { label: "Avg Hours", value: "38.5", icon: Clock, color: "text-orange-600" },
    { label: "Departments", value: "4", icon: BarChart3, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Reports & Analytics</h2>
        <p className="text-muted-foreground">
          View scheduling statistics and workforce analytics
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Department Distribution</h3>
        <div className="space-y-3">
          {[
            { dept: "Front Desk", count: 3, color: "bg-dept-frontdesk" },
            { dept: "Housekeeping", count: 2, color: "bg-dept-housekeeping" },
            { dept: "Maintenance", count: 1, color: "bg-dept-maintenance" },
            { dept: "Restaurant", count: 2, color: "bg-dept-restaurant" },
          ].map((item) => (
            <div key={item.dept} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{item.dept}</span>
                  <span className="text-sm text-muted-foreground">{item.count} staff</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color}`} 
                    style={{ width: `${(item.count / 8) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
