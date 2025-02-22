import React from 'react';
import { useNavigate } from 'react-router-dom';
import ComingSoon from '../../components/ComingSoon';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import type { AdminProfile } from '../../types/admin';

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<AdminProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/admin/login');
          return;
        }

        const { data, error } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (mounted) setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
        navigate('/admin/login');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title="Settings" 
      userFullName={profile.full_name}
      userIdentifier={profile.identifier}
      userRole="admin"
    >
      <ComingSoon 
        title="Settings" 
        description="Configure platform settings and preferences. The settings management system will be available soon."
      />
    </DashboardLayout>
  );
}