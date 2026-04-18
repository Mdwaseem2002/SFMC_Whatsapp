import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-8">
          <Link href="/" className="text-[#8b5cf6] hover:underline flex items-center gap-2 text-sm font-medium">
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to Whatzupp for Business ("we", "our", or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our WhatsApp Business Platform services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>
            <p>
              When you use our services, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Account information (name, email address, password)</li>
              <li>WhatsApp Business API credentials</li>
              <li>Message content and metadata processed through our platform</li>
              <li>Contact lists and phone numbers you upload for messaging purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <p>
              We use the collected information for various purposes, including:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To provide, maintain, and monitor our services</li>
              <li>To route and deliver messages via the WhatsApp Business API</li>
              <li>To manage your account and provide customer support</li>
              <li>To fulfill legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Data Sharing and Disclosure</h2>
            <p>
              We integrate with Meta platforms and Salesforce Marketing Cloud. Data is shared with these third-party services exclusively to facilitate message delivery and tracking as explicitly configured by you. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@pentacloud.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
