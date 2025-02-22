import React from 'react';
import { useNavigate } from 'react-router-dom';
import ComingSoon from '../../components/ComingSoon';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types/auth';

export default function Messages() {
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (mounted) setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
        navigate('/');
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
      title="Messages" 
      userFullName={profile.full_name}
      userIdentifier={profile.identifier}
      userRole={profile.role}
    >
      <ComingSoon 
        title="Messages" 
        description="The messaging system is being built. Soon you'll be able to communicate with writers and support staff here."
      />
    </DashboardLayout>
  );
}