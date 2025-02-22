import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { LoginCredentials } from '../types/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        ...credentials,
        options: {
          persistSession: rememberMe
        }
      });
      
      if (signInError) throw signInError;
      if (!data.user) throw new Error('No user data received');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!profile) {
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (adminProfile) {
          setError('Please use the admin login page');
          await supabase.auth.signOut();
          navigate('/admin/login');
          return;
        }

        throw new Error('Profile not found. Please try registering first.');
      }

      if (profileError) throw profileError;

      switch (profile.role) {
        case 'client':
          navigate('/dashboard/client');
          break;
        case 'writer':
          navigate('/dashboard/writer');
          break;
        default:
          throw new Error('Invalid user role');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[380px] sm:max-w-[420px]">
        <div className="relative bg-white/70 backdrop-blur-2xl rounded-2xl shadow-[0_8px_40px_rgb(0,0,0,0.12)] p-6 sm:p-8 transition-all duration-300">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 rounded-2xl" />
          
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-[2rem] font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                Welcome back
              </h1>
              <p className="text-base text-gray-600/90">
                Sign in to continue your journey
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {location.state?.message && (
                <div className="p-3 rounded-xl bg-green-50/80 border border-green-100 animate-fadeIn">
                  <p className="text-sm text-green-700">{location.state.message}</p>
                </div>
              )}
              
              {error && (
                <div className="p-3 rounded-xl bg-red-50/80 border border-red-100 animate-fadeIn">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="group">
                  <div className="relative rounded-xl bg-gray-50/50 transition-all duration-300 focus-within:bg-white hover:bg-white">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <Mail className="h-[18px] w-[18px] text-gray-400 transition-colors group-focus-within:text-blue-600" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-3 text-gray-900 text-base shadow-sm ring-1 ring-inset ring-gray-200/50 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all outline-none bg-transparent"
                      placeholder="Email address"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="group">
                  <div className="relative rounded-xl bg-gray-50/50 transition-all duration-300 focus-within:bg-white hover:bg-white">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <Lock className="h-[18px] w-[18px] text-gray-400 transition-colors group-focus-within:text-blue-600" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-3 text-gray-900 text-base shadow-sm ring-1 ring-inset ring-gray-200/50 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all outline-none bg-transparent"
                      placeholder="Password"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className="h-[18px] w-[18px] rounded-md border-2 border-gray-300 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-500 flex items-center justify-center">
                      {rememberMe && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-base text-gray-600 group-hover:text-gray-900 transition-colors">
                    Remember me
                  </span>
                </label>
                
                <Link 
                  to="/forgot-password" 
                  className="text-base font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 group overflow-hidden mt-6"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:8px_8px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="flex items-center">
                    <span>Sign in</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-base text-gray-600">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}