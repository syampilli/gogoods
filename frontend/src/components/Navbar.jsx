import { Link, useNavigate } from 'react-router-dom';
import { useAuth }   from '../context/AuthContext';
import { useTheme }  from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  Sun, Moon, Truck, LogOut, User,
  Wallet, BarChart2, Package, TrendingUp
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { t }            = useTranslation();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashPath =
    user?.role === 'vendor' ? '/vendor' :
    user?.role === 'driver' ? '/driver' : '/admin';

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b
                    border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to={user ? dashPath : '/'}
            className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center
                            justify-center group-hover:bg-blue-700 transition-colors">
              <Truck size={20} className="text-white"/>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Go<span className="text-blue-600">Goods</span>
            </span>
          </Link>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">

            {/* Language switcher */}
            <LanguageSwitcher/>

            {/* Dark mode toggle */}
            <button onClick={toggle}
              className="w-9 h-9 rounded-xl flex items-center justify-center
                         bg-gray-100 dark:bg-gray-800 hover:bg-gray-200
                         dark:hover:bg-gray-700 transition-colors
                         text-gray-600 dark:text-gray-300">
              {dark ? <Sun size={18}/> : <Moon size={18}/>}
            </button>

            {user ? (
              <>
                {/* Notification bell */}
                <NotificationBell/>

                {/* Wallet — vendor & driver only */}
                {['vendor','driver'].includes(user.role) && (
                  <Link to="/wallet"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                               text-sm font-medium text-gray-600 dark:text-gray-300
                               hover:bg-gray-100 dark:hover:bg-gray-800
                               transition-colors">
                    <Wallet size={16}/>
                    <span className="hidden sm:block">{t('nav.wallet')}</span>
                  </Link>
                )}

                {/* Analytics */}
                <Link to="/analytics"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                             text-sm font-medium text-gray-600 dark:text-gray-300
                             hover:bg-gray-100 dark:hover:bg-gray-800
                             transition-colors">
                  <BarChart2 size={16}/>
                  <span className="hidden sm:block">{t('nav.analytics')}</span>
                </Link>

                {/* Vendor — Order History */}
                {user.role === 'vendor' && (
                  <Link to="/order-history"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                               text-sm font-medium text-gray-600 dark:text-gray-300
                               hover:bg-gray-100 dark:hover:bg-gray-800
                               transition-colors">
                    <Package size={16}/>
                    <span className="hidden sm:block">History</span>
                  </Link>
                )}

                {/* Driver — Driver Hub */}
                {user.role === 'driver' && (
                  <Link to="/driver-hub"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                               text-sm font-medium text-gray-600 dark:text-gray-300
                               hover:bg-gray-100 dark:hover:bg-gray-800
                               transition-colors">
                    <TrendingUp size={16}/>
                    <span className="hidden sm:block">Driver Hub</span>
                  </Link>
                )}

                {/* Profile pill — click to go to profile */}
                <Link to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100
                             dark:bg-gray-800 rounded-xl hover:bg-gray-200
                             dark:hover:bg-gray-700 transition-colors">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="profile"
                      className="w-6 h-6 rounded-full object-cover"/>
                  ) : (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex
                                    items-center justify-center">
                      <User size={12} className="text-white"/>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700
                                   dark:text-gray-200 hidden sm:block">
                    {user.name?.split(' ')[0]}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md font-medium
                                   bg-blue-100 text-blue-700 dark:bg-blue-900
                                   dark:text-blue-300">
                    {user.role}
                  </span>
                </Link>

                {/* Logout */}
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                             text-sm font-medium text-red-600 dark:text-red-400
                             hover:bg-red-50 dark:hover:bg-red-900/20
                             transition-colors">
                  <LogOut size={16}/>
                  <span className="hidden sm:block">{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700
                             dark:text-gray-200 hover:text-blue-600
                             dark:hover:text-blue-400 transition-colors">
                  {t('nav.login')}
                </Link>
                <Link to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white
                             bg-blue-600 rounded-xl hover:bg-blue-700
                             transition-colors">
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}