import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import { bookingAtom } from '../../recoil/bookingAtom';
import { getMyBookings } from '../../api/bookings';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

const MyBookings = () => {
  const [bookingState, setBookingState] = useRecoilState(bookingAtom);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookingState((prev) => ({ ...prev, loading: true }));
        const data = await getMyBookings();
        setBookingState({ bookings: data, loading: false });
      } catch (err) {
        toast.error('Failed to load bookings');
        setBookingState((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchBookings();
  }, [setBookingState]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 flex items-center gap-3 border-b border-[#DBEAFE] pb-6">
        <span className="text-4xl">📦</span>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Bookings</h1>
          <p className="mt-1 text-slate-500">Track your current and past vehicle bookings.</p>
        </div>
      </div>

      {bookingState.loading ? (
        <Loader />
      ) : bookingState.bookings.length === 0 ? (
        <EmptyState icon="📦" message="You have no bookings." />
      ) : (
        <div className="space-y-4">
          {bookingState.bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl shadow-sm border border-[#DBEAFE] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:shadow-md transition-shadow"
            >
              <div className="w-full sm:w-40 h-28 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-50">
                <img
                  src={booking.vehicle?.thumbnailUrl || 'https://via.placeholder.com/200x150'}
                  className="w-full h-full object-cover object-center"
                  alt={booking.vehicle?.name}
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">
                      {booking.vehicle?.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      {booking.vehicle?.brand?.name} • ₹{booking.vehicle?.price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-[#DBEAFE]">
                    <StatusBadge status={booking.status} />
                    <span className="text-xs font-semibold text-slate-400">
                      ID: #{booking.id.toString().padStart(6, '0')}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-slate-400 font-medium">
                  Booked on: {new Date(booking.bookedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
