import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import { authAtom } from '../../recoil/authAtom';
import { login } from '../../api/auth';
import Loader from '../../components/Loader';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useSetRecoilState(authAtom);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('sessionExpired') === 'true') {
      toast.error('Session expired. Please login again.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast.error('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      const data = await login(formData);

      setAuth({
        userId: data.userId,
        username: data.username,
        userType: data.userType,
        isLoggedIn: true,
      });

      toast.success('Login successful!');
      if (data.userType === 'A') {
        navigate('/admin/dashboard');
      } else {
        navigate('/vehicles');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#F8FAFF] to-[#DBEAFE] py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-[#DBEAFE] p-8 transform transition-all">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center gap-2 mb-4">
            <img src="/favicon.svg" alt="VeloDrive Logo" className="w-10 h-10 drop-shadow-sm" />
            <span className="font-bold text-2xl text-[#1E3A5F] tracking-tight">VeloDrive</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] focus:z-10 sm:text-sm transition-shadow"
              placeholder="Enter your username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] focus:z-10 sm:text-sm transition-shadow"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#1E3A5F] hover:bg-[#163050] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A5F] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader inline /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600 border-t border-[#DBEAFE] pt-6">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#1E3A5F] hover:text-[#1E3A5F] transition-colors">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
