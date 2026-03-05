import { Link, useLocation } from 'wouter';
import { LayoutDashboard, ShoppingCart, Package, FolderOpen, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import logo from "@/assets/logo.png";

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/billing', label: 'Billing', icon: ShoppingCart },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/categories', label: 'Categories', icon: FolderOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function DesktopNavigation() {
  const [location, setLocation] = useLocation();
  const { user, logout,userProfile } = useFirebaseAuth();
  const { toast } = useToast();
  const isSmall = window.innerWidth < 768;

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

  <header className="h-16 border-b bg-background flex items-center justify-between px-3 md:px-4 lg:px-8 gap-2">
  {/* Left */}
  <div className="flex items-center gap-6">

    {/* Logo */}
    <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
      {/* <ShoppingCart className="h-5 w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 text-primary" />

      <h1 className="billing-logo text-sm md:text-base lg:text-xl font-bold text-primary">
        Billing 360
      </h1> */}
      <div className="flex items-center gap-2 whitespace-nowrap">
  <img
    src={logo}
    alt="logo"
    // className="h-8 md:h-9 lg:h-10 w-auto"
    // className="h-9 w-auto object-contain"
     className="h-12 md:h-12 lg:h-14 w-auto object-contain"
  />

  <span className="font-semibold text-sm md:text-base lg:text-lg">
    Billing 360°
  </span>
</div>
    </div>

    {/* Nav */}
    <nav className="hidden md:flex items-center gap-1 md:gap-1 lg:gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex items-center gap-1 lg:gap-2 rounded lg:rounded-lg  transition whitespace-nowrap",
              "px-2 md:px-2 lg:px-4 py-1 md:py-1 lg:py-2",
              "text-xs md:text-xs lg:text-sm",
              isActive
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-3 w-3 md:h-3 md:w-3 lg:h-4 lg:w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  </div>

  {/* Right */}
  <div className="flex items-center gap-2 md:gap-2 lg:gap-4">

  <div className="hidden md:block text-[10px] md:text-xs lg:text-sm text-muted-foreground tabular-nums">
    {new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}
  </div>

  {/* <Button variant="ghost" size="icon" className="h-7 w-7 md:h-7 md:w-7 lg:h-9 lg:w-9">
    <LogOut className="h-3 w-3 md:h-3 md:w-3 lg:h-4 lg:w-4" />
  </Button> */}
  <Button
  variant="ghost"
  size="icon"
  className="h-7 w-7 md:h-7 md:w-7 lg:h-9 lg:w-9"
  onClick={handleLogout}
>
  <LogOut className="h-3 w-3 md:h-3 md:w-3 lg:h-4 lg:w-4" />
</Button>

</div>
</header>
  );
}

export function MobileHeader() {
  const { logout } = useFirebaseAuth();

  return (
    <header className="md:hidden h-14 border-b bg-background flex items-center justify-between px-4">

      {/* Left Logo + Name */}
      {/* <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-primary" />

        <span className="billing-logo text-base font-semibold text-primary">
          Billing 360
        </span>
      </div> */}
<div className="flex items-center gap-2">
  <img
    src={logo}
    alt="Tech Connect 360"
    className="h-10 w-auto object-contain"
  />

  <span className="font-semibold text-sm">
    Billing 360°
  </span>
</div>
      {/* Right Logout */}
      <Button variant="ghost" size="icon" onClick={logout}>
        <LogOut className="h-5 w-5" />
      </Button>

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
