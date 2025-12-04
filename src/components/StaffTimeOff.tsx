import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, Calendar, Lock } from "lucide-react"
import { format } from "date-fns";

interface StaffTimeOffProps {
  staffId: string;
}

interface TimeOffRequest {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export function StaffTimeOff({ staffId }: StaffTimeOffProps) {
  const { t } = useLanguage();
  const { isManager } = useAuth();
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    fetchRequests();
  }, [staffId]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("time_off_requests")
        .select("*")
        .eq("staff_id", staffId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching time-off requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.start_date || !formData.end_date) {
      toast.error("Please select start and end dates");
      return;
    }

    try {
      const { error } = await supabase.from("time_off_requests").insert({
        staff_id: staffId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason || null,
      });

      if (error) throw error;

      toast.success(t("requestSubmitted"));
      setFormData({ start_date: "", end_date: "", reason: "" });
      setShowForm(false);
      fetchRequests();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request");
    }
  };

  const updateStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("time_off_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast.success(t("requestUpdated"));
      fetchRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from("time_off_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success(t("requestDeleted"));
      fetchRequests();
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("Failed to delete request");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-foreground">{t("timeOffRequests")}</h4>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t("newRequest")}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">{t("startDate")}</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">{t("endDate")}</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">{t("reason")}</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
              {t("cancel")}
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              {t("submitRequest")}
            </Button>
          </div>
        </Card>
      )}

      {requests.length === 0 ? (
        <Card className="p-6 text-center">
          <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("noTimeOffRequests")}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {requests.map((request) => (
            <Card key={request.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {format(new Date(request.start_date), "MMM d, yyyy")} -{" "}
                      {format(new Date(request.end_date), "MMM d, yyyy")}
                    </span>
                    <Badge variant="outline" className={getStatusColor(request.status)}>
                      {t(request.status)}
                    </Badge>
                  </div>
                  {request.reason && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {request.reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isManager ? (
                    <Select
                      value={request.status}
                      onValueChange={(value) =>
                        updateStatus(request.id, value as "pending" | "approved" | "rejected")
                      }
                    >
                      <SelectTrigger className="h-7 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t("pending")}</SelectItem>
                        <SelectItem value="approved">{t("approved")}</SelectItem>
                        <SelectItem value="rejected">{t("rejected")}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="h-7 text-xs flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      {t("managerOnly")}
                    </Badge>
                  )}
                  {isManager && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteRequest(request.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}