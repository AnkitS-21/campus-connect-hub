import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Profile, Company, Application } from '@/types/database';
import { Building2, FileText, CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();
    
    setProfile(profileData as Profile);

    // Fetch applications
    const { data: applicationsData } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user!.id);
    
    setApplications((applicationsData || []) as Application[]);

    // Fetch companies
    const { data: companiesData } = await supabase
      .from('companies')
      .select('*')
      .gte('deadline', new Date().toISOString());
    
    setCompanies((companiesData || []) as Company[]);
    
    setLoading(false);
  };

  const isProfileComplete = profile?.full_name && profile?.roll_no && profile?.cpi && profile?.branch && profile?.graduation_year;

  const appliedCount = applications.filter(a => a.status === 'applied').length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const selectedCount = applications.filter(a => a.status === 'selected').length;

  const statusConfig = {
    applied: { icon: Clock, color: 'bg-info/10 text-info', label: 'Applied' },
    shortlisted: { icon: AlertCircle, color: 'bg-warning/10 text-warning', label: 'Shortlisted' },
    rejected: { icon: XCircle, color: 'bg-destructive/10 text-destructive', label: 'Rejected' },
    selected: { icon: CheckCircle2, color: 'bg-success/10 text-success', label: 'Selected' },
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your placement journey
        </p>
      </div>

      {/* Profile completion alert */}
      {!isProfileComplete && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-foreground">Complete your profile</p>
                <p className="text-sm text-muted-foreground">
                  You need to complete your profile to apply for companies
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/dashboard/profile">
                Complete Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-card border shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Open Positions</CardDescription>
            <CardTitle className="text-3xl font-bold">{companies.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 mr-1" />
              Active companies
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Applied</CardDescription>
            <CardTitle className="text-3xl font-bold">{appliedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-info">
              <Clock className="h-4 w-4 mr-1" />
              Pending review
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Shortlisted</CardDescription>
            <CardTitle className="text-3xl font-bold">{shortlistedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-warning">
              <AlertCircle className="h-4 w-4 mr-1" />
              In progress
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Selected</CardDescription>
            <CardTitle className="text-3xl font-bold">{selectedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-success">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Offers received
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your latest job applications</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard/applications">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No applications yet</p>
              <Button className="mt-4" asChild>
                <Link to="/dashboard/companies">Browse Companies</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((application) => {
                const company = companies.find(c => c.id === application.company_id);
                const config = statusConfig[application.status as keyof typeof statusConfig];
                const Icon = config.icon;
                
                return (
                  <div
                    key={application.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {company?.name || 'Unknown Company'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {company?.role || 'Position'}
                        </p>
                      </div>
                    </div>
                    <Badge className={config.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
