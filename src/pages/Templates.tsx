import { Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

export function Templates() {
  const templates = [
    { name: "Full Week", description: "Same shift, Monday through Sunday", icon: Calendar },
    { name: "Weekdays Only", description: "Monday through Friday", icon: Clock },
    { name: "Weekends Only", description: "Saturday and Sunday", icon: Clock },
    { name: "Alternating Days", description: "Monday, Wednesday, Friday, Sunday", icon: Calendar },
    { name: "Mid Week", description: "Tuesday, Wednesday, Thursday", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Shift Templates</h2>
        <p className="text-muted-foreground">
          Pre-defined shift patterns to quickly assign schedules. Use these templates from the Schedule view.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.name} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
