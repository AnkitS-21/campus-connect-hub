import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Application, Company } from '@/types/database';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

const Applications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<(Application & { company: Company })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    
    const { data: applicationsData } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user!.id)
      .order('applied_at', { ascending: false });

    if (applicationsData) {
      // Fetch companies for each application
      const companiesIds = applicationsData.map(a => a.company_id);
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .in('id', companiesIds);

      const companiesMap = new Map((companiesData || []).map(c => [c.id, c]));
      
      const enrichedApplications = applicationsData.map(app => ({
        ...app,
        company: companiesMap.get(app.company_id)!
      })).filter(app => app.company) as (Application & { company: Company })[];

      setApplications(enrichedApplications);
    }

    setLoading(false);
  };

  const statusConfig = {
    applied: { icon: Clock, color: 'bg-info/10 text-info border-info/20', label: 'Applied', description: 'Under review' },
    shortlisted: { icon: AlertCircle, color: 'bg-warning/10 text-warning border-warning/20', label: 'Shortlisted', description: 'Interview scheduled' },
    rejected: { icon: XCircle, color: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Rejected', description: 'Not selected' },
    selected: { icon: CheckCircle2, color: 'bg-success/10 text-success border-success/20', label: 'Selected', description: 'Offer received!' },
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground mt-1">
            Track the status of your job applications
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No applications yet</p>
              <p className="text-sm text-muted-foreground">
                Start applying to companies to see your applications here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const config = statusConfig[application.status as keyof typeof statusConfig];
              const Icon = config.icon;

              return (
                <Card key={application.id} className="hover:shadow-soft transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {application.company.name}
                          </h3>
                          <p className="text-muted-foreground">{application.company.role}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Applied on {format(new Date(application.applied_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${config.color}`}>
                        <Icon className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{config.label}</p>
                          <p className="text-xs opacity-80">{config.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Applications;
