'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';
import { Truck, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { Input, Button } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Email/Name and password are required');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with email:', email);
      const response = await authApi.login(email, password);
      console.log('Login response:', response.data);

      // Save user and token
      login(response.data.user, response.data.token);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Check if it's a password/authentication error
      if (err.response?.status === 401) {
        setError('Incorrect email/name or password. Please try again.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Unable to login. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl border border-gray-100">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="p-3 sm:p-4 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-3 sm:mb-4">
            <Truck className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-2 text-center">Sign in to your Achir Bayron LLC account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Email or Name */}
          <Input
            label="Email or Name"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@company.com or your name"
            required
            autoFocus
          />

          {/* Password */}
          <div>
            <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 pr-12 transition"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-start gap-2 animate-shake">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm lg:text-base">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            fullWidth
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl !py-2.5 sm:!py-3 lg:!py-3.5"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 border-b-2 border-white mr-2"></div>
                <span className="text-sm sm:text-base lg:text-lg">Signing in...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                <span className="text-sm sm:text-base lg:text-lg">Sign In</span>
              </>
            )}
          </Button>
        </form>

        {/* Test Credentials Info */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm lg:text-base font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              Test Credentials
            </p>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="bg-white rounded p-2 sm:p-3">
                <p className="font-medium text-gray-900">Admin</p>
                <p className="text-gray-600 break-all">Email: <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] sm:text-xs lg:text-sm">admin@dts.local</code></p>
                <p className="text-gray-600">Password: <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] sm:text-xs lg:text-sm">password123</code></p>
              </div>
              <div className="bg-white rounded p-2 sm:p-3">
                <p className="font-medium text-gray-900">Client Admin</p>
                <p className="text-gray-600 break-all">Email: <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] sm:text-xs lg:text-sm">client@acme.local</code></p>
                <p className="text-gray-600">Password: <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] sm:text-xs lg:text-sm">password123</code></p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500">
            Contact your administrator for account access
          </p>
        </div>

        {/* Powered by */}
        <div className="mt-3 sm:mt-4 text-center">
          <p className="text-[10px] sm:text-xs lg:text-sm text-gray-400">
            Powered by Achir Bayron LLC © 2025
          </p>
        </div>
      </div>
    </div>
  );
}
