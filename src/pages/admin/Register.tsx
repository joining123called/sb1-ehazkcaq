import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { AdminRegisterCredentials } from '../../types/admin';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<AdminRegisterCredentials>({
    email: '',
    password: '',
    fullName: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (adminProfile) {
          navigate('/admin/dashboard');
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if email is already registered as an admin
      const { data: existingAdmin } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('email', credentials.email)
        .maybeSingle();

      if (existingAdmin) {
        throw new Error('This email is already registered as an admin. Please use a different email address.');
      }

      // Check if email is registered as a regular user
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', credentials.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('This email is already registered as a regular user. Please use a different email address.');
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (signUpError) {
        if (signUpError.message === 'User already registered') {
          throw new Error('This email is already registered. Please use a different email address.');
        }
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('No user data received');
      }

      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert([
          {
            user_id: authData.user.id,
            full_name: credentials.fullName,
            email: credentials.email,
          },
        ]);

      if (profileError) {
        await supabase.auth.signOut();
        throw profileError;
      }

      await supabase.auth.signOut();

      navigate('/admin/login', {
        state: {
          message: 'Registration successful! Please sign in with your credentials.'
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
      
      try {
        await supabase.auth.signOut();
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
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
                Admin Registration
              </h1>
              <p className="text-base text-gray-600/90">
                Create your admin account
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-xl bg-red-50/80 border border-red-100 animate-fadeIn">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="group">
                  <div className="relative rounded-xl bg-gray-50/50 transition-all duration-300 focus-within:bg-white hover:bg-white">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <User className="h-[18px] w-[18px] text-gray-400 transition-colors group-focus-within:text-blue-600" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      required
                      className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-3 text-gray-900 text-base shadow-sm ring-1 ring-inset ring-gray-200/50 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all outline-none bg-transparent"
                      placeholder="Full name"
                      value={credentials.fullName}
                      onChange={(e) => setCredentials(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                </div>

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
                      placeholder="Admin email address"
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
                      minLength={6}
                      className="block w-full rounded-xl border-0 py-3.5 pl-10 pr-3 text-gray-900 text-base shadow-sm ring-1 ring-inset ring-gray-200/50 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all outline-none bg-transparent"
                      placeholder="Password (minimum 6 characters)"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>
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
                    <span>Create admin account</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-base text-gray-600">
                  Already have an admin account?{' '}
                  <Link 
                    to="/admin/login" 
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Sign in
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