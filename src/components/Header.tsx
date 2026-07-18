import { Menu, X, Sun, Moon } from 'lucide-react';
import logo from '../assets/logo.svg';
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
    <header className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${isScrolled
        ? 'top-6 w-[95%] max-w-6xl'
        : 'top-0 w-full max-w-[1600px] pt-6 px-4 md:px-8'
      }`}>
      <div className={`transition-all duration-500 bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg ${isScrolled
          ? 'rounded-full px-6 sm:px-8 py-2'
          : 'rounded-3xl px-4 sm:px-6 py-2'
        }`}>
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-6">
            <a href="#" className="flex items-center gap-3 group">
              <img
                src={logo}
                alt="Vision Capture Logo"
                className="h-10 md:h-12 w-auto group-hover:scale-105 transition-transform"
              />
              <span className="text-xl md:text-2xl font-display font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                Vision <span className="text-slate-500">Capture</span>
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

            <a
              href="#contact"
              className="px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md font-semibold text-sm"
            >
              Start Your project
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
                Start Your project
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
