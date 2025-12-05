import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Company } from '@/types/database';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase,
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const branches = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Electronics & Communication',
  'Information Technology',
  'Biotechnology',
  'Aerospace Engineering',
];

const jobTypes = ['Full-time', 'Internship', 'Part-time', 'Contract'];

const AdminCompanies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    ctc: '',
    job_type: 'Full-time',
    location: '',
    jd_link: '',
    deadline: '',
    min_cpi: '',
    allowed_branches: [] as string[],
    allowed_graduation_years: [] as number[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const { data: companiesData } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    setCompanies((companiesData || []) as Company[]);

    // Get application counts
    const { data: applications } = await supabase
      .from('applications')
      .select('company_id');
    
    const counts: Record<string, number> = {};
    (applications || []).forEach((app: { company_id: string }) => {
      counts[app.company_id] = (counts[app.company_id] || 0) + 1;
    });
    setApplicationCounts(counts);

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      ctc: '',
      job_type: 'Full-time',
      location: '',
      jd_link: '',
      deadline: '',
      min_cpi: '',
      allowed_branches: [],
      allowed_graduation_years: [],
    });
    setEditingCompany(null);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      role: company.role,
      ctc: company.ctc,
      job_type: company.job_type,
      location: company.location,
      jd_link: company.jd_link || '',
      deadline: company.deadline.split('T')[0],
      min_cpi: company.min_cpi?.toString() || '',
      allowed_branches: company.allowed_branches || [],
      allowed_graduation_years: company.allowed_graduation_years || [],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) {
      toast.error('Failed to delete company');
    } else {
      toast.success('Company deleted successfully');
      fetchData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const companyData = {
      name: formData.name,
      role: formData.role,
      ctc: formData.ctc,
      job_type: formData.job_type,
      location: formData.location,
      jd_link: formData.jd_link || null,
      deadline: new Date(formData.deadline).toISOString(),
      min_cpi: formData.min_cpi ? parseFloat(formData.min_cpi) : null,
      allowed_branches: formData.allowed_branches.length > 0 ? formData.allowed_branches : null,
      allowed_graduation_years: formData.allowed_graduation_years.length > 0 ? formData.allowed_graduation_years : null,
      created_by: user!.id,
    };

    if (editingCompany) {
      const { error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', editingCompany.id);

      if (error) {
        toast.error('Failed to update company');
      } else {
        toast.success('Company updated successfully');
        setDialogOpen(false);
        resetForm();
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from('companies')
        .insert(companyData);

      if (error) {
        toast.error('Failed to add company');
      } else {
        toast.success('Company added successfully');
        setDialogOpen(false);
        resetForm();
        fetchData();
      }
    }

    setSaving(false);
  };

  const toggleBranch = (branch: string) => {
    setFormData(prev => ({
      ...prev,
      allowed_branches: prev.allowed_branches.includes(branch)
        ? prev.allowed_branches.filter(b => b !== branch)
        : [...prev.allowed_branches, branch]
    }));
  };

  const toggleYear = (year: number) => {
    setFormData(prev => ({
      ...prev,
      allowed_graduation_years: prev.allowed_graduation_years.includes(year)
        ? prev.allowed_graduation_years.filter(y => y !== year)
        : [...prev.allowed_graduation_years, year]
    }));
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
          <h1 className="text-3xl font-bold text-foreground">Manage Companies</h1>
          <p className="text-muted-foreground mt-1">
            Add and manage company listings
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCompany ? 'Edit Company' : 'Add New Company'}</DialogTitle>
                <DialogDescription>
                  {editingCompany ? 'Update company details' : 'Add a new company to the placement portal'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Google"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="Software Engineer"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctc">CTC/Stipend *</Label>
                    <Input
                      id="ctc"
                      value={formData.ctc}
                      onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                      placeholder="25 LPA"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type *</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Bangalore, India"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jd_link">JD Link</Label>
                    <Input
                      id="jd_link"
                      type="url"
                      value={formData.jd_link}
                      onChange={(e) => setFormData({ ...formData, jd_link: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_cpi">Minimum CPI</Label>
                    <Input
                      id="min_cpi"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.min_cpi}
                      onChange={(e) => setFormData({ ...formData, min_cpi: e.target.value })}
                      placeholder="7.0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allowed Branches (leave empty for all)</Label>
                  <div className="flex flex-wrap gap-2">
                    {branches.map((branch) => (
                      <Badge
                        key={branch}
                        variant={formData.allowed_branches.includes(branch) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleBranch(branch)}
                      >
                        {branch}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allowed Graduation Years (leave empty for all)</Label>
                  <div className="flex flex-wrap gap-2">
                    {[2024, 2025, 2026, 2027, 2028].map((year) => (
                      <Badge
                        key={year}
                        variant={formData.allowed_graduation_years.includes(year) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleYear(year)}
                      >
                        {year}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingCompany ? (
                      'Update Company'
                    ) : (
                      'Add Company'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
        <div className="grid gap-4">
          {filteredCompanies.map((company) => {
            const isActive = new Date(company.deadline) >= new Date();
            
            return (
              <Card key={company.id} className="hover:shadow-soft transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-7 w-7 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg text-foreground">{company.name}</h3>
                          <Badge className={isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                            {isActive ? 'Active' : 'Closed'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{company.role}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {company.ctc}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" />
                            {company.job_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {company.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(company.deadline), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center px-4 py-2 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-1 text-lg font-semibold text-foreground">
                          <Users className="h-4 w-4" />
                          {applicationCounts[company.id] || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Applications</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(company)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(company.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
  );
};

export default AdminCompanies;
