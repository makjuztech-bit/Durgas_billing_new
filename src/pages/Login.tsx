import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Eye, EyeOff, Lock, User, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { API_URL } from '@/lib/config';
import { LanguageSwitch } from '@/components/layout/LanguageSwitch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner';

const branches = [
  { id: 'main', name: 'Main Branch - Kanchipuram' },
  { id: 'chennai', name: 'Chennai Branch' },
  { id: 'coimbatore', name: 'Coimbatore Branch' },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('main');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetForm, setResetForm] = useState({
    username: '',
    adminSecret: '',
    newPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(username, password, branch);
      if (success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials. Try: admin/vvcollection123');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetForm.username || !resetForm.adminSecret || !resetForm.newPassword) {
      toast.error('All fields are required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resetForm)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setIsForgotOpen(false);
        setResetForm({ username: '', adminSecret: '', newPassword: '' });
      } else {
        toast.error(data.message || 'Reset failed');
      }
    } catch (error) {
      toast.error('Error connecting to server');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cream silk-pattern flex flex-col">
      {/* Header with Language Switch */}
      <header className="flex justify-end p-4">
        <LanguageSwitch />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/90 backdrop-blur shadow-md mb-4 border border-amber-200">
              <img src="./logo.png" alt="Durgas" className="h-24 w-auto object-contain" />
            </div>
            <div className="text-xs font-bold text-amber-600 mb-0.5">
              துர்காஸ்
            </div>
            <h1 className="font-display text-3xl font-black text-foreground tracking-tight uppercase">
              DURGAS
            </h1>
            <p className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              EXCLUSIVE GOLD & DIAMOND JEWELLERY
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
              மக்களின் வருகையே எங்களின் வளர்ச்சி | FOR ALL AGES • SINCE 2026
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="font-display text-2xl text-center">
                {t('login.title')}
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t('login.username')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('login.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">{t('login.branch')}</Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger className="w-full">
                      <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : t('login.title')}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setIsForgotOpen(true)}
                  >
                    {t('login.forgot')}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                  Enter your username and the Master Admin Secret to reset your password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    placeholder="Enter username"
                    value={resetForm.username}
                    onChange={e => setResetForm({ ...resetForm, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={resetForm.newPassword}
                    onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Master Admin Secret</Label>
                  <Input
                    type="password"
                    placeholder="Enter admin secret key"
                    value={resetForm.adminSecret}
                    onChange={e => setResetForm({ ...resetForm, adminSecret: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsForgotOpen(false)}>Cancel</Button>
                <Button onClick={handleResetPassword}>Reset Password</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground">
        © 2024 Jewelry POS. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
