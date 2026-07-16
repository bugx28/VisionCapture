import { Camera, MapPin, Mail, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-100/50 border-t border-slate-200 pt-16 pb-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-md">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-display font-bold tracking-tight text-slate-900 italic">
                VISION<span className="text-slate-500">CAPTURE</span>
              </span>
            </div>
            <p className="text-slate-600 text-sm max-w-sm mb-6 leading-relaxed">
              India's premier AI data collection company specializing in high-quality egocentric data for Physical AI, robotics, and embodied intelligent systems.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-4">Services</h4>
            <ul className="space-y-3">
              <li><a href="#services" className="text-slate-600 hover:text-slate-900 text-sm transition-colors">Egocentric Video</a></li>
              <li><a href="#what-we-record" className="text-slate-600 hover:text-slate-900 text-sm transition-colors">Data Categories</a></li>
              <li><a href="#sample-data" className="text-slate-600 hover:text-slate-900 text-sm transition-colors">Sample Data</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-4">Contact</h4>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                <span>Headquarters<br/>Alwar, Rajasthan, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-900 shrink-0" />
                <a href="mailto:hello@visioncapture.ai" className="hover:text-slate-900 transition-colors">hello@visioncapture.ai</a>
              </li>
            </ul>
          </div>
          
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Vision Capture. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Ethical Data Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
