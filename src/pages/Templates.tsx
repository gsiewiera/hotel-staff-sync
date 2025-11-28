import { Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export function Templates() {
  const { t } = useLanguage();
  
  const templates = [
    { name: t("fullWeek"), description: t("fullWeekDesc"), icon: Calendar },
    { name: t("weekdaysOnly"), description: t("weekdaysOnlyDesc"), icon: Clock },
    { name: t("weekendsOnly"), description: t("weekendsOnlyDesc"), icon: Clock },
    { name: t("alternatingDays"), description: t("alternatingDaysDesc"), icon: Calendar },
    { name: t("midWeek"), description: t("midWeekDesc"), icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t("shiftTemplates")}</h2>
        <p className="text-muted-foreground">
          {t("shiftTemplatesDesc")}
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
