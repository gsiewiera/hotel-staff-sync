import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DollarSign, Edit2, Mail, Phone, MapPin } from "lucide-react";
import { StaffEditDialog } from "./StaffEditDialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface StaffMember {
  id: string;
  name: string;
  department: string;
  hourly_rate: number;
  avatar: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  date_of_birth?: string | null;
  hire_date?: string | null;
}

interface StaffCardProps {
  staff: StaffMember;
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
  const [editOpen, setEditOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setEditOpen(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <h3 className="mb-2 text-lg font-semibold text-foreground">{staff.name}</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium text-foreground">${staff.hourly_rate.toFixed(2)}/hr</span>
            </div>
            
            {staff.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{staff.email}</span>
              </div>
            )}
            
            {staff.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{staff.phone}</span>
              </div>
            )}
            
            {(staff.city || staff.address) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{staff.city || staff.address}</span>
              </div>
            )}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 w-full"
            onClick={() => setEditOpen(true)}
          >
            {t("viewDetails")}
          </Button>
        </div>
      </Card>

      <StaffEditDialog
        staff={staff}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={onUpdate}
      />
    </>
  );
}