import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  User, Phone, MapPin, Store, Car, Camera,
  Lock, Save, CheckCircle, Eye, EyeOff,
  Star, Package, IndianRupee, Edit2
} from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, login } = useAuth();
  const { t }           = useTranslation();
  const fileRef         = useRef();

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState('profile');
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name:'', phone:'', address:'', shopName:'', vehicleNumber:''
  });

  const [passForm, setPassForm] = useState({
    currentPassword:'', newPassword:'', confirmPassword:''
  });
  const [showPass, setShowPass] = useState({
    current:false, new:false, confirm:false
  });
  const [changingPass, setChangingPass] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/profile');
      setProfile(data);
      setForm({
        name:          data.name          || '',
        phone:         data.phone         || '',
        address:       data.address       || '',
        shopName:      data.shopName      || '',
        vehicleNumber: data.vehicleNumber || '',
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put('/profile', form);
      setProfile(data);
      // Update auth context
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...stored, name: data.name, shopName: data.shopName };
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile updated!');
      setEditMode(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await API.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await API.put('/profile', { ...form, profilePhoto: data.url });
      setProfile(p => ({...p, profilePhoto: data.url}));
      toast.success('Photo updated!');
    } catch {
      toast.error('Photo upload failed');
    }
  };

  const handleChangePassword = async () => {
    if (passForm.newPassword !== passForm.confirmPassword)
      return toast.error('New passwords do not match');
    if (passForm.newPassword.length < 6)
      return toast.error('Password must be at least 6 characters');
    setChangingPass(true);
    try {
      await API.put('/profile/password', {
        currentPassword: passForm.currentPassword,
        newPassword:     passForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950
                    flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent
                      rounded-full animate-spin"/>
    </div>
  );

  const isDriver = user?.role === 'driver';
  const isVendor = user?.role === 'vendor';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Profile Header Card ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center gap-5">

            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-blue-100
                              dark:bg-blue-900/30 flex items-center justify-center">
                {profile?.profilePhoto ? (
                  <img src={profile.profilePhoto} alt="profile"
                    className="w-full h-full object-cover"/>
                ) : (
                  <User size={36} className="text-blue-500"/>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600
                           hover:bg-blue-700 text-white rounded-xl flex items-center
                           justify-center shadow-lg transition-colors">
                <Camera size={14}/>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => handlePhotoUpload(e.target.files[0])}/>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile?.name}
              </h1>
              <p className="text-gray-400 text-sm">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                  ${isDriver
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                  {user?.role?.toUpperCase()}
                </span>
                {isDriver && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                    ${profile?.isAvailable
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {profile?.isAvailable ? '🟢 Online' : '🔴 Offline'}
                  </span>
                )}
              </div>
            </div>

            {/* Edit toggle */}
            <button onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                          font-semibold transition-all
                ${editMode
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
              <Edit2 size={14}/>
              {editMode ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
          {[
            { key:'profile',  label:'Profile Info' },
            { key:'security', label:'Security'     },
          ].map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold
                          transition-all
                ${tab === tb.key
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'}`}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === 'profile' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border
                          border-gray-100 dark:border-gray-800 p-6 shadow-sm
                          space-y-4">

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                                dark:text-gray-400 uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2
                                           -translate-y-1/2 text-gray-400"/>
                <input
                  value={form.name}
                  disabled={!editMode}
                  onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                             dark:bg-gray-800 border border-gray-200
                             dark:border-gray-700 rounded-xl text-gray-900
                             dark:text-white disabled:opacity-60
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                                dark:text-gray-400 uppercase mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2
                                            -translate-y-1/2 text-gray-400"/>
                <input
                  value={form.phone}
                  disabled={!editMode}
                  onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                             dark:bg-gray-800 border border-gray-200
                             dark:border-gray-700 rounded-xl text-gray-900
                             dark:text-white disabled:opacity-60
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-500
                                dark:text-gray-400 uppercase mb-1.5">
                Address
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-3 text-gray-400"/>
                <textarea
                  value={form.address}
                  disabled={!editMode}
                  rows={2}
                  onChange={e => setForm(p => ({...p, address: e.target.value}))}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                             dark:bg-gray-800 border border-gray-200
                             dark:border-gray-700 rounded-xl text-gray-900
                             dark:text-white disabled:opacity-60 resize-none
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             transition-all"
                />
              </div>
            </div>

            {/* Vendor — shop name */}
            {isVendor && (
              <div>
                <label className="block text-xs font-semibold text-gray-500
                                  dark:text-gray-400 uppercase mb-1.5">
                  Shop / Business Name
                </label>
                <div className="relative">
                  <Store size={15} className="absolute left-3 top-1/2
                                              -translate-y-1/2 text-gray-400"/>
                  <input
                    value={form.shopName}
                    disabled={!editMode}
                    onChange={e => setForm(p => ({...p, shopName: e.target.value}))}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                               dark:bg-gray-800 border border-gray-200
                               dark:border-gray-700 rounded-xl text-gray-900
                               dark:text-white disabled:opacity-60
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all"
                  />
                </div>
              </div>
            )}

            {/* Driver — vehicle info */}
            {isDriver && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500
                                      dark:text-gray-400 uppercase mb-1.5">
                      Vehicle Type
                    </label>
                    <div className="px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-800
                                    border border-gray-200 dark:border-gray-700
                                    rounded-xl text-gray-600 dark:text-gray-400
                                    capitalize">
                      {profile?.vehicle === 'bike' ? '🏍️' :
                       profile?.vehicle === 'van'  ? '🚐' : '🚛'}{' '}
                      {profile?.vehicle}
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
                        value={form.vehicleNumber}
                        disabled={!editMode}
                        onChange={e => setForm(p => ({
                          ...p, vehicleNumber: e.target.value.toUpperCase()
                        }))}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50
                                   dark:bg-gray-800 border border-gray-200
                                   dark:border-gray-700 rounded-xl text-gray-900
                                   dark:text-white disabled:opacity-60 uppercase
                                   focus:outline-none focus:ring-2 focus:ring-blue-500
                                   transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* License */}
                {profile?.licenseUrl && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500
                                      dark:text-gray-400 uppercase mb-1.5">
                      Driving License
                    </label>
                    <img src={profile.licenseUrl} alt="license"
                      className="w-full h-32 object-cover rounded-xl border
                                 border-gray-200 dark:border-gray-700"/>
                  </div>
                )}
              </>
            )}

            {/* Save button */}
            {editMode && (
              <button onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3
                           bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                           text-white font-bold rounded-xl transition-all text-sm">
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/30
                                    border-t-white rounded-full animate-spin"/>
                  : <><Save size={15}/> Save Changes</>}
              </button>
            )}
          </div>
        )}

        {/* ── Security Tab ── */}
        {tab === 'security' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border
                          border-gray-100 dark:border-gray-800 p-6 shadow-sm
                          space-y-4">
            <h2 className="font-bold text-gray-900 dark:text-white">
              Change Password
            </h2>

            {[
              { key:'currentPassword', label:'Current Password',
                show: showPass.current,
                toggle: () => setShowPass(p => ({...p, current:!p.current})) },
              { key:'newPassword',     label:'New Password',
                show: showPass.new,
                toggle: () => setShowPass(p => ({...p, new:!p.new})) },
              { key:'confirmPassword', label:'Confirm New Password',
                show: showPass.confirm,
                toggle: () => setShowPass(p => ({...p, confirm:!p.confirm})) },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-500
                                  dark:text-gray-400 uppercase mb-1.5">
                  {f.label}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2
                                             -translate-y-1/2 text-gray-400"/>
                  <input
                    type={f.show ? 'text' : 'password'}
                    value={passForm[f.key]}
                    onChange={e => setPassForm(p => ({...p, [f.key]: e.target.value}))}
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50
                               dark:bg-gray-800 border border-gray-200
                               dark:border-gray-700 rounded-xl text-gray-900
                               dark:text-white focus:outline-none
                               focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <button onClick={f.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600">
                    {f.show ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
            ))}

            <button onClick={handleChangePassword} disabled={changingPass}
              className="w-full flex items-center justify-center gap-2 py-3
                         bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         text-white font-bold rounded-xl transition-all text-sm">
              {changingPass
                ? <div className="w-4 h-4 border-2 border-white/30
                                  border-t-white rounded-full animate-spin"/>
                : <><Lock size={15}/> Update Password</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}