import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Building2, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Briefcase,
  TrendingUp,
  Shield
} from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">PlaceHub</span>
          </div>
          <Button asChild>
            <Link to="/auth">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Shield className="h-4 w-4" />
            Trusted by 500+ Companies
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Your Gateway to{' '}
            <span className="text-gradient">Dream Careers</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Connect with top recruiters, track applications in real-time, and land your dream job through our streamlined campus placement portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/auth">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Partner Companies', icon: Building2 },
              { value: '10,000+', label: 'Students Placed', icon: Users },
              { value: '95%', label: 'Placement Rate', icon: TrendingUp },
              { value: '₹25L+', label: 'Highest Package', icon: Briefcase },
            ].map((stat, i) => (
              <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools students and administrators need for a seamless placement experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Student Profiles',
                description: 'Complete your profile with academic details, skills, and resume to get matched with the right opportunities.',
              },
              {
                icon: Building2,
                title: 'Company Listings',
                description: 'Browse through verified company listings with detailed job descriptions, eligibility criteria, and deadlines.',
              },
              {
                icon: CheckCircle2,
                title: 'Smart Eligibility',
                description: 'Instantly see which companies you\'re eligible for based on your CPI, branch, and graduation year.',
              },
              {
                icon: Briefcase,
                title: 'One-Click Apply',
                description: 'Apply to multiple companies with a single click and track all your applications in one place.',
              },
              {
                icon: TrendingUp,
                title: 'Real-time Updates',
                description: 'Get instant notifications about application status changes, interview schedules, and more.',
              },
              {
                icon: Shield,
                title: 'Admin Dashboard',
                description: 'Powerful tools for administrators to manage companies, track applicants, and export data.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-soft transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-hero rounded-3xl p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Launch Your Career?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              Join thousands of students who have already found their dream jobs through PlaceHub.
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg px-8">
              <Link to="/auth">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">PlaceHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 PlaceHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
