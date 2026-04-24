'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare, User, Mail, Lock, Loader2, Eye, EyeOff,
  ArrowLeft, Chrome,
} from 'lucide-react';
import AuthVisualPanel from '@/components/auth/AuthVisualPanel';

const GoogleSVG = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left — Visual Panel */}
      <AuthVisualPanel />

      {/* Right — Form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 pt-24 pb-12 bg-white relative overflow-y-auto"
      >
        {/* Back to Home */}
        <Link
          href="/"
          className="absolute top-6 left-6 sm:left-12 lg:left-16 xl:left-24 flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#25D366] transition-colors no-underline group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        <div className="w-full max-w-[420px] mx-auto">
          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-2 mb-8 no-underline">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-md shadow-green-600/20">
                <MessageSquare size={20} className="text-white" />
              </div>
              <span className="font-sans font-extrabold text-2xl text-gray-900 tracking-tight">WhatZupp</span>
            </Link>
            <h1 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Start your free enterprise trial today
            </p>
          </motion.div>

          {/* Google Sign Up */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <GoogleSVG />
              Continue with Google
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center gap-4 my-6"
          >
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="signup-name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="signup-email">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="signup-password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="signup-confirm">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms agreement */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]/30 cursor-pointer mt-0.5 accent-[#25D366]"
              />
              <label htmlFor="agreeTerms" className="text-[13px] text-gray-500 cursor-pointer select-none leading-relaxed">
                I agree to the{' '}
                <Link href="/privacy" className="text-[#25D366] hover:text-[#128C7E] no-underline font-medium">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#25D366] hover:text-[#128C7E] no-underline font-medium">Privacy Policy</Link>
              </label>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !agreedTerms}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold hover:shadow-lg hover:shadow-green-600/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-600/15 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2" size={20} />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </motion.form>

          {/* Footer Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#25D366] hover:text-[#128C7E] transition-colors no-underline">
              Sign in
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
