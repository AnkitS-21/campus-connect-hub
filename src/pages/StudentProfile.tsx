import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Profile } from '@/types/database';
import { User, Save, Loader2 } from 'lucide-react';

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

const minors = [
  'None',
  'Data Science',
  'Artificial Intelligence',
  'Finance',
  'Entrepreneurship',
  'Design',
  'Management',
];

const StudentProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<Profile>>({
    full_name: '',
    roll_no: '',
    email: '',
    cpi: null,
    branch: '',
    minor: '',
    resume_link: '',
    phone: '',
    graduation_year: null,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) {
      setProfile(data as Profile);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        roll_no: profile.roll_no,
        email: profile.email || user?.email,
        cpi: profile.cpi,
        branch: profile.branch,
        minor: profile.minor === 'None' ? null : profile.minor,
        resume_link: profile.resume_link,
        phone: profile.phone,
        graduation_year: profile.graduation_year,
      })
      .eq('user_id', user!.id);

    setSaving(false);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
    }
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
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Complete your profile to apply for companies
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  This information will be shared with recruiters
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roll_no">Roll Number *</Label>
                  <Input
                    id="roll_no"
                    value={profile.roll_no || ''}
                    onChange={(e) => setProfile({ ...profile, roll_no: e.target.value })}
                    placeholder="2021CS001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || user?.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="john@university.edu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpi">CPI *</Label>
                  <Input
                    id="cpi"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={profile.cpi || ''}
                    onChange={(e) => setProfile({ ...profile, cpi: parseFloat(e.target.value) || null })}
                    placeholder="8.50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduation_year">Graduation Year *</Label>
                  <Select
                    value={profile.graduation_year?.toString() || ''}
                    onValueChange={(value) => setProfile({ ...profile, graduation_year: parseInt(value) })}
                  >
                    <SelectTrigger id="graduation_year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027, 2028].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch *</Label>
                  <Select
                    value={profile.branch || ''}
                    onValueChange={(value) => setProfile({ ...profile, branch: value })}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minor">Minor</Label>
                  <Select
                    value={profile.minor || 'None'}
                    onValueChange={(value) => setProfile({ ...profile, minor: value })}
                  >
                    <SelectTrigger id="minor">
                      <SelectValue placeholder="Select minor" />
                    </SelectTrigger>
                    <SelectContent>
                      {minors.map((minor) => (
                        <SelectItem key={minor} value={minor}>
                          {minor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume_link">Resume Link</Label>
                <Input
                  id="resume_link"
                  type="url"
                  value={profile.resume_link || ''}
                  onChange={(e) => setProfile({ ...profile, resume_link: e.target.value })}
                  placeholder="https://drive.google.com/your-resume"
                />
                <p className="text-xs text-muted-foreground">
                  Link to your resume (Google Drive, Dropbox, etc.)
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
