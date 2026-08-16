import { Menu, X, User, Bell, Sun, Moon } from 'lucide-react';
import logo from '../assets/logo.svg';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Modal, { ModalProps } from './Modal';

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91.08,65.69,84.69,65.69Z"/>
  </svg>
);

export default function Header() {
  const location = useLocation();
  const hideAuthButtons = location.pathname.startsWith('/admin') || location.pathname.startsWith('/project-manager');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token') || !!localStorage.getItem('adminToken') || !!localStorage.getItem('pmToken'));
  const [profileLink, setProfileLink] = useState(localStorage.getItem('adminToken') ? '/admin' : localStorage.getItem('pmToken') ? '/project-manager' : '/profile');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [modalConfig, setModalConfig] = useState<ModalProps>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    variant: 'info',
    onClose: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
  });

  const showModal = (title: string, message: string, variant: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setModalConfig(prev => ({
      ...prev,
      isOpen: true,
      title,
      message,
      variant,
      type: 'alert'
    }));
  };

  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('theme-dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('theme-dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('theme-dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const isRegularUser = isLoggedIn && profileLink === '/profile';

  const fetchNotifications = () => {
    if (isRegularUser) {
      const token = localStorage.getItem('token');
      fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length);
          }
        }).catch(err => console.error(err));
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [isRegularUser]);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const adminToken = localStorage.getItem('adminToken');
      const pmToken = localStorage.getItem('pmToken');
      setIsLoggedIn(!!token || !!adminToken || !!pmToken);
      setProfileLink(adminToken ? '/admin' : pmToken ? '/project-manager' : '/profile');
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
              {isRegularUser ? (
                <>
                  <Link to="/profile#available" className="hover:text-slate-900 transition-colors font-bold text-blue-600">
                    Available Projects
                  </Link>
                  <a 
                    href="https://t.me/visioncaptureai" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:scale-110 transition-transform rounded-full"></span>
                    <span className="relative flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.676c.223-.22-.05-.341-.346-.145l-6.4 4.026-2.76-.86c-.6-.188-.611-.6.126-.89l10.8-4.16c.5-.19.95.126.81.99z" />
                      </svg>
                      Join our Telegram channel
                    </span>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-indigo-500 rounded-full animate-pulse"></span>
                  </a>
                  <button 
                    onClick={() => showModal('Coming Soon', 'Our Discord community is launching soon! Check back later for updates.', 'info')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5865F2] text-white font-bold text-sm shadow-[0_0_15px_rgba(88,101,242,0.5)] hover:shadow-[0_0_25px_rgba(88,101,242,0.7)] hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:scale-110 transition-transform rounded-full"></span>
                    <span className="relative flex items-center gap-2">
                      <DiscordIcon className="w-5 h-5" />
                      Join our Discord
                    </span>
                  </button>
                </>
              ) : (
                navLinks.map((link) => (
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
                ))
              )}
            </nav>
          </div>

          <div className="hidden xl:flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-600 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isRegularUser ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }} 
                    className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors mr-2 focus:outline-none"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 z-50">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        {unreadCount > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                      </div>
                      <div className="p-2">
                        {notifications.length === 0 ? (
                          <div className="text-sm text-slate-500 text-center py-6">No notifications yet.</div>
                        ) : (
                          notifications.map(n => {
                            const renderMessage = (content: string) => {
                              const urlRegex = /((?:https?:\/\/|www\.)[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)|(?:[-a-zA-Z0-9@:%_+~#=]{1,256}\.(?:com|org|net|io|co|in|us|uk|me|dev|ai|app)\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)))/gi;
                              if (!content) return null;
                              const parts = content.split(urlRegex);
                              return parts.map((part, i) => {
                                if (part.match(urlRegex)) {
                                  let href = part;
                                  if (!href.match(/^https?:\/\//i)) href = `https://${href}`;
                                  return (
                                    <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all" onClick={(e) => e.stopPropagation()}>
                                      {part}
                                    </a>
                                  );
                                }
                                return part;
                              });
                            };
                            return (
                              <div 
                                key={n._id} 
                                onClick={() => !n.isRead && markAsRead(n._id)}
                                className={`p-3 rounded-xl mb-1 cursor-pointer transition-colors ${n.isRead ? 'opacity-60 hover:bg-slate-50' : 'bg-blue-50/50 border border-blue-100 hover:bg-blue-50'}`}
                              >
                                <div className="text-sm text-slate-800">{renderMessage(n.message)}</div>
                                <div className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  to="/profile"
                  className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
                  title="My Profile"
                >
                  <User className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              <>
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

                {!hideAuthButtons && (
                  isLoggedIn ? (
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
                  )
                )}
              </>
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
            {isRegularUser ? (
              <div className="flex flex-col gap-3">
                <Link
                  to="/profile#available"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-bold text-blue-600 hover:text-blue-700 transition-colors px-2"
                >
                  Available Projects
                </Link>
                <a 
                  href="https://t.me/visioncaptureai" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-base shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 relative overflow-hidden"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.676c.223-.22-.05-.341-.346-.145l-6.4 4.026-2.76-.86c-.6-.188-.611-.6.126-.89l10.8-4.16c.5-.19.95.126.81.99z" />
                  </svg>
                  Join our Telegram channel
                </a>
                <button 
                  onClick={() => { setIsMenuOpen(false); showModal('Coming Soon', 'Our Discord community is launching soon! Check back later for updates.', 'info'); }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#5865F2] text-white font-bold text-base shadow-[0_0_15px_rgba(88,101,242,0.5)] transition-all duration-300 relative overflow-hidden"
                >
                  <DiscordIcon className="w-5 h-5" />
                  Join our Discord
                </button>
              </div>
            ) : (
              navLinks.map((link) => (
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
              ))
            )}
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
              {!hideAuthButtons && (
                <Link
                  to={isLoggedIn ? profileLink : '/profile'}
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  {isLoggedIn ? 'My Profile' : 'Login'}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal {...modalConfig} />
    </header>
  );
}
