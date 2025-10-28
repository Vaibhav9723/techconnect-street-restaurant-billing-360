import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import UnlockPage from "@/pages/unlock";
import Dashboard from "@/pages/dashboard";
import Billing from "@/pages/billing";
import Products from "@/pages/products";
import Categories from "@/pages/categories";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { DesktopNavigation, MobileNavigation } from "@/components/layout/navigation";

function Router() {
  const { isUnlocked } = useAuth();

  if (!isUnlocked) {
    return <UnlockPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <DesktopNavigation />
      </div>

      <main className="md:min-h-[calc(100vh-4rem)]">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/billing" component={Billing} />
          <Route path="/products" component={Products} />
          <Route path="/categories" component={Categories} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
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
        <AuthProvider>
          <Router />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
