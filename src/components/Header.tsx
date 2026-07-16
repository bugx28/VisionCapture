import { Camera, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Industries', href: '#what-we-record' },
    { name: 'Sample Data', href: '#sample-data' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 transition-all duration-300">
      <div className="bg-white/80 backdrop-blur-2xl border-t border-l border-white border-r border-slate-200/50 border-b border-slate-200/50 shadow-sm rounded-full px-6 sm:px-8 py-3">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                Vision
              </span>
            </a>
            
            <div className="hidden md:block w-px h-6 bg-slate-200" />

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="hover:text-slate-900 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100/50 border border-slate-200 text-slate-600 shadow-inner"
            >
              <div className={`p-1.5 rounded-full transition-colors ${!isDark ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-slate-200'}`}>
                <Sun className="w-3.5 h-3.5" />
              </div>
              <div className={`p-1.5 rounded-full transition-colors ${isDark ? 'bg-white text-slate-900 shadow-sm' : 'hover:bg-slate-200'}`}>
                <Moon className="w-3.5 h-3.5" />
              </div>
            </button>
            <a
              href="#contact"
              className="px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md font-semibold text-sm"
            >
              Get Started
            </a>
          </div>

          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl mx-2 overflow-hidden">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-base font-semibold text-slate-700 hover:text-slate-900 transition-colors px-2"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-slate-100">
              <a
                href="#contact"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-5 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-md"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
