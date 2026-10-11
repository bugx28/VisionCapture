import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ChevronRight, AlertCircle, PlayCircle, ExternalLink, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function EgocentricOnboarding() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [hasIphone, setHasIphone] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stepContentRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const totalSteps = 4;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/profile');
    }
  }, [navigate]);

  const scrollToTopContent = () => {
    if (window.innerWidth < 1024 && stepContentRef.current) {
      // On mobile, scroll specifically to the step card to bypass the stacked walkthrough video
      const headerOffset = 80;
      const elementPosition = stepContentRef.current.getBoundingClientRect().top;
      const scrollY = window.scrollY ?? window.pageYOffset;
      const offsetPosition = elementPosition + scrollY - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    } else {
      // On desktop, smoothly scroll to top of page so progress bar and step content are both in full view
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollToTopContent();
  }, [currentStep]);

  const handleComplete = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/profile');
        return;
      }
      const res = await fetch(`/api/applications/${applicationId}/onboarded`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete onboarding. Please try again.');
      }
      await queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      await queryClient.invalidateQueries({ queryKey: ['public-projects'] });
      navigate('/profile#my_projects', { state: { message: 'Onboarding completed successfully!' } });
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'An unexpected error occurred while completing onboarding.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Progress Bar */}
        <div className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Egocentric Video Onboarding</h1>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Section: Video */}
          <div className="w-full lg:w-1/3 flex-shrink-0">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-28">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-red-500" />
                Project Walkthrough
              </h3>
              <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-inner">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/idKjqS6TGcY"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                Please watch this video carefully to understand the data collection requirements, camera angles, and app setup instructions.
              </p>
            </div>
          </div>

          {/* Right Section: Steps */}
          <div ref={stepContentRef} className="w-full lg:w-2/3 scroll-mt-24">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[600px]">

              <AnimatePresence mode="wait">

                {/* STEP 1: Device Confirmation & App Download */}
                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Device Requirements</h2>

                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8">
                      <p className="text-slate-800 font-medium mb-6 text-lg">
                        This project requires iOS Devices only (e.g., iPhone 11 and above models only). Please confirm, do you have an iPhone device?
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => setHasIphone(true)}
                          className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${hasIphone === true ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}`}
                        >
                          <Check className="w-5 h-5" /> Yes, I have an iPhone
                        </button>
                        <button
                          onClick={() => setHasIphone(false)}
                          className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${hasIphone === false ? 'bg-red-500 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-red-300'}`}
                        >
                          No, I don't
                        </button>
                      </div>
                    </div>

                    {hasIphone === false && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-800 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-bold text-lg mb-1">Android not supported yet</h3>
                          <p>This project require IOS Devices only eg iPhone 11 and above models only. Android Devices are Considered in upcoming projects, thank you for your interest.</p>
                        </div>
                      </motion.div>
                    )}

                    {hasIphone === true && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="border-t border-slate-100 pt-6">
                          <h3 className="text-xl font-bold text-slate-900 mb-4">Download the Capture App</h3>
                          <a
                            href="https://apps.apple.com/app/id6755671397"
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white w-full sm:w-auto px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors mb-6"
                          >
                            Download from App Store <ExternalLink className="w-4 h-4" />
                          </a>

                          <div className="bg-slate-100 rounded-2xl p-4 overflow-hidden border border-slate-200 max-w-sm">
                            <img src="/onboarding/P1.webp" alt="Capture App Download" loading="lazy" decoding="async" className="w-full h-auto rounded-xl shadow-sm" />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end pt-8 gap-4">
                          <button onClick={() => setCurrentStep(2)} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                            Next Step <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2: Creating Account */}
                {currentStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Making account on Capture app</h2>

                    <div className="flex flex-wrap items-center gap-y-3 gap-x-2 mb-6 text-sm sm:text-base font-bold text-slate-700 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Download Atlas App</span>
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Select Business</span>
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Select Recorder</span>
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 ring-1 ring-blue-600">Enter access code : 7NUQXE</span>
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Continue with mail or google</span>
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Select task</span>
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Start recording</span>
                      <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Check all instructions and guidelines and start</span>
                    </div>

                    <p className="text-slate-600 mb-8 text-lg">
                      Open the app and make an account with the <strong>same email address</strong> you used on Vision Capture. Follow the steps shown below.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <div key={num} className="bg-slate-100 rounded-2xl p-2 border border-slate-200 relative group flex items-center justify-center">
                          <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-10 group-hover:scale-110 transition-transform">
                            {num}
                          </div>
                          <img src={`/onboarding/P${num}.webp`} alt={`Step ${num}`} loading="lazy" decoding="async" className="w-full h-auto rounded-xl shadow-sm relative z-0" />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-between pt-8 border-t border-slate-100 gap-4">
                      <button onClick={() => setCurrentStep(1)} className="w-full sm:w-auto text-slate-600 font-bold hover:text-slate-900 px-6 py-3 border border-slate-200 sm:border-transparent rounded-xl flex items-center justify-center">Back</button>
                      <button onClick={() => setCurrentStep(3)} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                        Next Step <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Robox Registration */}
                {currentStep === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Register On Robox App</h2>
                    <p className="text-slate-600 mb-6 text-lg">
                      You need to register only. Download the Robox app and sign up using Referral Code <strong>KEHRZU8FT1</strong>.
                    </p>

                    <a
                      href="https://play.google.com/store/apps/details?id=to.robox.robox&campaignid=web_share"
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white w-full sm:w-auto px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors mb-8"
                    >
                      Download Robox App <ExternalLink className="w-4 h-4" />
                    </a>

                    <div className="bg-slate-100 rounded-2xl p-4 overflow-hidden border border-slate-200 max-w-sm mb-8">
                      <img src="/onboarding/Robox.webp" alt="Robox App" loading="lazy" decoding="async" className="w-full h-auto rounded-xl shadow-sm" />
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl mb-8">
                      <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> Important Note
                      </h4>
                      <p className="text-amber-900 font-medium">
                        If you do not have an android Device to register on Robox, Please message the project manager. After messaging the project manager you can proceed further.
                      </p>
                      <button onClick={() => window.open('/profile#messages', '_blank')} className="mt-4 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <MessageSquare className="w-4 h-4" /> Message PM
                      </button>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-between pt-8 border-t border-slate-100 gap-4">
                      <button onClick={() => setCurrentStep(2)} className="w-full sm:w-auto text-slate-600 font-bold hover:text-slate-900 px-6 py-3 border border-slate-200 sm:border-transparent rounded-xl flex items-center justify-center">Back</button>
                      <button onClick={() => setCurrentStep(4)} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                        Next Step <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Payment Details & Completion */}
                {currentStep === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Payment Schedule & Final Steps</h2>

                    <div className="space-y-8">
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">1</span>
                          Payment Schedule
                        </h3>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto mb-6">
                          <table className="w-full text-left text-sm min-w-[320px]">
                            <thead className="bg-slate-100 text-slate-700">
                              <tr>
                                <th className="px-4 py-3 font-bold border-b border-slate-200">Work Submitted</th>
                                <th className="px-4 py-3 font-bold border-b border-slate-200">Processed & Paid</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              <tr>
                                <td className="px-4 py-3 text-slate-700">1st – 15th of the month</td>
                                <td className="px-4 py-3 text-slate-600 font-medium">Between the 16th – 22nd</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="px-4 py-3 text-slate-700">16th – 31st of the month</td>
                                <td className="px-4 py-3 text-slate-600 font-medium">Between the 1st – 7th of the following month</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <p className="text-slate-600 mb-4 font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-500" />
                          Please fill this google form by Vision Capture to confirm your details.
                        </p>
                        <a
                          href="https://forms.gle/qPztxXXHkWnBbVTi7"
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 bg-purple-100 text-purple-700 w-full sm:w-auto px-6 py-3 rounded-xl font-bold hover:bg-purple-200 transition-colors"
                        >
                          Open Google Form <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-3">2. Update your payment details</h3>
                        <p className="text-slate-600 mb-4">Please make sure to update your payment details from profile settings if not done already.</p>
                        <div className="bg-slate-100 rounded-2xl p-4 overflow-hidden border border-slate-200 max-w-lg mb-4">
                          <img src="/onboarding/payment.webp" alt="Payment Details" loading="lazy" decoding="async" className="w-full h-auto rounded-xl shadow-sm" />
                        </div>
                        <button onClick={() => window.open('/profile#profile', '_blank')} className="text-blue-600 font-bold hover:underline">
                          Go to Profile Settings
                        </button>
                      </div>
                    </div>

                    {submitError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2 mt-6">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row justify-between pt-8 border-t border-slate-100 mt-8 gap-4">
                      <button onClick={() => setCurrentStep(3)} className="w-full sm:w-auto text-slate-600 font-bold hover:text-slate-900 px-6 py-3 border border-slate-200 sm:border-transparent rounded-xl flex items-center justify-center">Back</button>
                      <button
                        onClick={handleComplete}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Complete Onboarding'} <Check className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
