import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { FirebaseAuthProvider } from "@/hooks/useFirebaseAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "@/pages/dashboard";
import Billing from "@/pages/billing";
import Products from "@/pages/products";
import Categories from "@/pages/categories";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import ClientDashboard from "@/pages/client-dashboard";
import NotFound from "@/pages/not-found";
import { DesktopNavigation, MobileNavigation } from "@/components/layout/navigation";

function Router() {
  return (
    <Switch>
      {/* Public route - NOT wrapped in ProtectedRoute */}
      <Route path="/login" component={Login} />

      {/* Admin routes - role-specific protection */}
      <Route path="/admin/dashboard">
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      {/* Client routes - role-specific protection */}
      <Route path="/client/dashboard">
        <ProtectedRoute requiredRole="client">
          <ClientDashboard />
        </ProtectedRoute>
      </Route>

      {/* Protected POS routes - accessible to authenticated users (both admin and client) */}
      <Route path="/">
        <ProtectedRoute>
          <POSLayout>
            <Dashboard />
          </POSLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/billing">
        <ProtectedRoute>
          <POSLayout>
            <Billing />
          </POSLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/products">
        <ProtectedRoute>
          <POSLayout>
            <Products />
          </POSLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/categories">
        <ProtectedRoute>
          <POSLayout>
            <Categories />
          </POSLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <POSLayout>
            <Settings />
          </POSLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <DesktopNavigation />
      </div>

      <main className="md:min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FirebaseAuthProvider>
          <AuthProvider>
            <ThemeProvider>
              <Router />
            </ThemeProvider>
          </AuthProvider>
        </FirebaseAuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
