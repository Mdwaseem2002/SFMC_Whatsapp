'use client';

// src/app/dashboard/page.tsx
// Dashboard route: handles onboarding vs main app for authenticated users
import React, { useEffect, useState } from 'react';
import { WorkspaceProvider, useWorkspace } from '@/components/workspace/WorkspaceProvider';
import ProfileSetup from '@/components/onboarding/ProfileSetup';
import WorkspaceSetup from '@/components/onboarding/WorkspaceSetup';
import AppShell from '@/components/app/AppShell';

function AppRouter() {
  const { state, isReady } = useWorkspace();
  const [authInfo, setAuthInfo] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setAuthInfo({ name: data.user.name, email: data.user.email || '' });
        }
      })
      .catch(() => {});
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Onboarding flow
  if (!state.onboardingComplete) {
    if (state.activeScreen === 'onboarding-workspace') {
      return <WorkspaceSetup />;
    }
    return (
      <ProfileSetup
        initialName={authInfo?.name || ''}
        initialEmail={authInfo?.email || ''}
      />
    );
  }

  // Main app
  return <AppShell />;
}

export default function DashboardPage() {
  return (
    <WorkspaceProvider>
      <AppRouter />
    </WorkspaceProvider>
  );
}
