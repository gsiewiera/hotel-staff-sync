import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Schedule } from "./pages/Schedule";
import { Staff } from "./pages/Staff";
import { Templates } from "./pages/Templates";
import { Reports } from "./pages/Reports";
import NotFound from "./pages/NotFound";
import { Calendar, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <header className="border-b border-border bg-card sticky top-0 z-10 print:hidden">
                <div className="container mx-auto px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SidebarTrigger />
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                        <Calendar className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-foreground">Hotel Staff Scheduler</h1>
                        <p className="text-xs text-muted-foreground">Manage your team efficiently</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="gap-2">
                        <Users className="h-4 w-4" />
                        8 Staff
                      </Badge>
                      <Badge variant="outline" className="gap-2">
                        <Clock className="h-4 w-4" />
                        Week 47
                      </Badge>
                    </div>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 container mx-auto px-6 py-8">
                <Routes>
                  <Route path="/" element={<Schedule />} />
                  <Route path="/staff" element={<Staff />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
