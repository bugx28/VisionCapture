import { Menu, X, User } from 'lucide-react';
import logo from '../assets/logo.svg';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token') || !!localStorage.getItem('adminToken'));
  const [profileLink, setProfileLink] = useState(localStorage.getItem('adminToken') ? '/admin' : '/profile');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const adminToken = localStorage.getItem('adminToken');
      setIsLoggedIn(!!token || !!adminToken);
      setProfileLink(adminToken ? '/admin' : '/profile');
    };
    
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '/#services' },
    { name: 'Industries', href: '/#what-we-record' },
    { name: 'Sample Data', href: '/#sample-data' },
    { name: 'Careers', href: '/contributors' },
    { name: 'Contact', href: '/partner-with-us' },
  ];

  return (
    <header className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-full ${isScrolled
      ? 'top-6 max-w-7xl'
      : 'top-0 max-w-[1600px] pt-6 px-4 md:px-8'
      }`}>
      <div className={`transition-all duration-500 bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg ${isScrolled
        ? 'rounded-full px-6 sm:px-8 py-2'
        : 'rounded-3xl px-4 sm:px-6 py-2'
        }`}>
        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4 xl:gap-8">
            <Link to="/" className="flex items-center gap-2 xl:gap-3 group relative">
              <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img
                src={logo}
                alt="Vision Capture Logo"
                className="h-10 md:h-12 w-auto group-hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                style={{ mixBlendMode: 'multiply' }}
              />
              <span className="text-xl md:text-2xl font-display font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors z-10 relative">
                Vision <span className="text-slate-500">Capture</span>
              </span>
            </Link>

            <div className="hidden xl:block w-px h-6 bg-slate-200" />

            <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-600">
              {navLinks.map((link) => (
                link.href.startsWith('/') && !link.href.includes('#') ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {link.name}
                  </a>
                )
              ))}
            </nav>
          </div>

          <div className="hidden xl:flex items-center gap-4">
            <Link
              to="/contributors"
              className="relative group px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-cyan-500/50"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <span className="relative z-10 drop-shadow-md">Record to earn</span>
            </Link>

            <Link
              to="/partner-with-us"
              className="relative px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors font-semibold text-sm group overflow-hidden"
            >
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-full blur-[2px] transition-all duration-300"></div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-full transition-all duration-300"></div>
              <span className="relative z-10">Partner with us</span>
            </Link>

            {isLoggedIn ? (
              <Link
                to={profileLink}
                className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm ml-2"
                title="My Profile"
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to="/profile"
                className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 transition-colors font-semibold text-sm ml-2"
              >
                Login
              </Link>
            )}
          </div>

          <button
            className="xl:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden mt-4 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl mx-2 overflow-hidden">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              link.href.startsWith('/') && !link.href.includes('#') ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-semibold text-slate-700 hover:text-slate-900 transition-colors px-2"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-semibold text-slate-700 hover:text-slate-900 transition-colors px-2"
                >
                  {link.name}
                </a>
              )
            ))}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <Link
                to="/contributors"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold transition-colors shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              >
                Record to earn
              </Link>
              <Link
                to="/partner-with-us"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-5 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-md"
              >
                Partner with us
              </Link>
              <Link
                to={isLoggedIn ? profileLink : '/profile'}
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                {isLoggedIn ? 'My Profile' : 'Login'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
