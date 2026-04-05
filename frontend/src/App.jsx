import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login          from './pages/Login';
import Signup         from './pages/Signup';
import VendorDashboard from './pages/VendorDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard  from './pages/AdminDashboard';
import Navbar         from './components/Navbar';
import ForgotPassword from './pages/ForgotPassword';
import Landing        from './pages/Landing';
import Analytics      from './pages/Analytics';
import WalletPage     from './pages/Wallet';
import Profile        from './pages/Profile';
import VendorProfile  from './pages/VendorProfile';
import DriverProfile  from './pages/DriverProfile';

// ✅ Fix — roles array support add చేశాను
const PrivateRoute = ({ children, role, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login"/>;
  // Single role check
  if (role  && user.role !== role) return <Navigate to="/"/>;
  // Multiple roles check
  if (roles && !roles.includes(user.role)) return <Navigate to="/"/>;
  return children;
};

export default function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>

        {/* ✅ Fix — "/" route ఒక్కసారే ఉండాలి, Landing page లేదా dashboard */}
        <Route path="/" element={
          user ? (
            user.role === 'vendor' ? <Navigate to="/vendor"/> :
            user.role === 'driver' ? <Navigate to="/driver"/> :
            <Navigate to="/admin"/>
          ) : <Landing/>
        }/>

        {/* Auth routes */}
        <Route path="/login"           element={<Login/>}/>
        <Route path="/signup"          element={<Signup/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>

        {/* Dashboard routes */}
        <Route path="/vendor" element={
          <PrivateRoute role="vendor"><VendorDashboard/></PrivateRoute>
        }/>
        <Route path="/driver" element={
          <PrivateRoute role="driver"><DriverDashboard/></PrivateRoute>
        }/>
        <Route path="/admin" element={
          <PrivateRoute role="admin"><AdminDashboard/></PrivateRoute>
        }/>

        {/* Shared routes */}
        <Route path="/analytics" element={
          <PrivateRoute><Analytics/></PrivateRoute>
        }/>
        <Route path="/profile" element={
          <PrivateRoute><Profile/></PrivateRoute>
        }/>

        {/* Vendor only */}
        <Route path="/wallet" element={
          <PrivateRoute roles={['vendor','driver']}><WalletPage/></PrivateRoute>
        }/>
        <Route path="/order-history" element={
          <PrivateRoute roles={['vendor']}><VendorProfile/></PrivateRoute>
        }/>

        {/* Driver only */}
        <Route path="/driver-hub" element={
          <PrivateRoute roles={['driver']}><DriverProfile/></PrivateRoute>
        }/>

      </Routes>
    </BrowserRouter>
  );
}