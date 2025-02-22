import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { sessionManager } from '../lib/session';
import type { Profile } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'client' | 'writer';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
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

        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error || !userProfile) {
          throw error || new Error('Profile not found');
        }

        if (mounted) {
          setProfile(userProfile);
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
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (profile.role !== allowedRole) {
    return <Navigate to={`/dashboard/${profile.role}`} replace />;
  }

  return children;
}