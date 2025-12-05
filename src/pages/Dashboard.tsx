import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { GraduationCap } from 'lucide-react';

const Dashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft">
          <GraduationCap className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      {role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
    </DashboardLayout>
  );
};

export default Dashboard;
