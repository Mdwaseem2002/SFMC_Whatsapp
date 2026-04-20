import React from 'react';
import Link from 'next/link';
import { MessageSquare, Users2, BarChart3, Zap, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <MessageSquare size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">WhatZupp</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm shadow-blue-600/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Enterprise WhatsApp Engagement, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Simplified.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Manage multiple workspaces, contacts, and high-volume messaging campaigns from one powerful, secure platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 text-center">
              Start Free Trial
            </Link>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-center">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-2 shadow-2xl shadow-blue-900/5">
            <div className="rounded-xl overflow-hidden bg-white border border-slate-100 flex h-[400px] shadow-sm">
              {/* Fake Sidebar */}
              <div className="w-16 border-r border-slate-100 bg-slate-50 flex flex-col items-center py-4 gap-6 shrink-0">
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center mb-4"><MessageSquare size={16} /></div>
                <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center shadow-sm"><Users2 size={16} /></div>
                <div className="w-8 h-8 rounded text-slate-400 flex items-center justify-center"><BarChart3 size={16} /></div>
                <div className="w-8 h-8 rounded text-slate-400 flex items-center justify-center"><Zap size={16} /></div>
              </div>
              {/* Fake Content */}
              <div className="flex-1 p-8 bg-slate-50/50">
                <div className="h-8 w-48 bg-slate-200 rounded-md mb-8 animate-pulse" />
                <div className="grid grid-cols-3 gap-6">
                  <div className="h-32 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                     <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
                     <div className="h-8 w-16 bg-slate-200 rounded" />
                  </div>
                  <div className="h-32 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                     <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
                     <div className="h-8 w-16 bg-slate-200 rounded" />
                  </div>
                  <div className="h-32 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                     <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
                     <div className="h-8 w-16 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div className="flex flex-col items-center pt-8 md:pt-0">
            <span className="text-4xl font-bold text-white mb-2">10,000+</span>
            <span className="text-slate-400 font-medium">Businesses</span>
          </div>
          <div className="flex flex-col items-center pt-8 md:pt-0">
            <span className="text-4xl font-bold text-white mb-2">50M+</span>
            <span className="text-slate-400 font-medium">Messages Sent</span>
          </div>
          <div className="flex flex-col items-center pt-8 md:pt-0">
            <span className="text-4xl font-bold text-white mb-2">99.9%</span>
            <span className="text-slate-400 font-medium">Uptime Guarantee</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to scale.</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Purpose-built tools for enterprise teams to manage WhatsApp communications flawlessly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Users2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Workspace</h3>
              <p className="text-slate-600 leading-relaxed">Isolate contacts, chats, and templates across different teams, brands, or regions seamlessly.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Messaging</h3>
              <p className="text-slate-600 leading-relaxed">Lightning-fast two-way messaging with rich media support and read receipts.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Advanced Analytics</h3>
              <p className="text-slate-600 leading-relaxed">Gain deep insights into your engagement rates, response times, and campaign performance.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fast Reply Templates</h3>
              <p className="text-slate-600 leading-relaxed">Save time with customizable fast replies and automated message templates.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-6 group-hover:scale-110 transition-transform">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Enterprise Security</h3>
              <p className="text-slate-600 leading-relaxed">Bank-grade encryption and granular role-based access controls keep your data safe.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-6 group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">SFMC Integration</h3>
              <p className="text-slate-600 leading-relaxed">Natively sync with Salesforce Marketing Cloud for automated Journey Builder triggers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blue CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to transform your messaging?</h2>
          <p className="text-blue-100 text-lg mb-10">Join thousands of leading enterprises already using WhatZupp to engage their customers on WhatsApp.</p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
              <MessageSquare size={12} strokeWidth={3} />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">WhatZupp</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Pentacloud Consulting. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}