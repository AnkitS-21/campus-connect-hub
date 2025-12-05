import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Company, Profile, Application } from '@/types/database';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const StudentCompanies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
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

    // Fetch companies
    const { data: companiesData } = await supabase
      .from('companies')
      .select('*')
      .order('deadline', { ascending: true });
    
    setCompanies((companiesData || []) as Company[]);

    // Fetch applications
    const { data: applicationsData } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user!.id);
    
    setApplications((applicationsData || []) as Application[]);

    setLoading(false);
  };

  const checkEligibility = (company: Company): { eligible: boolean; reasons: string[] } => {
    if (!profile) return { eligible: false, reasons: ['Profile not completed'] };
    
    const reasons: string[] = [];

    // Check CPI
    if (company.min_cpi && profile.cpi && profile.cpi < company.min_cpi) {
      reasons.push(`Minimum CPI required: ${company.min_cpi}`);
    }

    // Check branch
    if (company.allowed_branches && company.allowed_branches.length > 0 && profile.branch) {
      if (!company.allowed_branches.includes(profile.branch)) {
        reasons.push(`Your branch is not eligible`);
      }
    }

    // Check minor
    if (company.allowed_minors && company.allowed_minors.length > 0 && profile.minor) {
      if (!company.allowed_minors.includes(profile.minor)) {
        reasons.push(`Your minor is not eligible`);
      }
    }

    // Check graduation year
    if (company.allowed_graduation_years && company.allowed_graduation_years.length > 0 && profile.graduation_year) {
      if (!company.allowed_graduation_years.includes(profile.graduation_year)) {
        reasons.push(`Graduation year ${profile.graduation_year} not eligible`);
      }
    }

    // Check deadline
    if (new Date(company.deadline) < new Date()) {
      reasons.push('Application deadline has passed');
    }

    // Check profile completion
    if (!profile.full_name || !profile.cpi || !profile.branch || !profile.graduation_year) {
      reasons.push('Please complete your profile first');
    }

    return { eligible: reasons.length === 0, reasons };
  };

  const hasApplied = (companyId: string) => {
    return applications.some(a => a.company_id === companyId);
  };

  const getApplicationStatus = (companyId: string) => {
    return applications.find(a => a.company_id === companyId)?.status;
  };

  const handleApply = async (companyId: string) => {
    setApplying(companyId);

    const { error } = await supabase
      .from('applications')
      .insert({
        user_id: user!.id,
        company_id: companyId,
        status: 'applied'
      });

    if (error) {
      toast.error('Failed to apply. Please try again.');
    } else {
      toast.success('Application submitted successfully!');
      fetchData();
    }

    setApplying(null);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground mt-1">
            Browse and apply to available opportunities
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No companies found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredCompanies.map((company) => {
            const { eligible, reasons } = checkEligibility(company);
            const applied = hasApplied(company.id);
            const status = getApplicationStatus(company.id);
            const isDeadlinePassed = new Date(company.deadline) < new Date();

            return (
              <Card key={company.id} className={`transition-all hover:shadow-soft ${!eligible && !applied ? 'opacity-75' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <CardDescription>{company.role}</CardDescription>
                      </div>
                    </div>
                    {applied ? (
                      <Badge className={
                        status === 'selected' ? 'bg-success/10 text-success' :
                        status === 'shortlisted' ? 'bg-warning/10 text-warning' :
                        status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                        'bg-info/10 text-info'
                      }>
                        {status?.charAt(0).toUpperCase() + status?.slice(1)}
                      </Badge>
                    ) : eligible ? (
                      <Badge className="bg-success/10 text-success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Eligible
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        <XCircle className="h-3 w-3 mr-1" />
                        Not Eligible
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{company.ctc}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{company.job_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(company.deadline), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  {company.min_cpi && (
                    <p className="text-xs text-muted-foreground">
                      Minimum CPI: {company.min_cpi}
                    </p>
                  )}

                  {!eligible && !applied && reasons.length > 0 && (
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                      <p className="text-xs text-destructive font-medium mb-1">Not eligible:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {reasons.map((reason, i) => (
                          <li key={i}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {company.jd_link && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={company.jd_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View JD
                        </a>
                      </Button>
                    )}
                    {applied ? (
                      <Button size="sm" disabled className="flex-1">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Applied
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!eligible || isDeadlinePassed || applying === company.id}
                        onClick={() => handleApply(company.id)}
                      >
                        {applying === company.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Apply Now'
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCompanies;
