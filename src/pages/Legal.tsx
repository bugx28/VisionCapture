import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, FileText, HeartHandshake, ArrowLeft, Mail, CheckCircle2, AlertTriangle, Lock, Eye, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';

type LegalTab = 'privacy' | 'terms' | 'ethics';

export default function Legal() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<LegalTab>('privacy');

  useEffect(() => {
    const hash = location.hash.toLowerCase().replace('#', '');
    if (hash === 'terms' || hash === 'terms-of-service') {
      setActiveTab('terms');
    } else if (hash === 'ethics' || hash === 'ethical-guidelines' || hash === 'ethical-data-guidelines') {
      setActiveTab('ethics');
    } else if (hash === 'privacy' || hash === 'privacy-policy') {
      setActiveTab('privacy');
    }
    // Always scroll smoothly to top content when loading or switching legal sections
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.hash]);

  const handleTabChange = (tab: LegalTab) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `#${tab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSeoTitle = () => {
    switch (activeTab) {
      case 'privacy':
        return 'Privacy Policy | Vision Capture';
      case 'terms':
        return 'Terms of Service | Vision Capture';
      case 'ethics':
        return 'Ethical Data Guidelines | Vision Capture';
    }
  };

  const getSeoDescription = () => {
    switch (activeTab) {
      case 'privacy':
        return 'Learn how Vision Capture collects, uses, and safeguards contributor data and real-world video recordings for physical AI training.';
      case 'terms':
        return 'Review the Terms of Service governing participation, submissions, licensing, and payment cycles on the Vision Capture data platform.';
      case 'ethics':
        return 'Explore Vision Capture guidelines on bystander privacy, informed consent, safety, and responsible physical AI development.';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <SEO
        title={getSeoTitle()}
        description={getSeoDescription()}
        canonicalUrl={`https://visioncapture.in/legal#${activeTab}`}
      />

      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Shield className="w-3.5 h-3.5" /> Trust & Compliance
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Last Updated: October 2026
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Legal & Ethical Standards
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed">
            Vision Capture provides the foundational real-world visual data infrastructure for next-generation physical AI and robotics models. We uphold the highest standards of data integrity, informed consent, and contributor protection.
          </p>

          {/* Tab Navigation */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-6">
            <button
              onClick={() => handleTabChange('privacy')}
              className={`flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'privacy'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </button>
            <button
              onClick={() => handleTabChange('terms')}
              className={`flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'terms'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Terms of Service
            </button>
            <button
              onClick={() => handleTabChange('ethics')}
              className={`flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === 'ethics'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              Ethical Data Guidelines
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-10 leading-relaxed text-slate-700">

          {/* ========================================================================= */}
          {/* TAB 1: PRIVACY POLICY */}
          {/* ========================================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Privacy Policy</h2>
                <p className="text-slate-500 text-sm">
                  This policy outlines how Vision Capture collects, uses, protects, and discloses personal information and captured media from contributors and platform users.
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">1</span>
                  Information We Collect
                </h3>
                <p>
                  To administer data capture projects and disburse earnings, we collect information across three categories:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Account & Profile</h4>
                    <p className="text-xs text-slate-600">Full name, email address, international phone number, country, city, and native/spoken languages.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Payment & Payouts</h4>
                    <p className="text-xs text-slate-600">UPI ID, banking disbursement details, and optional cryptocurrency wallet addresses for international rewards.</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Technical & Hardware</h4>
                    <p className="text-xs text-slate-600">Device model (e.g. iPhone 11+), camera specifications, operating system, and IP address for security audits.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">2</span>
                  Video Recording & Optical Media Handling
                </h3>
                <p>
                  Contributors capture Point-of-View (POV) egocentric videos representing everyday tasks (cooking, tool handling, walking, object interaction). Our handling of this data adheres to strict safeguards:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
                  <li>
                    <strong>Focus on Hand-Object Interactions:</strong> Captures focus primarily on human-to-object physics and spatial kinematics, not on individuals' faces or personal identities.
                  </li>
                  <li>
                    <strong>Bystander Anonymization:</strong> Any inadvertent bystanders or incidental individuals visible in backgrounds undergo automated and manual blurring/de-identification before dataset packaging.
                  </li>
                  <li>
                    <strong>Prohibition of Sensitive Spaces:</strong> Recordings must never capture private documents, computer screens displaying passwords/credentials, credit cards, or private sanctuary spaces.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">3</span>
                  How We Use Your Data
                </h3>
                <p>We process collected data solely for the following legitimate purposes:</p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
                  <li>To review, curate, and format training datasets for physical AI, robotics manipulation, and computer vision systems.</li>
                  <li>To communicate project instructions, review feedback, rework requests, and project approval notices.</li>
                  <li>To verify contributor authenticity, calculate Trust Scores, and disburse scheduled earnings.</li>
                  <li>To maintain platform security, prevent fraudulent multi-accounting, and satisfy tax/accounting reporting rules.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">4</span>
                  Data Storage, Security & Retention
                </h3>
                <p>
                  We utilize enterprise cloud infrastructure protected by multi-tenant isolation, encrypted storage at rest (AES-256), and end-to-end TLS 1.3 transit encryption. Database access is strictly role-gated to authorized internal operators. Password hashes are permanently salted and hashed with bcrypt.
                </p>
                <p className="text-sm text-slate-600">
                  Personal profile details are retained for the duration of your active account. Approved training datasets are retained per client research commitments, stripped of direct personal identifiers.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">5</span>
                  Your Privacy Rights
                </h3>
                <p>
                  Regardless of your country of residence, you possess the right to:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Access and review all personal and payment information on file.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Request correction or immediate updating of payout or contact details.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Request account deletion and de-registration from our active registry.</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Withdraw consent for participation in future data collection tasks.</span>
                  </div>
                </div>
              </section>

              <section className="p-6 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-start gap-4">
                <Mail className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Privacy Contact</h4>
                  <p className="text-xs text-slate-600">
                    For privacy inquiries, data subject requests, or questions regarding our processing protocols, reach out directly to our Data Governance Officer at{' '}
                    <a href="mailto:info@visioncapture.in" className="text-blue-600 font-bold hover:underline">
                      info@visioncapture.in
                    </a>.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TERMS OF SERVICE */}
          {/* ========================================================================= */}
          {activeTab === 'terms' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Terms of Service</h2>
                <p className="text-slate-500 text-sm">
                  These Terms govern your access to and participation on the Vision Capture platform as a contributor, partner, or visitor.
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">1</span>
                  Eligibility & Contributor Account
                </h3>
                <p>
                  To register as a contributor, you must be at least 18 years of age (or the legal age of majority in your jurisdiction). By registering, you warrant that all information provided—including name, location, and hardware specifications—is authentic, current, and accurate.
                </p>
                <p className="text-sm text-slate-600">
                  Each contributor is permitted exactly one account. Creating duplicate accounts or utilizing automated tools to spoof applications will result in permanent ban and forfeiture of pending balances.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">2</span>
                  Project Application & Task Execution
                </h3>
                <p>
                  Participation in data collection projects requires prior approval:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
                  <li>
                    <strong>Project Guidelines:</strong> You must strictly follow project instructions, including recording angles, camera resolution, illumination, and specific physical actions.
                  </li>
                  <li>
                    <strong>Submission Verification:</strong> Project Managers inspect all submitted links for quality, authenticity, and compliance. PMs reserve the right to request reworks or reject submissions that fail to meet specifications.
                  </li>
                  <li>
                    <strong>Submission Prerequisite:</strong> Only contributors with an explicit, PM-approved Application status may submit work for that project.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">3</span>
                  Intellectual Property & Dataset Licensing
                </h3>
                <p>
                  By submitting video recordings and receiving the agreed monetary payment, you grant Vision Capture and its research affiliates an irrevocable, perpetual, worldwide, sublicensable, and royalty-free license to use, process, train upon, modify, and distribute the dataset for artificial intelligence, computer vision, and robotics development.
                </p>
                <p className="text-sm text-slate-600">
                  You represent and warrant that all submitted media consists solely of original content captured by you, and does not infringe upon third-party copyrights, trademarks, or proprietary trade secrets.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">4</span>
                  Payment Cycles & Compensation
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-3">
                  <h4 className="font-bold text-slate-900 text-sm mb-3">Bi-Weekly Payment Schedule</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-blue-600 font-bold block mb-1">Cycle 1</span>
                      Work submitted from <strong>1st – 15th</strong> of the month is reviewed, processed, and paid between the <strong>16th – 22nd</strong>.
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-blue-600 font-bold block mb-1">Cycle 2</span>
                      Work submitted from <strong>16th – 31st</strong> of the month is reviewed, processed, and paid between the <strong>1st – 7th</strong> of the following month.
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Payments are delivered via UPI, bank transfer, or designated rails. Contributors are responsible for providing correct disbursement coordinates and addressing local personal tax reporting requirements.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">5</span>
                  Code of Conduct & Termination
                </h3>
                <p className="text-sm text-slate-600">
                  We reserve the right to suspend or permanently terminate access for contributors who:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-xs text-slate-600">
                  <li>Submit synthetic, AI-generated, scraped, or stolen video footage.</li>
                  <li>Engage in abusive or threatening communication with Project Managers or staff.</li>
                  <li>Deliberately submit corrupt, broken, or empty video files to trigger payment credits.</li>
                  <li>Attempt to bypass platform access controls, security headers, or rate limits.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">6</span>
                  Limitation of Liability
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Vision Capture is provided on an "as is" and "as available" basis. To the maximum extent permitted by applicable law, Vision Capture and its officers shall not be liable for indirect, incidental, or consequential damages resulting from data capture tasks, hardware wear and tear, or third-party service disruptions.
                </p>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ETHICAL DATA GUIDELINES */}
          {/* ========================================================================= */}
          {activeTab === 'ethics' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Ethical Data Guidelines</h2>
                <p className="text-slate-500 text-sm">
                  Our moral imperative is ensuring that training datasets for physical AI and robotics are collected responsibly, safely, and with deep respect for human privacy.
                </p>
              </div>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">1</span>
                  Informed Consent & Personal Privacy
                </h3>
                <p>
                  Physical AI learns from human demonstration. We insist that every recording upholds fundamental human dignity:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-blue-600" /> Private Spaces
                    </h4>
                    <p className="text-xs text-slate-600">
                      Recordings in private residences or private properties require the unambiguous permission of the property owner or primary resident.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-blue-600" /> Bystander Protection
                    </h4>
                    <p className="text-xs text-slate-600">
                      Never record in environments where individuals possess a reasonable expectation of privacy. Incidental background pedestrians are de-identified.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">2</span>
                  Strictly Prohibited Recording Zones
                </h3>
                <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5">
                  <p className="text-xs text-red-900 font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    Capturing video in any of the following locations is strictly prohibited and constitutes an immediate violation:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-red-800 font-medium">
                    <li className="flex items-center gap-1.5">• Restrooms, locker rooms, or changing facilities</li>
                    <li className="flex items-center gap-1.5">• Hospitals, emergency rooms, or clinic treatment areas</li>
                    <li className="flex items-center gap-1.5">• Schools or daycare facilities where minors are present</li>
                    <li className="flex items-center gap-1.5">• Secure government, court, or military installations</li>
                    <li className="flex items-center gap-1.5">• Financial institutions or active ATM keypads</li>
                    <li className="flex items-center gap-1.5">• Any area with posted "No Photography/Video" notices</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">3</span>
                  Physical Safety First in All POV Tasks
                </h3>
                <p>
                  No data point is worth risking human physical safety. While executing egocentric recordings:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-slate-600">
                  <li>
                    <strong>Never Record While Operating Vehicles:</strong> Do not handle mobile devices or mount POV gear in a manner that obstructs vision or driver attention while operating automobiles, motorbikes, or heavy machinery.
                  </li>
                  <li>
                    <strong>Maintain Situational Awareness:</strong> When wearing chest or head rigs, stay alert to stairs, wet surfaces, moving equipment, and obstacles in your path.
                  </li>
                  <li>
                    <strong>Zero Hazardous Tasks:</strong> Never attempt tasks involving exposed high voltage, toxic materials, or dangerous heights beyond your normal qualified routines.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">4</span>
                  Responsible AI & Robotics Commitment
                </h3>
                <p className="text-sm text-slate-600">
                  Vision Capture is committed to peaceful, beneficial technological progress. All datasets curated on our platform are dedicated exclusively to:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                    <span className="font-bold text-emerald-900 text-sm block mb-1 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-emerald-600" /> Assistive Robotics
                    </span>
                    <p className="text-xs text-emerald-800">Domestic robotics, eldercare assistance, cooking, dishwashing, and sorting tasks.</p>
                  </div>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                    <span className="font-bold text-emerald-900 text-sm block mb-1 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-emerald-600" /> Industrial Safety
                    </span>
                    <p className="text-xs text-emerald-800">Warehouse manipulation, precision inventory sorting, and ergonomic assistance.</p>
                  </div>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                    <span className="font-bold text-emerald-900 text-sm block mb-1 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-emerald-600" /> Computer Vision
                    </span>
                    <p className="text-xs text-emerald-800">Spatial depth estimation, egocentric physics understanding, and hand-eye kinematics.</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 pt-2">
                  We strictly prohibit and reject any data collection intended for autonomous weapon systems, non-consensual biometric profiling, or mass state surveillance.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">5</span>
                  Fair & Transparent Compensation
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We believe that the humans powering artificial intelligence deserve equitable compensation, transparent project parameters, and respectful communication. Pay rates are clearly visible before applying to any project, payment timelines are published openly, and contributor feedback is treated with top priority.
                </p>
              </section>
            </div>
          )}

        </div>

        {/* Footer Support Card */}
        <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Have compliance or legal questions?</h4>
            <p className="text-xs sm:text-sm text-slate-500">
              Our data governance team is available to assist contributors, institutional researchers, and partners.
            </p>
          </div>
          <a
            href="mailto:info@visioncapture.in"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shrink-0"
          >
            <Mail className="w-4 h-4" /> Contact Legal Support
          </a>
        </div>
      </div>
    </div>
  );
}
