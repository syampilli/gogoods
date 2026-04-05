import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

export default function ForgotPassword() {
  const [step, setStep]       = useState(1); // 1=email, 2=otp+newpass
  const [email, setEmail]     = useState('');
  const [otp, setOtp]         = useState('');
  const [newPass, setNewPass] = useState('');
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');

  const sendOTP = async () => {
    try {
      await API.post('/auth/forgot-password', { email });
      setMsg('OTP sent! Check your email (or server console for demo)');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const resetPass = async () => {
    try {
      await API.post('/auth/reset-password', { email, otp, newPassword: newPass });
      setMsg('✅ Password reset! You can now login.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h2 style={S.title}>🔐 Forgot Password</h2>
        {msg   && <div style={S.success}>{msg}</div>}
        {error && <div style={S.error}>{error}</div>}

        {step === 1 && <>
          <p style={S.hint}>Enter your registered email to receive OTP</p>
          <input style={S.input} placeholder="Email address"
            onChange={e => setEmail(e.target.value)} />
          <button style={S.btn} onClick={sendOTP}>Send OTP</button>
        </>}

        {step === 2 && <>
          <input style={S.input} placeholder="Enter 6-digit OTP"
            maxLength={6} onChange={e => setOtp(e.target.value)} />
          <input style={S.input} type="password" placeholder="New Password"
            onChange={e => setNewPass(e.target.value)} />
          <button style={S.btn} onClick={resetPass}>Reset Password</button>
        </>}

        {step === 3 && <Link to="/login" style={S.btn2}>Go to Login →</Link>}
      </div>
    </div>
  );
}

const S = {
  page:    { display:'flex', justifyContent:'center', alignItems:'center',
             minHeight:'90vh', background:'#f1f5f9' },
  card:    { background:'#fff', padding:'36px', borderRadius:'14px',
             width:'380px', boxShadow:'0 4px 24px rgba(0,0,0,0.1)' },
  title:   { textAlign:'center', marginBottom:'16px', color:'#1e293b' },
  hint:    { fontSize:'13px', color:'#64748b', marginBottom:'12px' },
  input:   { width:'100%', padding:'10px 14px', margin:'8px 0',
             border:'1px solid #e2e8f0', borderRadius:'8px',
             fontSize:'14px', boxSizing:'border-box' },
  btn:     { width:'100%', padding:'12px', background:'#6366f1', color:'#fff',
             border:'none', borderRadius:'8px', fontSize:'15px',
             cursor:'pointer', marginTop:'8px', display:'block' },
  btn2:    { display:'block', textAlign:'center', padding:'12px',
             background:'#10b981', color:'#fff', borderRadius:'8px',
             textDecoration:'none', marginTop:'8px' },
  success: { background:'#f0fdf4', color:'#16a34a', padding:'10px 14px',
             borderRadius:'8px', fontSize:'13px', marginBottom:'12px' },
  error:   { background:'#fef2f2', color:'#ef4444', padding:'10px 14px',
             borderRadius:'8px', fontSize:'13px', marginBottom:'12px' }
};