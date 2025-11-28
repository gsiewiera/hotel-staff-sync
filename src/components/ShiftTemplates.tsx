import { useState } from "react";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StaffMember } from "@/pages/Schedule";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SHIFT_TEMPLATES = [
  {
    id: "full-week",
    name: "Full Week",
    description: "Same shift, Monday through Sunday",
    icon: Calendar,
    pattern: (shift: string) => DAYS.map(day => ({ day, shift })),
  },
  {
    id: "weekdays",
    name: "Weekdays Only",
    description: "Monday through Friday",
    icon: Clock,
    pattern: (shift: string) => 
      ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => ({ day, shift })),
  },
  {
    id: "weekends",
    name: "Weekends Only",
    description: "Saturday and Sunday",
    icon: Clock,
    pattern: (shift: string) => 
      ["Saturday", "Sunday"].map(day => ({ day, shift })),
  },
  {
    id: "alternating",
    name: "Alternating Days",
    description: "Monday, Wednesday, Friday, Sunday",
    icon: Calendar,
    pattern: (shift: string) => 
      ["Monday", "Wednesday", "Friday", "Sunday"].map(day => ({ day, shift })),
  },
  {
    id: "mid-week",
    name: "Mid Week",
    description: "Tuesday, Wednesday, Thursday",
    icon: Clock,
    pattern: (shift: string) => 
      ["Tuesday", "Wednesday", "Thursday"].map(day => ({ day, shift })),
  },
];

interface ShiftTemplatesProps {
  staff: StaffMember[];
  onApplyTemplate: (staffId: number, pattern: { day: string; shift: string }[]) => void;
}

export function ShiftTemplates({ staff, onApplyTemplate }: ShiftTemplatesProps) {
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("Morning");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    if (!selectedStaff || !selectedTemplate) return;

    const template = SHIFT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    const pattern = template.pattern(selectedShift);
    onApplyTemplate(parseInt(selectedStaff), pattern);
    
    // Reset and close
    setSelectedStaff("");
    setSelectedTemplate("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Apply Shift Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply Shift Template</DialogTitle>
          <DialogDescription>
            Quickly assign common shift patterns to staff members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Staff Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Staff Member</label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{s.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {s.department}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shift Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Shift Type</label>
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning (7AM-3PM)</SelectItem>
                <SelectItem value="Day">Day (8AM-4PM)</SelectItem>
                <SelectItem value="Evening">Evening (3PM-11PM)</SelectItem>
                <SelectItem value="Night">Night (11PM-7AM)</SelectItem>
                <SelectItem value="Split">Split Shift</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Template</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {SHIFT_TEMPLATES.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;
                
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      isSelected ? "ring-2 ring-primary bg-accent/20" : ""
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{template.name}</h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          {selectedTemplate && (
            <Card className="bg-muted/50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-foreground">Preview</h4>
              <div className="flex flex-wrap gap-2">
                {SHIFT_TEMPLATES.find(t => t.id === selectedTemplate)
                  ?.pattern(selectedShift)
                  .map((slot, idx) => (
                    <Badge key={idx} variant="secondary">
                      {slot.day} - {slot.shift}
                    </Badge>
                  ))}
              </div>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              disabled={!selectedStaff || !selectedTemplate}
            >
              Apply Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
