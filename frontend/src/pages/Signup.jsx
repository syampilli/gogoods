import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, User, Mail, Phone, Lock, Eye, EyeOff,
         Store, Car } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

const VEHICLE_RATES = { bike:'₹8/km', van:'₹18/km', heavy:'₹25/km' };

export default function Signup() {
  const [form, setForm] = useState({
    name:'', email:'', password:'', confirmPassword:'',
    phone:'', role:'vendor', shopName:'',
    vehicle:'bike', vehicleNumber:''
  });
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const set = f => setForm(p => ({...p, ...f}));

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword)
      return toast.error('Passwords do not match!');
    if (form.phone.length !== 10)
      return toast.error('Enter valid 10-digit phone number');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/signup', form);
      login(data.user, data.token);
      toast.success(`Welcome to GoGoods, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, icon: Icon, type='text', placeholder, value, onChange, children }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>}
        {children || (
          <input type={type} placeholder={placeholder} value={value}
            onChange={onChange}
            className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-gray-50 dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900
                       dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2
                       focus:ring-blue-500 focus:border-transparent transition-all`}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center
                    justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl items-center
                          justify-center mb-4 shadow-lg">
            <Truck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join GoGoods
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create your account and start shipping
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border
                        border-gray-100 dark:border-gray-800 p-8">

          {/* Role toggle */}
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6">
            {['vendor','driver'].map(r => (
              <button key={r} onClick={() => set({ role: r })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all
                            flex items-center justify-center gap-2
                  ${form.role === r
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                {r === 'vendor' ? <Store size={16}/> : <Car size={16}/>}
                {r === 'vendor' ? 'Vendor' : 'Driver'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Full Name" icon={User} placeholder="Your name"
                onChange={e => set({ name: e.target.value })} />
              <InputField label="Phone" icon={Phone} placeholder="10-digit number"
                onChange={e => set({ phone: e.target.value })} />
            </div>

            <InputField label="Email address" icon={Mail}
              placeholder="you@example.com" type="email"
              onChange={e => set({ email: e.target.value })} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700
                                  dark:text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type={showPass ? 'text':'password'} placeholder="Min 6 chars"
                    className="w-full pl-11 pr-10 py-3 bg-gray-50 dark:bg-gray-800
                               border border-gray-200 dark:border-gray-700 rounded-xl
                               text-gray-900 dark:text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    onChange={e => set({ password: e.target.value })} />
                  <button onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <InputField label="Confirm Password" icon={Lock} type="password"
                placeholder="Re-enter" onChange={e => set({ confirmPassword: e.target.value })} />
            </div>

            {/* Vendor fields */}
            {form.role === 'vendor' && (
              <InputField label="Shop / Business Name" icon={Store}
                placeholder="e.g. Krishna Textiles"
                onChange={e => set({ shopName: e.target.value })} />
            )}

            {/* Driver fields */}
            {form.role === 'driver' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700
                                    dark:text-gray-300 mb-2">Vehicle type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(VEHICLE_RATES).map(([v, rate]) => (
                      <button key={v} onClick={() => set({ vehicle: v })}
                        className={`p-3 rounded-xl border-2 text-center transition-all
                          ${form.vehicle === v
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                        <div className="text-xl mb-1">
                          {v==='bike'?'🏍️':v==='van'?'🚐':'🚛'}
                        </div>
                        <div className="text-xs font-bold capitalize text-gray-700
                                        dark:text-gray-300">{v}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400
                                        font-semibold">{rate}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <InputField label="Vehicle Number" icon={Car}
                  placeholder="e.g. TS09AB1234"
                  onChange={e => set({ vehicleNumber: e.target.value.toUpperCase() })} />
                  <ImageUpload
  label="Driving License Photo"
  endpoint="license"
  onUpload={url => set({ licenseUrl: url || '' })}
/>
              </div>
              
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         text-white font-bold rounded-xl transition-all text-base mt-2
                         flex items-center justify-center gap-2 shadow-lg hover:shadow-xl
                         hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : 'Create account'}
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}