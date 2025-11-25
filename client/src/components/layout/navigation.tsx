import { Link, useLocation } from 'wouter';
import { LayoutDashboard, ShoppingCart, Package, FolderOpen, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/billing', label: 'Billing', icon: ShoppingCart },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/categories', label: 'Categories', icon: FolderOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function DesktopNavigation() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useFirebaseAuth();
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

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold">POS System</h1>
        </div>

        <nav className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'px-6 py-2 rounded-t-lg flex items-center gap-2 text-sm font-medium transition-colors hover-elevate',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground'
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="text-xs text-muted-foreground">
            {user.email}
          </div>
        )}
        <div className="text-xs text-muted-foreground tabular-nums" data-testid="text-current-time">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-nav-logout">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}

export function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background grid grid-cols-5 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              'flex flex-col items-center justify-center gap-1 h-full hover-elevate active-elevate-2',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
            data-testid={`nav-mobile-${item.label.toLowerCase()}`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
