import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Application, Company, Profile } from '@/types/database';
import { 
  Building2, 
  Download,
  User,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Loader2,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Applicants = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [applicants, setApplicants] = useState<(Application & { profile: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchApplicants();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    setCompanies((data || []) as Company[]);
    setLoading(false);
  };

  const fetchApplicants = async () => {
    setLoading(true);
    
    const { data: applicationsData } = await supabase
      .from('applications')
      .select('*')
      .eq('company_id', selectedCompany)
      .order('applied_at', { ascending: false });

    if (applicationsData && applicationsData.length > 0) {
      const userIds = applicationsData.map(a => a.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]));
      
      const enrichedApplicants = applicationsData.map(app => ({
        ...app,
        profile: profilesMap.get(app.user_id)!
      })).filter(app => app.profile) as (Application & { profile: Profile })[];

      setApplicants(enrichedApplicants);
    } else {
      setApplicants([]);
    }

    setLoading(false);
  };

  const updateStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingStatus(applicationId);
    
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated successfully');
      fetchApplicants();
    }

    setUpdatingStatus(null);
  };

  const exportToCSV = () => {
    if (applicants.length === 0) {
      toast.error('No applicants to export');
      return;
    }

    const company = companies.find(c => c.id === selectedCompany);
    const headers = ['Name', 'Roll No', 'Email', 'Phone', 'CPI', 'Branch', 'Minor', 'Graduation Year', 'Resume', 'Status', 'Applied At'];
    
    const rows = applicants.map(app => [
      app.profile.full_name || '',
      app.profile.roll_no || '',
      app.profile.email || '',
      app.profile.phone || '',
      app.profile.cpi?.toString() || '',
      app.profile.branch || '',
      app.profile.minor || '',
      app.profile.graduation_year?.toString() || '',
      app.profile.resume_link || '',
      app.status,
      format(new Date(app.applied_at), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${company?.name || 'applicants'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();

    toast.success('CSV exported successfully');
  };

  const statusOptions = [
    { value: 'applied', label: 'Applied', color: 'bg-info/10 text-info' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'bg-warning/10 text-warning' },
    { value: 'rejected', label: 'Rejected', color: 'bg-destructive/10 text-destructive' },
    { value: 'selected', label: 'Selected', color: 'bg-success/10 text-success' },
  ];

  if (authLoading) {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Applicants</h1>
            <p className="text-muted-foreground mt-1">
              View and manage student applications
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name} - {company.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCompany && applicants.length > 0 && (
              <Button onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {!selectedCompany ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a company to view applicants</p>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : applicants.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No applicants for this company yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {applicants.length} Applicant{applicants.length !== 1 ? 's' : ''}
              </CardTitle>
              <CardDescription>
                {companies.find(c => c.id === selectedCompany)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>CPI</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Graduation</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{applicant.profile.full_name || 'N/A'}</p>
                              {applicant.profile.resume_link && (
                                <a
                                  href={applicant.profile.resume_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  <FileText className="h-3 w-3" />
                                  Resume
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {applicant.profile.roll_no || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {applicant.profile.cpi || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {applicant.profile.branch || 'N/A'}
                        </TableCell>
                        <TableCell>{applicant.profile.graduation_year || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {applicant.profile.email && (
                              <a
                                href={`mailto:${applicant.profile.email}`}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                              >
                                <Mail className="h-3 w-3" />
                                {applicant.profile.email}
                              </a>
                            )}
                            {applicant.profile.phone && (
                              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {applicant.profile.phone}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={applicant.status}
                            onValueChange={(value) => updateStatus(applicant.id, value)}
                            disabled={updatingStatus === applicant.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <Badge className={option.color}>{option.label}</Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(applicant.applied_at), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Applicants;
