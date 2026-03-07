import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllVehicles } from '../../api/vehicles';
import { getAllBrands } from '../../api/brands';
import { getAllBookings, updateBookingStatus } from '../../api/bookings';
import Loader from '../../components/Loader';
import AddBrandModal from '../../components/AddBrandModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showPending, setShowPending] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showRejected, setShowRejected] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const [vehiclesData, brandsData, bookingsData] = await Promise.all([
        getAllVehicles(),
        getAllBrands(),
        getAllBookings()
      ]);

      const vehicles = vehiclesData.content || vehiclesData || [];
      const bookings = bookingsData.content || bookingsData || [];
      const brands = brandsData || [];

      // Calculate totals
      const summaryPayload = {
        totalVehicles: vehicles.reduce((sum, v) => sum + (v.stock || 0), 0),
        totalBrands: brands.length,
        pendingBookingsCount: bookings.filter(b => b.status === 'PENDING').length,
        completedBookingsCount: bookings.filter(b => b.status === 'CONFIRMED').length,
        rejectedBookingsCount: bookings.filter(b => b.status === 'CANCELLED').length,
        pendingBookingsList: bookings.filter(b => b.status === 'PENDING'),
        completedBookingsList: bookings.filter(b => b.status === 'CONFIRMED'),
        rejectedBookingsList: bookings.filter(b => b.status === 'CANCELLED'),
        brandSummaries: []
      };

      // Calculate brand breakdown
      const brandMap = {};
      vehicles.forEach(v => {
        console.log(v, " name ", v.name)
        const bName = v.brand?.name || 'Unknown';
        if (!brandMap[bName]) {
          brandMap[bName] = { brand: bName, models: [], stock: 0, petrol: 0, diesel: 0, electric: 0 };
        }
        if (v.name && !brandMap[bName].models.includes(v.name)) {
          brandMap[bName].models.push(v.name);
        }
        brandMap[bName].stock += (v.stock || 0);

        const fName = (v.fuelType?.name || '').toUpperCase();
        if (fName.includes('PETROL')) brandMap[bName].petrol += 1;
        else if (fName.includes('DIESEL')) brandMap[bName].diesel += 1;
        else if (fName.includes('ELECTRIC')) brandMap[bName].electric += 1;
      });

      // Sort alphabetically by brand
      summaryPayload.brandSummaries = Object.values(brandMap)
        .map(b => ({ ...b, models: b.models.join(', ') || '-' }))
        .sort((a, b) => a.brand.localeCompare(b.brand));
      setSummary(summaryPayload);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(id);
      await updateBookingStatus(id, newStatus);
      toast.success('Status updated successfully');
      fetchSummary();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!summary) return null;

  // Assuming summary format:
  // { totalVehicles, totalBrands, totalBookings, pendingBookings, brandSummaries: [{ brand, total, petrol, diesel, electric }] }
  // Fallback map if the actual structure differs slightly
  const stats = [
    { label: 'Total Vehicles', value: summary.totalVehicles || 0, icon: '🚗', color: 'border-l-blue-500' },
    { label: 'Total Brands', value: summary.totalBrands || 0, icon: '🏷️', color: 'border-l-purple-500', cursor: 'cursor-pointer hover:bg-purple-50', onClick: () => navigate('/brands') },
    { label: 'Completed Bookings', value: summary.completedBookingsCount || 0, icon: '✅', color: 'border-l-emerald-500', cursor: 'cursor-pointer hover:bg-emerald-50', onClick: () => setShowCompleted(!showCompleted) },
    { label: 'Pending Bookings', value: summary.pendingBookingsCount || 0, icon: '⏳', color: 'border-l-amber-500', cursor: 'cursor-pointer hover:bg-amber-50', onClick: () => setShowPending(!showPending) },
    { label: 'Rejected Bookings', value: summary.rejectedBookingsCount || 0, icon: '❌', color: 'border-l-red-500', cursor: 'cursor-pointer hover:bg-red-50', onClick: () => setShowRejected(!showRejected) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Admin Dashboard</h1>
          <p className="mt-1 text-slate-500">Overview of the entire vehicle store platform.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="bg-purple-600 text-white font-bold rounded-xl px-5 py-2.5 hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>➕</span> Add Brand
          </button>
          <button
            onClick={() => navigate('/admin/vehicles/add')}
            className="bg-blue-600 text-white font-bold rounded-xl px-5 py-2.5 hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>➕</span> Add Vehicle
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={stat.onClick}
            className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 ${stat.color} border-l-4 ${stat.cursor || ''} transition-colors`}
          >
            <div className="text-4xl bg-slate-50 p-3 rounded-xl">{stat.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Bookings Action Panel */}
      {showPending && (
        <div className="mb-12 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            ⏳ Pending Approvals
            <span className="bg-amber-100 text-amber-700 text-sm py-0.5 px-2.5 rounded-full">{summary.pendingBookingsList?.length || 0}</span>
          </h2>
          {summary.pendingBookingsList?.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center text-slate-500">
              No pending bookings at the moment.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {summary.pendingBookingsList.map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                          {booking.user?.username || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <span className="font-bold">{booking.vehicle?.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(booking.bookedAt || booking.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {actionLoading === booking.id ? (
                            <span className="text-blue-500 font-medium">Updating...</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                                className="px-3 py-1.5 bg-green-50 text-green-600 font-bold rounded-lg hover:bg-green-100 transition-colors text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                                className="px-3 py-1.5 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors text-xs"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Bookings Panel */}
      {showCompleted && (
        <div className="mb-12 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            ✅ Completed Bookings
            <span className="bg-emerald-100 text-emerald-700 text-sm py-0.5 px-2.5 rounded-full">{summary.completedBookingsList?.length || 0}</span>
          </h2>
          {summary.completedBookingsList?.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center text-slate-500">
              No completed bookings.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {summary.completedBookingsList.map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                          {booking.user?.username || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <span className="font-bold">{booking.vehicle?.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(booking.bookedAt || booking.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold inline-block">
                            CONFIRMED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rejected Bookings Panel */}
      {showRejected && (
        <div className="mb-12 animate-fade-in">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            ❌ Rejected Bookings
            <span className="bg-red-100 text-red-700 text-sm py-0.5 px-2.5 rounded-full">{summary.rejectedBookingsList?.length || 0}</span>
          </h2>
          {summary.rejectedBookingsList?.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center text-slate-500">
              No rejected bookings.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {summary.rejectedBookingsList.map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                          {booking.user?.username || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <span className="font-bold">{booking.vehicle?.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(booking.bookedAt || booking.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold inline-block">
                            CANCELLED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vehicle Summary by Brand */}
      <h2 className="text-xl font-bold text-slate-800 mb-6">Vehicle Inventory by Brand</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Models</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Available Stock</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Petrol Models</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Diesel Models</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Electric Models</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {summary.brandSummaries && summary.brandSummaries.length > 0 ? (
                summary.brandSummaries.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                      {b.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-slate-600">
                      {b.models}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">
                      {b.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-500">
                      {b.petrol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-500">
                      {b.diesel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-500">
                      {b.electric}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">
                    No summary data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AddBrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onSuccess={fetchSummary}
      />
    </div>
  );
};

export default Dashboard;
