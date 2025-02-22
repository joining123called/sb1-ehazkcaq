import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { RegisterCredentials, UserRole } from '../types/auth';

export default function Register() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: '',
    password: '',
    fullName: '',
    role: 'client',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No user data received');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: authData.user.id,
            full_name: credentials.fullName,
            role: credentials.role,
          },
        ]);

      if (profileError) {
        await supabase.auth.signOut();
        throw profileError;
      }

      await supabase.auth.signOut();

      navigate('/', {
        state: {
          message: 'Registration successful! Please sign in with your credentials.'
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: { value: UserRole; label: string; sublabel: string }[] = [
    { 
      value: 'client', 
      label: 'Client', 
      sublabel: 'I need a writer'
    },
    { 
      value: 'writer', 
      label: 'Writer', 
      sublabel: 'I am a writer'
    },
  ];

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
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-[2rem] font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-base text-gray-600/90">
                Join us and start your journey
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-xl bg-red-50/80 border border-red-100 animate-fadeIn">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Choose your role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`
                          group relative overflow-hidden p-4 border rounded-xl transition-all duration-300
                          ${credentials.role === option.value
                            ? 'border-blue-500 bg-gradient-to-b from-blue-50/50 to-blue-100/50 shadow-sm shadow-blue-100'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-b hover:from-gray-50/50 hover:to-gray-100/50'
                          }
                        `}
                        onClick={() => setCredentials(prev => ({ ...prev, role: option.value }))}
                      >
                        {/* Decorative background pattern */}
                        <div className={`
                          absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:16px_16px]
                          opacity-0 transition-opacity duration-500
                          ${credentials.role === option.value ? 'opacity-100' : 'group-hover:opacity-100'}
                        `} />
                        
                        {/* Selection indicator */}
                        <div className={`
                          absolute top-2 right-2 h-2 w-2 rounded-full transition-all duration-300
                          ${credentials.role === option.value
                            ? 'bg-blue-500 scale-100'
                            : 'bg-gray-300 scale-75 group-hover:scale-90 group-hover:bg-blue-300'
                          }
                        `} />
                        
                        <div className="relative">
                          <span className={`
                            block text-base font-semibold mb-1 transition-colors duration-300
                            ${credentials.role === option.value ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'}
                          `}>
                            {option.label}
                          </span>
                          <span className={`
                            block text-sm transition-colors duration-300
                            ${credentials.role === option.value ? 'text-blue-600/80' : 'text-gray-500 group-hover:text-gray-600'}
                          `}>
                            {option.sublabel}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name */}
                <div className="group">
                  <div className="relative rounded-xl bg-gray-50/50 transition-all duration-300 focus-within:bg-white hover:bg-white">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <User className="h-[18px] w-[18px] text-gray-400 transition-colors group-focus-within:text-blue-600" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      required
                      className="block w-full rounded-xl border-0 py-3 pl-10 pr-3 text-gray-900 text-base shadow-sm ring-1 ring-inset ring-gray-200/50 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all outline-none bg-transparent"
                      placeholder="Full name"
                      value={credentials.fullName}
                      onChange={(e) => setCredentials(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <div className="relative rounded-xl bg-gray-50/50 transition-all duration-300 focus-within:bg-white hover:bg-white">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                      <Mail className="h-[18px] w-[18px] text-gray-400 transition-colors group-focus-within:text-blue-600" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      className="block w-full rounded-xl border-0 py-3 pl-10 pr-3 text-gray-900 text-base shadow-sm ring-1 ring-inset ring-gray-200/50 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all outline-none bg-transparent"
                      placeholder="Email address"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Password */}
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
                      className="block w-full rounded-xl border-0 py-3 pl-10 pr-3 text-gray-900 text-base shadow-sm ring-1 ring-inset ring-gray-200/50 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all outline-none bg-transparent"
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
                className="relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 group overflow-hidden mt-2"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:8px_8px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="flex items-center">
                    <span>Create account</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                )}
              </button>

              <div className="text-center">
                <p className="text-base text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    to="/" 
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