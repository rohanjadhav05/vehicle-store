import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../../api/auth';
import Loader from '../../components/Loader';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // In our backend API, the request needs DTO elements like username, email, password... 
    // Usually user_type defaults to 'U' in backend, but we can pass it if exposed.
    try {
      setLoading(true);
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-[#F8FAFF] to-[#DBEAFE] py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-[#DBEAFE] p-8">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center gap-2 mb-4">
            <img src="/favicon.svg" alt="VeloDrive Logo" className="w-10 h-10 drop-shadow-sm" />
            <span className="font-bold text-2xl text-[#1E3A5F] tracking-tight">VeloDrive</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500">Join us to explore amazing vehicles</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] focus:z-10 sm:text-sm"
              placeholder="Pick a username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] focus:z-10 sm:text-sm"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] focus:z-10 sm:text-sm"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] focus:z-10 sm:text-sm"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-[#1E3A5F] hover:bg-[#163050] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A5F] transition-colors disabled:opacity-70 mt-6"
          >
            {loading ? <Loader inline /> : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600 border-t border-[#DBEAFE] pt-6">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#1E3A5F] hover:text-[#1E3A5F] transition-colors">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
