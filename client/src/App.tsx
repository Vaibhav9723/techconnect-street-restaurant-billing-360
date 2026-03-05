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
import NotFound from "@/pages/not-found";
import { DesktopNavigation, MobileNavigation, MobileHeader } from "@/components/layout/navigation";
import SubscriptionExpiryModal from "@/components/ui/SubscriptionExpiryModal";
import AntiDebug from "@/components/security/AntiDebug";
import BlockScreenshot from "@/components/security/BlockScreenshot";
import Watermark from "@/components/security/Watermark";
import AntiTamper from "./components/security/AntiTamper";
import POSModeProvider from "./context/POSModeProvider";
import { useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { usePOSMode } from "@/context/POSModeContext";
import { useInitialOnlineSync } from "@/hooks/useInitialOnlineSync";

function AppContent() {
  const { user } = useFirebaseAuth();
  const mode = usePOSMode();
  useInitialOnlineSync();
  return <Router />;
}
function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

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

// function POSLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen bg-background">
//       <div className="hidden md:block">
//         <DesktopNavigation />
//       </div>

//       <main className="md:min-h-[calc(100vh-4rem)]">{children}</main>
//       <div className="md:hidden">
//         <MobileNavigation />
//       </div>
//     </div>
//   );
// }

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <FirebaseAuthProvider>
//           <AuthProvider>
//             <ThemeProvider>
//               {/* <AntiDebug />
//               <AntiTamper/>
//               <BlockScreenshot /> 
//               <Watermark /> */}
//               <div className="protected-content">
//                 <Router />
//               </div>
//               <SubscriptionExpiryModal />
//             </ThemeProvider>
//           </AuthProvider>
//         </FirebaseAuthProvider>
//         <Toaster />
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// }
// function AppContent() {
//   useInitialOnlineSync(); 
//   return <Router />;
// }
function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <DesktopNavigation />
      </div>

      {/* Page Content */}
      <main className="flex-1 md:min-h-[calc(100vh-4rem)] pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
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

            {/* 🔥 THIS WAS MISSING */}
            <POSModeProvider>

              <ThemeProvider>

                {/* testing ke liye off */}
                {/*
                <AntiDebug />
                <AntiTamper />
                <BlockScreenshot />
                <Watermark />
                */}

                {/* <div className="protected-content">
                  <Router />
                </div> */}
                <div className="protected-content">
                  <AppContent />
                </div>
                <SubscriptionExpiryModal />
              </ThemeProvider>
            </POSModeProvider>
          </AuthProvider>
        </FirebaseAuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}


export default App;
