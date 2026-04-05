import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useTranslation();
  const [form,     setForm]     = useState({ email:'', password:'' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center
                    justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl
                          items-center justify-center mb-4 shadow-lg">
            <Truck size={32} className="text-white"/>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('login.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl
                        border border-gray-100 dark:border-gray-800 p-8">
          <div className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700
                                dark:text-gray-300 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2
                                           -translate-y-1/2 text-gray-400"/>
                <input
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800
                             border border-gray-200 dark:border-gray-700 rounded-xl
                             text-gray-900 dark:text-white placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent transition-all"
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700
                                dark:text-gray-300 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2
                                           -translate-y-1/2 text-gray-400"/>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800
                             border border-gray-200 dark:border-gray-700 rounded-xl
                             text-gray-900 dark:text-white placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent transition-all"
                  onChange={e => setForm({...form, password: e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                <button onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600
                             dark:hover:text-gray-200">
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400
                           hover:underline font-medium">
                {t('login.forgotPassword')}
              </Link>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700
                         disabled:bg-blue-400 text-white font-bold rounded-xl
                         transition-all text-base flex items-center justify-center
                         gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5
                         disabled:translate-y-0 disabled:cursor-not-allowed">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30
                                  border-t-white rounded-full animate-spin"/>
                : t('login.signIn')}
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-gray-500 dark:text-gray-400">
          {t('login.noAccount')}{' '}
          <Link to="/signup"
            className="text-blue-600 dark:text-blue-400 font-semibold
                       hover:underline">
            {t('login.createFree')}
          </Link>
        </p>
      </div>
    </div>
  );
}