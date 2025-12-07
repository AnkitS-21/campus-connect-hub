import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, ArrowRight, Shield, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type PortalType = 'select' | 'student' | 'admin';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [portal, setPortal] = useState<PortalType>('select');
  const { signUp, signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
  };

  const validateInput = () => {
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;
    
    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Account created successfully! You can now sign in.');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;
    
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft">
          <GraduationCap className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  // Portal Selection Screen
  if (portal === 'select') {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItNC0yLTQtNCAyLTQgMi00IDItMiA0LTIgNCAyIDQgMiAyIDQgMiA0cy0yIDItMiA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary-foreground/10 rounded-xl backdrop-blur-sm">
                <GraduationCap className="h-10 w-10" />
              </div>
              <span className="text-3xl font-bold">PlaceHub</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Your Gateway to<br />
              <span className="text-primary-foreground/90">Dream Careers</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Connect with top companies, track applications, and land your dream job through our streamlined campus placement portal.
            </p>
            <div className="mt-12 flex gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold">500+</div>
                <div className="text-sm text-primary-foreground/70">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">10K+</div>
                <div className="text-sm text-primary-foreground/70">Students Placed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">95%</div>
                <div className="text-sm text-primary-foreground/70">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Portal Selection */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md animate-fade-in">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-xl">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">PlaceHub</span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Portal</h2>
              <p className="text-muted-foreground">Select how you want to access the platform</p>
            </div>

            <div className="space-y-4">
              <Card 
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 group"
                onClick={() => { setPortal('student'); resetForm(); }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground">Student Portal</h3>
                      <p className="text-sm text-muted-foreground">Sign up or log in to browse companies and apply</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg hover:border-secondary/50 transition-all duration-300 group"
                onClick={() => { setPortal('admin'); resetForm(); }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors">
                      <Shield className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground">Admin Portal</h3>
                      <p className="text-sm text-muted-foreground">Manage companies and view applicants</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student Portal
  if (portal === 'student') {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItNC0yLTQtNCAyLTQgMi00IDItMiA0LTIgNCAyIDQgMiAyIDQgMiA0cy0yIDItMiA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary-foreground/10 rounded-xl backdrop-blur-sm">
                <GraduationCap className="h-10 w-10" />
              </div>
              <span className="text-3xl font-bold">PlaceHub</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Student Portal
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Create your profile, explore opportunities, and apply to your dream companies with just one click.
            </p>
            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <div className="h-2 w-2 rounded-full bg-primary-foreground/60"></div>
                <span>Browse 500+ company listings</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <div className="h-2 w-2 rounded-full bg-primary-foreground/60"></div>
                <span>Auto-check eligibility criteria</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <div className="h-2 w-2 rounded-full bg-primary-foreground/60"></div>
                <span>Track your application status</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Student Auth */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md animate-fade-in">
            <Button 
              variant="ghost" 
              className="mb-4" 
              onClick={() => { setPortal('select'); resetForm(); }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-xl">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">Student Portal</span>
            </div>

            <Card className="border-0 shadow-soft bg-card">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  Student Access
                </CardTitle>
                <CardDescription className="text-center">
                  Sign in or create your student account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-signin-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="student-signin-email"
                            type="email"
                            placeholder="you@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-signin-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="student-signin-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="student-signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="student-signup-email"
                            type="email"
                            placeholder="you@university.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="student-signup-password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create Account'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        By signing up, you agree to our Terms of Service
                      </p>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Admin Portal (Login Only)
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMiAyLTQgMi00cy0yLTItNC0yLTQtMi00LTQgMi00IDItNCAyLTIgNC0yIDQgMiA0IDIgMiA0IDIgNHMtMiAyLTIgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Shield className="h-10 w-10" />
            </div>
            <span className="text-3xl font-bold">PlaceHub Admin</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Admin Portal
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Manage company listings, review applications, and oversee the placement process.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-2 w-2 rounded-full bg-white/60"></div>
              <span>Add and manage companies</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-2 w-2 rounded-full bg-white/60"></div>
              <span>View all applicants by company</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-2 w-2 rounded-full bg-white/60"></div>
              <span>Update application statuses</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-2 w-2 rounded-full bg-white/60"></div>
              <span>Export applicant data to CSV</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Admin Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => { setPortal('select'); resetForm(); }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-secondary/10 rounded-xl">
              <Shield className="h-8 w-8 text-secondary" />
            </div>
            <span className="text-2xl font-bold text-foreground">Admin Portal</span>
          </div>

          <Card className="border-0 shadow-soft bg-card">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-secondary" />
                Admin Login
              </CardTitle>
              <CardDescription className="text-center">
                Sign in with your admin credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In as Admin'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Admin accounts are created by system administrators
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
