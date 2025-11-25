import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ShoppingCart, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClientDashboard() {
  const { user, logout } = useFirebaseAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
      setLocation('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  const navigateTo = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Client Dashboard</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* POS System Card */}
          <Card className="p-6 space-y-4 hover-elevate cursor-pointer" onClick={() => navigateTo('/')}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">POS System</h3>
                <p className="text-sm text-muted-foreground">Billing & Sales</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-pos">
              Open POS
            </Button>
          </Card>

          {/* Settings Card */}
          <Card className="p-6 space-y-4 hover-elevate cursor-pointer" onClick={() => navigateTo('/settings')}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <SettingsIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Settings</h3>
                <p className="text-sm text-muted-foreground">Configure System</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" data-testid="button-settings">
              Open Settings
            </Button>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Welcome, Client!</h2>
            <p className="text-muted-foreground">
              You have access to the POS system for billing and sales. Use the cards above to navigate.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
