import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Edit2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StaffCardProps {
  staff: {
    id: string;
    name: string;
    department: string;
    hourly_rate: number;
    avatar: string;
  };
  onUpdate: () => void;
}

const DEPARTMENT_CONFIG: Record<string, { label: string; colorClass: string }> = {
  frontdesk: { label: "Front Desk", colorClass: "bg-dept-frontdesk/10 text-dept-frontdesk border-dept-frontdesk/20" },
  housekeeping: { label: "Housekeeping", colorClass: "bg-dept-housekeeping/10 text-dept-housekeeping border-dept-housekeeping/20" },
  maintenance: { label: "Maintenance", colorClass: "bg-dept-maintenance/10 text-dept-maintenance border-dept-maintenance/20" },
  restaurant: { label: "Restaurant", colorClass: "bg-dept-restaurant/10 text-dept-restaurant border-dept-restaurant/20" },
};

export function StaffCard({ staff, onUpdate }: StaffCardProps) {
  const deptConfig = DEPARTMENT_CONFIG[staff.department];
  const [open, setOpen] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(staff.hourly_rate.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Please enter a valid hourly rate");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('staff_members')
        .update({ hourly_rate: rate })
        .eq('id', staff.id);

      if (error) throw error;

      toast.success(`Updated ${staff.name}'s hourly rate to $${rate.toFixed(2)}`);
      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating hourly rate:', error);
      toast.error("Failed to update hourly rate");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {staff.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={deptConfig.colorClass}>
              {deptConfig.label}
            </Badge>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Hourly Rate</DialogTitle>
                  <DialogDescription>
                    Update the hourly rate for {staff.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="15.00"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <h3 className="mb-2 text-lg font-semibold text-foreground">{staff.name}</h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium text-foreground">${staff.hourly_rate.toFixed(2)}/hr</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
