import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface AddStaffDialogProps {
  onStaffAdded: () => void;
}

export function AddStaffDialog({ onStaffAdded }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("frontdesk");
  const [hourlyRate, setHourlyRate] = useState("15.00");
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Please enter a valid hourly rate");
      return;
    }

    setSaving(true);
    try {
      const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase();
      
      const { error } = await supabase
        .from('staff_members')
        .insert({
          name: name.trim(),
          department,
          hourly_rate: rate,
          avatar,
        });

      if (error) throw error;

      toast.success(`${t("addedToStaff")} ${name}`);
      setOpen(false);
      setName("");
      setDepartment("frontdesk");
      setHourlyRate("15.00");
      onStaffAdded();
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error(t("failedToAddStaff"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("addStaff")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addNewStaffMember")}</DialogTitle>
          <DialogDescription>
            {t("addStaffDesc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">{t("filterByDepartment")}</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontdesk">{t("frontDesk")}</SelectItem>
                <SelectItem value="housekeeping">{t("housekeeping")}</SelectItem>
                <SelectItem value="maintenance">{t("maintenance")}</SelectItem>
                <SelectItem value="restaurant">{t("restaurant")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">{t("hourlyRate")} ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="15.00"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t("adding") : t("addStaff")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
