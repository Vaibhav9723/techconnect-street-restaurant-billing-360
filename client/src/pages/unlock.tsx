import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

export default function UnlockPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { unlock } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const success = await unlock(password);

    if (!success) {
      setError('Invalid master password');
      setPassword('');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">POS System</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter your master password to unlock
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-base"
              data-testid="input-master-password"
              autoFocus
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-xs text-destructive mt-1" data-testid="text-error">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={!password || isSubmitting}
            data-testid="button-unlock"
          >
            {isSubmitting ? 'Unlocking...' : 'Unlock'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Offline-first • End-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
