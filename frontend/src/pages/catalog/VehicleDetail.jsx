import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import toast from 'react-hot-toast';
import { authAtom } from '../../recoil/authAtom';
import { getVehicleById } from '../../api/vehicles';
import { createBooking } from '../../api/bookings';
import { addBookmark, removeBookmark, getMyBookmarks } from '../../api/bookmarks';
import Loader from '../../components/Loader';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authAtom);

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  // Interactions state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getVehicleById(id);
        setVehicle(data);
        setActiveImage(data.thumbnailUrl || 'https://via.placeholder.com/800x400');

        // If user logged in, check if bookmarked
        if (auth.isLoggedIn && auth.userType === 'U') {
          const bookmarksData = await getMyBookmarks();
          // Assuming array of bookmark objects { id, vehicle }
          const existing = bookmarksData.find(b => b.vehicle.id === Number(id));
          if (existing) {
            setIsBookmarked(true);
            setBookmarkId(existing.id);
          }
        }
      } catch (err) {
        toast.error('Failed to load vehicle details');
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, auth.isLoggedIn, navigate]);

  const toggleBookmark = async () => {
    if (!auth.isLoggedIn) {
      toast.error('Please login to bookmark vehicles');
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked && bookmarkId) {
        await removeBookmark(bookmarkId);
        setIsBookmarked(false);
        setBookmarkId(null);
        toast.success('Removed from bookmarks');
      } else {
        const res = await addBookmark(id);
        setIsBookmarked(true);
        setBookmarkId(res.id); // Assuming backend returns created bookmark obj
        toast.success('Added to bookmarks');
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleBookNow = async () => {
    try {
      setBookingLoading(true);
      await createBooking(id);

      if (isBookmarked && bookmarkId) {
        try {
          await removeBookmark(bookmarkId);
          setIsBookmarked(false);
          setBookmarkId(null);
        } catch (e) {
          console.error('Failed to auto-remove bookmark', e);
        }
      }

      toast.success('Booking requested successfully!');
      setShowModal(false);
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || !vehicle) return <Loader fullScreen />;

  const specs = vehicle.specs ? JSON.parse(vehicle.specs) : {};

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-12">
      {/* Hero Image */}
      <div className="w-full h-64 md:h-96 bg-slate-200 relative">
        <img
          src={activeImage}
          alt={vehicle.name}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 shadow-sm">{vehicle.name}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                {vehicle.brand?.name}
              </span>
              <span className="flex items-center gap-1">
                ⛽ {vehicle.fuelType?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Column (60%) */}
          <div className="w-full lg:w-3/5 space-y-8">
            {/* Gallery */}
            {vehicle.images && vehicle.images.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <img
                  src={vehicle.thumbnailUrl || 'https://via.placeholder.com/800x400'}
                  onClick={() => setActiveImage(vehicle.thumbnailUrl)}
                  className={`h-24 w-32 object-cover object-center rounded-xl cursor-pointer border-2 transition-all ${activeImage === vehicle.thumbnailUrl ? 'border-blue-600 scale-105' : 'border-transparent hover:border-blue-300'
                    }`}
                />
                {vehicle.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.image_url}
                    onClick={() => setActiveImage(img.image_url)}
                    className={`h-24 w-32 object-cover object-center rounded-xl cursor-pointer border-2 transition-all shrink-0 ${activeImage === img.image_url ? 'border-blue-600 scale-105' : 'border-transparent hover:border-blue-300'
                      }`}
                  />
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Description</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {vehicle.description || 'No description provided.'}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Specifications</h2>
              {Object.keys(specs).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {Object.entries(specs).map(([key, val], idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-medium">{key}</span>
                      <span className="text-slate-800 font-semibold text-right">{val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No specifications available.</p>
              )}
            </div>
          </div>

          {/* Right Column (40%) */}
          <div className="w-full lg:w-2/5">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 transform transition-all hover:scale-[1.01]">
              <div className="mb-6">
                <p className="text-slate-500 uppercase tracking-widest text-sm font-bold mb-1">Price</p>
                <h3 className="text-4xl font-extrabold text-blue-600">
                  ${vehicle.price?.toLocaleString()}
                </h3>
                <p className="text-sm text-slate-400 mt-2">Available Stock: {vehicle.stock}</p>
              </div>

              <div className="space-y-4">
                {(!auth.isLoggedIn || auth.userType === 'U') && (
                  <>
                    <button
                      onClick={() => auth.isLoggedIn ? setShowModal(true) : navigate('/login')}
                      className="w-full bg-blue-600 text-white font-bold rounded-xl py-4 hover:bg-blue-700 transition-colors shadow-sm text-lg"
                    >
                      {auth.isLoggedIn ? 'Book Now' : 'Login to Book'}
                    </button>

                    <button
                      onClick={toggleBookmark}
                      className={`w-full font-bold rounded-xl py-4 transition-colors border-2 flex items-center justify-center gap-2 ${isBookmarked
                          ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <span className={isBookmarked ? 'text-amber-500' : 'text-slate-400'}>
                        {isBookmarked ? '❤️' : '🤍'}
                      </span>
                      {isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
                    </button>
                  </>
                )}
                {auth.userType === 'A' && (
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-200">
                    You are viewing this as an admin. User actions are disabled.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Confirm Booking</h3>
            <p className="text-slate-600 mb-6">
              You are about to book the <span className="font-bold">{vehicle.name}</span> for <span className="text-blue-600 font-bold">${vehicle.price?.toLocaleString()}</span>.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold rounded-xl py-3 hover:bg-slate-200 transition-colors"
                disabled={bookingLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleBookNow}
                className="flex-1 bg-blue-600 text-white font-bold rounded-xl py-3 hover:bg-blue-700 transition-colors flex justify-center items-center"
                disabled={bookingLoading}
              >
                {bookingLoading ? <Loader inline /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetail;
