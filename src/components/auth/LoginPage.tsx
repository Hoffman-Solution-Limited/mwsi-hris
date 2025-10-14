import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in to MWSI HRIS.',
      });
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const demoUsers = [
    { email: 'admin@mwsi.com', role: 'Administrator', password: 'demo123' },
    { email: 'hr@mwsi.com', role: 'HR Manager', password: 'demo123' },
    { email: 'employee@mwsi.com', role: 'Employee', password: 'demo123' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg shadow-md">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">MWSI HRIS</h1>
                <p className="text-xs text-muted-foreground">HR Management System</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the HR system
            </CardDescription>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
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
      </div>
    </div>
  );
};