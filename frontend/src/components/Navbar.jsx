import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authAtom } from '../recoil/authAtom';

import { logout } from '../api/auth';

const Navbar = () => {
  const auth = useRecoilValue(authAtom);
  const setAuth = useSetRecoilState(authAtom);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout API failed', e);
    }
    setAuth({
      userId: null,
      username: null,
      userType: null,
      isLoggedIn: false,
    });
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `font-medium transition-colors ${isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-blue-600'
    } py-2 px-1`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <span className="font-bold text-xl text-blue-600 tracking-tight">Turno</span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex space-x-8">
            <NavLink to="/brands" className={navLinkClass}>
              Brands
            </NavLink>
            <NavLink to="/vehicles" className={navLinkClass}>
              Vehicles
            </NavLink>
            {auth.isLoggedIn && auth.userType === 'U' && (
              <>
                <NavLink to="/bookmarks" className={navLinkClass}>
                  Bookmarks
                </NavLink>
                <NavLink to="/my-bookings" className={navLinkClass}>
                  My Bookings
                </NavLink>
              </>
            )}
            {auth.isLoggedIn && auth.userType === 'A' && (
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {!auth.isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="font-medium text-slate-600 hover:text-blue-600 px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white font-medium rounded-xl px-4 py-2 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-500 hidden sm:block">
                  Hi, {auth.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="border border-slate-200 text-slate-600 font-medium rounded-xl px-4 py-2 hover:bg-slate-50 transition-colors"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
