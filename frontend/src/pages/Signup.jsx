import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, User, Mail, Phone, Lock, Eye, EyeOff,
         Store, Car } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VEHICLE_RATES = { bike:'₹22/km', van:'₹77/km', heavy:'₹150/km' };

export default function Signup() {
  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    phone:           '',
    role:            'vendor',
    shopName:        '',
    vehicle:         'bike',
    vehicleNumber:   '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  // ✅ Simple set function
  const set = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim())
      return toast.error('Please enter your name');
    if (!form.email.trim())
      return toast.error('Please enter your email');
    if (form.phone.length !== 10)
      return toast.error('Enter valid 10-digit phone number');
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword)
      return toast.error('Passwords do not match!');

    setLoading(true);
    try {
      const { data } = await API.post('/auth/signup', {
        name:          form.name,
        email:         form.email,
        password:      form.password,
        phone:         form.phone,
        role:          form.role,
        shopName:      form.shopName,
        vehicle:       form.vehicle,
        vehicleNumber: form.vehicleNumber,
      });
      login(data.user, data.token);
      toast.success(`Welcome to GoGoods, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950
                    flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl
                          items-center justify-center mb-4 shadow-lg">
            <Truck size={32} className="text-white"/>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join GoGoods
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create your account and start shipping
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl
                        border border-gray-100 dark:border-gray-800 p-8">

          {/* Role toggle */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800
                          rounded-2xl mb-6">
            {['vendor','driver'].map(r => (
              <button key={r} onClick={() => set('role', r)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold
                            transition-all flex items-center justify-center gap-2
                  ${form.role === r
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'}`}>
                {r === 'vendor' ? <><Store size={16}/> Vendor</> : <><Car size={16}/> Driver</>}
              </button>
            ))}
          </div>

          <div className="space-y-4">

            {/* Name + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500
                                  dark:text-gray-400 uppercase mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2
                                             -translate-y-1/2 text-gray-400"/>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                               dark:bg-gray-800 border border-gray-200
                               dark:border-gray-700 rounded-xl text-gray-900
                               dark:text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500
                                  dark:text-gray-400 uppercase mb-1.5">
                  Phone
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2
                                              -translate-y-1/2 text-gray-400"/>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="10-digit number"
                    maxLength={10}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                               dark:bg-gray-800 border border-gray-200
                               dark:border-gray-700 rounded-xl text-gray-900
                               dark:text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                                dark:text-gray-400 uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2
                                           -translate-y-1/2 text-gray-400"/>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                             dark:bg-gray-800 border border-gray-200
                             dark:border-gray-700 rounded-xl text-gray-900
                             dark:text-white placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             transition-all"
                />
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500
                                  dark:text-gray-400 uppercase mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2
                                             -translate-y-1/2 text-gray-400"/>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-8 py-2.5 text-sm bg-gray-50
                               dark:bg-gray-800 border border-gray-200
                               dark:border-gray-700 rounded-xl text-gray-900
                               dark:text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all"
                  />
                  <button type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500
                                  dark:text-gray-400 uppercase mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2
                                             -translate-y-1/2 text-gray-400"/>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Re-enter"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                               dark:bg-gray-800 border border-gray-200
                               dark:border-gray-700 rounded-xl text-gray-900
                               dark:text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Vendor — Shop name */}
            {form.role === 'vendor' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500
                                  dark:text-gray-400 uppercase mb-1.5">
                  Shop / Business Name
                </label>
                <div className="relative">
                  <Store size={15} className="absolute left-3 top-1/2
                                              -translate-y-1/2 text-gray-400"/>
                  <input
                    type="text"
                    value={form.shopName}
                    onChange={e => set('shopName', e.target.value)}
                    placeholder="e.g. Krishna Textiles"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                               dark:bg-gray-800 border border-gray-200
                               dark:border-gray-700 rounded-xl text-gray-900
                               dark:text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all"
                  />
                </div>
              </div>
            )}

            {/* Driver fields */}
            {form.role === 'driver' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500
                                    dark:text-gray-400 uppercase mb-1.5">
                    Vehicle Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(VEHICLE_RATES).map(([v, rate]) => (
                      <button key={v} type="button"
                        onClick={() => set('vehicle', v)}
                        className={`p-3 rounded-xl border-2 text-center
                                    transition-all
                          ${form.vehicle === v
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700'}`}>
                        <div className="text-xl mb-1">
                          {v==='bike'?'🏍️':v==='van'?'🚐':'🚛'}
                        </div>
                        <div className="text-[10px] font-bold text-gray-600
                                        dark:text-gray-300 capitalize">{v}</div>
                        <div className="text-[10px] text-blue-600
                                        dark:text-blue-400">{rate}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500
                                    dark:text-gray-400 uppercase mb-1.5">
                    Vehicle Number
                  </label>
                  <div className="relative">
                    <Car size={15} className="absolute left-3 top-1/2
                                              -translate-y-1/2 text-gray-400"/>
                    <input
                      type="text"
                      value={form.vehicleNumber}
                      onChange={e => set('vehicleNumber',
                        e.target.value.toUpperCase())}
                      placeholder="e.g. TS09AB1234"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                                 dark:bg-gray-800 border border-gray-200
                                 dark:border-gray-700 rounded-xl text-gray-900
                                 dark:text-white placeholder-gray-400 uppercase
                                 focus:outline-none focus:ring-2 focus:ring-blue-500
                                 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700
                         disabled:bg-blue-400 text-white font-bold rounded-xl
                         transition-all text-base flex items-center
                         justify-center gap-2 shadow-lg hover:shadow-xl
                         hover:-translate-y-0.5 disabled:translate-y-0
                         disabled:cursor-not-allowed mt-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30
                                  border-t-white rounded-full animate-spin"/>
                : 'Create Account'}
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login"
            className="text-blue-600 dark:text-blue-400 font-semibold
                       hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}