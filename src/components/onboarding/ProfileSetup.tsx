'use client';

// src/components/onboarding/ProfileSetup.tsx
// Onboarding Step 1: Set up user profile (name, email, phone, avatar)

import React, { useState, useRef } from 'react';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import type { UserProfile } from '@/types/workspace';
import { User, Mail, Phone, Camera } from 'lucide-react';

interface ProfileSetupProps {
  initialEmail?: string;
  initialName?: string;
}

export default function ProfileSetup({ initialEmail = '', initialName = '' }: ProfileSetupProps) {
  const { setProfile, setActiveScreen, state } = useWorkspace();

  const [name, setName] = useState(state.profile?.name || initialName);
  const [email, setEmail] = useState(state.profile?.email || initialEmail);
  const [phone, setPhone] = useState(state.profile?.phone || '');
  const [avatar, setAvatar] = useState(state.profile?.avatar || '');
  const fileRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialName && (!name || name === '')) setName(initialName);
    if (initialEmail && (!email || email === '')) setEmail(initialEmail);
  }, [initialName, initialEmail]);

  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const profile: UserProfile = {
      name: name.trim(), email: email.trim(),
      phone: phone.trim(), avatar,
    };
    setProfile(profile);
    setActiveScreen('onboarding-workspace');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-200 relative overflow-hidden">
      
      <div className="w-full max-w-md relative z-10">
        
        <div className="bg-white py-10 px-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 sm:px-12">
          
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-8">
            <div className="h-1 flex-1 rounded-full bg-blue-600 transition-all duration-300"></div>
            <div className="h-1 flex-1 rounded-full bg-slate-100 transition-all duration-300"></div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Set up your profile
            </h1>
            <p className="text-sm text-slate-500">
              Tell us about yourself to personalize your experience
            </p>
          </div>

          {/* Avatar Upload */}
          <div className="flex justify-center mb-8">
            <button 
              type="button" 
              onClick={() => fileRef.current?.click()} 
              className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 flex items-center justify-center overflow-hidden transition-all group"
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-slate-400 group-hover:text-blue-500 transition-colors">{initials}</span>
              )}
              
              <div className="absolute inset-x-0 bottom-0 top-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="text-white w-6 h-6" />
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={onSubmit}>
            
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="name">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-slate-50/50"
                  placeholder="you@company.com"
                  readOnly={!!initialEmail} // Lock if coming from auth
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="phone">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone size={18} />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm shadow-blue-600/20 mt-4"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
