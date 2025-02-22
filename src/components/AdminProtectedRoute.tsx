import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sessionManager } from '../lib/session';
import type { AdminProfile } from '../types/admin';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        // Validate and refresh session
        const [isValidSession, isRefreshed] = await Promise.all([
          sessionManager.validateSession(),
          sessionManager.refreshSession()
        ]);

        if (!isValidSession || !isRefreshed) {
          if (mounted) setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          if (mounted) setLoading(false);
          return;
        }

        const { data: adminProfile, error } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error || !adminProfile) {
          throw error || new Error('Admin profile not found');
        }

        if (mounted) {
          setProfile(adminProfile);
        }
      } catch (error) {
        console.error('Auth error:', error);
        await sessionManager.endSession();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}