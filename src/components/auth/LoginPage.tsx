import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/contexts/UsersContext';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';
import { mapRole } from '@/lib/roles';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(() => localStorage.getItem('login_email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem('login_email'));
  const { login, isLoading } = useAuth();
  const { users } = useUsers();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      if (remember) {
        localStorage.setItem('login_email', email);
      } else {
        localStorage.removeItem('login_email');
      }
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in to MWSI HRIS.',
      });
      navigate('/');
    } catch {
      setError('Invalid email or password');
    }
  };

  const demoUsers = users
    .filter(u => ['admin', 'hr_manager', 'manager', 'employee', 'registry_manager', 'testing'].includes(u.role))
    .slice(0, 6)
    .map(u => ({ ...u, role: mapRole(u.role), password: 'demo123' }));


  const showForgotPassword = ['hr@mwsi.com', 'employee@mwsi.com'].includes(email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg shadow-md">
              <img src={logo} alt="MWSI Logo" className="h-8 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-bold">MWSI HRIS</h1>
                <p className="text-xs text-muted-foreground">HR Management System</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the HR system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@mwsi.com"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
                    onKeyDown={(e) => setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'))}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {capsLockOn && (
                  <p className="text-xs text-amber-600">Warning: Caps Lock is on</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoUsers.map((user, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail(user.email);
                    setPassword(user.password);
                  }}
                >
                  Use
                </Button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-center mt-2">
              Password for all demo accounts: demo123
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Ministry of Water, Irrigation and Sanitation – HRIS
          </div>
          <div className="mt-1">
            Need help? <button className="underline" type="button" onClick={() => navigate('/forgot-password')}>Reset Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};
