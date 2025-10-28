import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Page not found
        </p>
        <Link href="/">
          <Button data-testid="button-go-home">
            <Home className="h-5 w-5 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
