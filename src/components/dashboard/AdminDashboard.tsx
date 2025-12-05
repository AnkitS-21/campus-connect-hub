import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Company, Application } from '@/types/database';
import { Building2, Users, FileText, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch companies
    const { data: companiesData } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    
    setCompanies((companiesData || []) as Company[]);

    // Fetch all applications
    const { data: applicationsData } = await supabase
      .from('applications')
      .select('*');
    
    setApplications((applicationsData || []) as Application[]);
    
    setLoading(false);
  };

  const activeCompanies = companies.filter(c => new Date(c.deadline) >= new Date()).length;
  const totalApplications = applications.length;
  const selectedCount = applications.filter(a => a.status === 'selected').length;

  // Get application counts per company
  const getCompanyStats = (companyId: string) => {
    const companyApps = applications.filter(a => a.company_id === companyId);
    return {
      total: companyApps.length,
      applied: companyApps.filter(a => a.status === 'applied').length,
      shortlisted: companyApps.filter(a => a.status === 'shortlisted').length,
      selected: companyApps.filter(a => a.status === 'selected').length,
    };
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage companies and track placement progress
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/companies">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-card border shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Total Companies</CardDescription>
            <CardTitle className="text-3xl font-bold">{companies.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 mr-1" />
              {activeCompanies} active
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Total Applications</CardDescription>
            <CardTitle className="text-3xl font-bold">{totalApplications}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-info">
              <FileText className="h-4 w-4 mr-1" />
              Across all companies
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Students Selected</CardDescription>
            <CardTitle className="text-3xl font-bold">{selectedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-success">
              <Users className="h-4 w-4 mr-1" />
              Placed successfully
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Conversion Rate</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {totalApplications > 0 ? Math.round((selectedCount / totalApplications) * 100) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-primary">
              <TrendingUp className="h-4 w-4 mr-1" />
              Selection rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent companies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Companies</CardTitle>
            <CardDescription>Latest companies added to the portal</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link to="/dashboard/companies">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No companies added yet</p>
              <Button className="mt-4" asChild>
                <Link to="/dashboard/companies">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Company
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {companies.slice(0, 5).map((company) => {
                const stats = getCompanyStats(company.id);
                const isActive = new Date(company.deadline) >= new Date();
                
                return (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{company.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {company.role} • {company.ctc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">Applications</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isActive 
                          ? 'bg-success/10 text-success' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isActive ? 'Active' : 'Closed'}
                      </div>
                    </div>
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

export default AdminDashboard;
