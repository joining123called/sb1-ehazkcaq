import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      // First verify if the email belongs to an admin
      const { data: adminProfile, error: adminError } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('user_id', (
          await supabase
            .from('auth.users')
            .select('id')
            .eq('email', email)
            .single ).data?.id)
        .single();

      if (adminError || !adminProfile) {
        throw new Error('This email is not registered as an admin account.');
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (resetError) throw resetError;
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
              <div className="flex justify-center mb-4">
                <ShieldCheck className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-[2rem] font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                Reset Admin Password
              </h1>
              <p className="text-base text-gray-600/90">
                Enter your admin email to receive a reset link
              </p>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-green-50/80 border border-green-100 animate-fadeIn">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Reset link sent
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Check your email for instructions to reset your password.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Link 
                  to="/admin/login"
                  className="relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition-all duration-300 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:8px_8px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <span>Back to admin login</span>
                  </div>
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 rounded-xl bg-red-50/80 border border-red-100 animate-fadeIn">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

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
                      placeholder="Enter your admin email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:8px_8px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="flex items-center">
                      <span>Send reset link</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  )}
                </button>

                <div className="flex items-center justify-center space-x-2 pt-4">
                  <ArrowLeft className="w-4 h-4 text-gray-500" />
                  <Link 
                    to="/admin/login" 
                    className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Back to admin login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}