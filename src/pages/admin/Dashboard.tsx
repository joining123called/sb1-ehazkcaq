import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { supabase } from '../../lib/supabase';
import type { AdminProfile } from '../../types/admin';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      title="Admin Dashboard" 
      userFullName={profile.full_name}
      userIdentifier={profile.identifier}
      userRole="admin"
    >
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Welcome back, {profile.full_name}</h2>
      </div>
    </DashboardLayout>
  );
}