import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAllBookings, updateBookingStatus } from '../../api/bookings';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load all bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(id);
      await updateBookingStatus(id, newStatus);
      toast.success('Status updated successfully');
      setBookings((prev) => 
        prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
      );
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Manage Bookings</h1>
        <p className="mt-1 text-slate-500">View and update the status of all user bookings.</p>
      </div>

      {loading ? (
        <Loader />
      ) : bookings.length === 0 ? (
        <EmptyState icon="📝" message="No bookings have been made yet." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#DBEAFE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#F8FAFF]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#F8FAFF] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                      #{booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {booking.user?.username || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{booking.vehicle?.name}</span>
                        <span className="text-xs text-slate-500">{booking.vehicle?.brand?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {actionLoading === booking.id ? (
                        <span className="text-[#1E3A5F]">Updating...</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {booking.status === 'PENDING' && (
                            <>
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
                            </>
                          )}
                          {booking.status === 'CONFIRMED' && (
                             <button
                                onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                                className="px-3 py-1.5 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors text-xs"
                              >
                                Cancel
                              </button>
                          )}
                          {booking.status === 'CANCELLED' && (
                            <span className="text-slate-400 text-xs font-semibold">Processed</span>
                          )}
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
  );
};

export default AllBookings;
