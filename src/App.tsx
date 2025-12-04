import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Schedule } from "./pages/Schedule";
import { Staff } from "./pages/Staff";
import { Templates } from "./pages/Templates";
import { Reports } from "./pages/Reports";
import { Budget } from "./pages/Budget";
import { Auth } from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Calendar, Users, Clock, Languages, LogOut, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { language, setLanguage, t } = useLanguage();
  const { user, role, signOut, loading } = useAuth();

  const getRoleLabel = () => {
    switch (role) {
      case "admin": return t("admin");
      case "manager": return t("manager");
      default: return t("staffRole");
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "admin": return "text-red-500";
      case "manager": return "text-blue-500";
      default: return "text-green-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
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
                    <h1 className="text-xl font-bold text-foreground">{t("appName")}</h1>
                    <p className="text-xs text-muted-foreground">{t("appTagline")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user && role && (
                    <Badge variant="outline" className={`gap-2 ${getRoleColor()}`}>
                      <Shield className="h-4 w-4" />
                      {getRoleLabel()}
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    8 {t("staff")}
                  </Badge>
                  <Badge variant="outline" className="gap-2">
                    <Clock className="h-4 w-4" />
                    {t("week")} 47
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Languages className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setLanguage("en")}
                        className={language === "en" ? "bg-accent" : ""}
                      >
                        🇬🇧 English
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setLanguage("pl")}
                        className={language === "pl" ? "bg-accent" : ""}
                      >
                        🇵🇱 Polski
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setLanguage("de")}
                        className={language === "de" ? "bg-accent" : ""}
                      >
                        🇩🇪 Deutsch
                      </DropdownMenuItem>
                      {user && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={signOut} className="text-destructive">
                            <LogOut className="h-4 w-4 mr-2" />
                            {t("logout")}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-6 py-8">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;