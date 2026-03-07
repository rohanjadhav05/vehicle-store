import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Layouts / Shared
import Navbar from './components/Navbar';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages - Catalog
import VehicleCatalog from './pages/catalog/VehicleCatalog';
import VehicleDetail from './pages/catalog/VehicleDetail';
import BrandsPage from './pages/catalog/BrandsPage';

// Pages - User
import Bookmarks from './pages/user/Bookmarks';
import MyBookings from './pages/user/MyBookings';

// Pages - Admin
import Dashboard from './pages/admin/Dashboard';
import ManageVehicles from './pages/admin/ManageVehicles';
import AddVehicle from './pages/admin/AddVehicle';
import EditVehicle from './pages/admin/EditVehicle';
import AllBookings from './pages/admin/AllBookings';



function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/vehicles" replace />} />
            
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/vehicles" element={<VehicleCatalog />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
            <Route path="/brands" element={<BrandsPage />} />

            {/* Protected (User & Admin) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/my-bookings" element={<MyBookings />} />
            </Route>

            {/* Admin Only */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vehicles" element={<ManageVehicles />} />
              <Route path="vehicles/add" element={<AddVehicle />} />
              <Route path="vehicles/edit/:id" element={<EditVehicle />} />
              <Route path="bookings" element={<AllBookings />} />
            </Route>

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
