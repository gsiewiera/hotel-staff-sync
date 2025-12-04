import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslationKey } from "@/lib/translations";

interface StaffAvailabilityProps {
  staffId: string;
}

interface AvailabilityRecord {
  id?: string;
  staff_id: string;
  day_of_week: string;
  is_available: boolean;
  preferred_shift?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  notes?: string | null;
}

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const SHIFTS = ["morning", "day", "evening", "night"];

export function StaffAvailability({ staffId }: StaffAvailabilityProps) {
  const { t } = useLanguage();
  const [availability, setAvailability] = useState<Record<string, AvailabilityRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();
  }, [staffId]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from("staff_availability")
        .select("*")
        .eq("staff_id", staffId);

      if (error) throw error;

      const availabilityMap: Record<string, AvailabilityRecord> = {};
      DAYS_OF_WEEK.forEach((day) => {
        const existing = data?.find((a) => a.day_of_week === day);
        availabilityMap[day] = existing || {
          staff_id: staffId,
          day_of_week: day,
          is_available: true,
        };
      });
      setAvailability(availabilityMap);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (day: string, updates: Partial<AvailabilityRecord>) => {
    const current = availability[day];
    const newRecord = { ...current, ...updates };
    
    setAvailability((prev) => ({ ...prev, [day]: newRecord }));

    try {
      if (current.id) {
        const { error } = await supabase
          .from("staff_availability")
          .update({
            is_available: newRecord.is_available,
            preferred_shift: newRecord.preferred_shift,
            start_time: newRecord.start_time,
            end_time: newRecord.end_time,
            notes: newRecord.notes,
          })
          .eq("id", current.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("staff_availability")
          .insert([{
            staff_id: staffId,
            day_of_week: day as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
            is_available: newRecord.is_available,
            preferred_shift: newRecord.preferred_shift,
            start_time: newRecord.start_time,
            end_time: newRecord.end_time,
            notes: newRecord.notes,
          }])
          .select()
          .single();
        if (error) throw error;
        setAvailability((prev) => ({ ...prev, [day]: { ...newRecord, id: data.id } }));
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability");
    }
  };

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading...</p>;
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-foreground">{t("weeklyAvailability")}</h4>
      {DAYS_OF_WEEK.map((day) => {
        const record = availability[day];
        return (
          <Card key={day} className="p-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium capitalize">{t(day as TranslationKey)}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {record?.is_available ? t("available") : t("unavailable")}
                  </span>
                  <Switch
                    checked={record?.is_available ?? true}
                    onCheckedChange={(checked) =>
                      updateAvailability(day, { is_available: checked })
                    }
                  />
                </div>
              </div>
              
              {record?.is_available && (
                <div className="grid gap-2 sm:grid-cols-3">
                  <Select
                    value={record?.preferred_shift || ""}
                    onValueChange={(value) =>
                      updateAvailability(day, { preferred_shift: value || null })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t("preferredShift")} />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIFTS.map((shift) => (
                        <SelectItem key={shift} value={shift}>
                          {t(shift as TranslationKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="time"
                    placeholder={t("startTime")}
                    className="h-8 text-xs"
                    value={record?.start_time || ""}
                    onChange={(e) =>
                      updateAvailability(day, { start_time: e.target.value || null })
                    }
                  />
                  <Input
                    type="time"
                    placeholder={t("endTime")}
                    className="h-8 text-xs"
                    value={record?.end_time || ""}
                    onChange={(e) =>
                      updateAvailability(day, { end_time: e.target.value || null })
                    }
                  />
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}