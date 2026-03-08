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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getVehicleById(id);

        const safePhotos = [];
        if (data.thumbnailUrl) safePhotos.push({ url: data.thumbnailUrl });
        if (data.photos && data.photos.length > 0) {
          safePhotos.push(...data.photos);
        }
        data.allPhotos = safePhotos.length > 0 ? safePhotos : [{ url: 'https://via.placeholder.com/800x400' }];

        setVehicle(data);

        if (auth.isLoggedIn && auth.userType === 'U') {
          const bookmarksData = await getMyBookmarks();
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


  useEffect(() => {
    // Pause auto-slider if there aren't enough photos or if the zoom modal is currently open.
    if (!vehicle || !vehicle.allPhotos || vehicle.allPhotos.length <= 1 || isZoomModalOpen) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev === vehicle.allPhotos.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [vehicle, isZoomModalOpen]);

  useEffect(() => {
    if (!isZoomModalOpen || !vehicle || !vehicle.allPhotos) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentPhotoIndex(prev => (prev === 0 ? vehicle.allPhotos.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPhotoIndex(prev => (prev === vehicle.allPhotos.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'Escape') {
        setIsZoomModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomModalOpen, vehicle]);

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
      const errorMsg = err.response?.data?.message || 'Failed to create booking';
      if (errorMsg.toLowerCase().includes('out of stock')) {
        toast.error('Vehicle is out of stock, will notify once available');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || !vehicle) return <Loader fullScreen />;

  const specs = vehicle.specs ? JSON.parse(vehicle.specs) : {};

  return (
    <div className="bg-[#F8FAFF] min-h-[calc(100vh-64px)] pb-12">
      {/* Hero Image */}
      <div className="w-full h-64 md:h-96 bg-slate-200 relative">
        <img
          src={vehicle.thumbnailUrl || 'https://via.placeholder.com/800x400'}
          alt={vehicle.name}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 shadow-sm">{vehicle.name}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <span className="bg-[#1E3A5F] px-3 py-1 rounded-full text-sm font-bold shadow-sm">
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
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DBEAFE]">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Description</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {vehicle.description || 'No description provided.'}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DBEAFE]">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Specifications</h2>
              {Object.keys(specs).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {Object.entries(specs).map(([key, val], idx) => (
                    <div key={idx} className="flex justify-between border-b border-[#DBEAFE] pb-2">
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

          <div className="w-full lg:w-2/5">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-[#DBEAFE] p-8 transform transition-all hover:scale-[1.01]">

              {/* Image Slider */}
              <div className="w-full relative rounded-xl overflow-hidden mb-8 shadow-sm h-64 bg-slate-100 group">
                <img
                  src={vehicle.allPhotos[currentPhotoIndex].url}
                  alt={`${vehicle.name} slide ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover cursor-zoom-in group-hover:opacity-95 transition-opacity"
                  onClick={() => setIsZoomModalOpen(true)}
                />

                <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-black/10"></div>

                {vehicle.allPhotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPhotoIndex(prev => (prev === 0 ? vehicle.allPhotos.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 rounded-full h-10 w-10 flex items-center justify-center font-bold shadow-md transition-all backdrop-blur-sm"
                    >
                      &larr;
                    </button>
                    <button
                      onClick={() => setCurrentPhotoIndex(prev => (prev === vehicle.allPhotos.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 rounded-full h-10 w-10 flex items-center justify-center font-bold shadow-md transition-all backdrop-blur-sm"
                    >
                      &rarr;
                    </button>
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 pb-1.5 rounded-full backdrop-blur-sm">
                      {currentPhotoIndex + 1} / {vehicle.allPhotos.length}
                    </div>
                  </>
                )}
              </div>

              <div className="mb-6">
                <p className="text-slate-500 uppercase tracking-widest text-sm font-bold mb-1">Price</p>
                <h3 className="text-4xl font-extrabold text-[#1E3A5F]">
                  ₹{vehicle.price?.toLocaleString()}
                </h3>
                <p className="text-sm text-slate-400 mt-2">Available Stock: {vehicle.stock}</p>
              </div>

              <div className="space-y-4">
                {(!auth.isLoggedIn || auth.userType === 'U') && (
                  <>
                    <button
                      onClick={() => auth.isLoggedIn ? setShowModal(true) : navigate('/login')}
                      disabled={vehicle.stock === 0}
                      className={`w-full text-white font-bold rounded-xl py-4 transition-colors shadow-sm text-lg ${vehicle.stock === 0
                          ? 'bg-slate-400 cursor-not-allowed opacity-80'
                          : 'bg-[#1E3A5F] hover:bg-[#163050]'
                        }`}
                    >
                      {vehicle.stock === 0
                        ? 'Out of Stock'
                        : (auth.isLoggedIn ? 'Book Now' : 'Login to Book')}
                    </button>

                    <button
                      onClick={toggleBookmark}
                      className={`w-full font-bold rounded-xl py-4 transition-colors border-2 flex items-center justify-center gap-2 ${isBookmarked
                        ? 'bg-[#FEF3C7] text-[#B45309] border-[#D97706] hover:bg-[#FDE68A]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <span className={isBookmarked ? 'text-[#D97706]' : 'text-slate-400'}>
                        {isBookmarked ? '❤️' : '🤍'}
                      </span>
                      <span>{isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}</span>
                    </button>
                  </>
                )}
                {auth.userType === 'A' && (
                  <div className="p-4 bg-[#FEF3C7] text-[#92400E] rounded-xl text-sm border border-[#D97706]">
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
              You are about to book the <span className="font-bold">{vehicle.name}</span> for <span className="text-[#1E3A5F] font-bold">₹{vehicle.price?.toLocaleString()}</span>.
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
                className="flex-1 bg-[#1E3A5F] text-white font-bold rounded-xl py-3 hover:bg-[#163050] transition-colors flex justify-center items-center"
                disabled={bookingLoading}
              >
                {bookingLoading ? <Loader inline /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Photo Modal */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md cursor-zoom-out"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsZoomModalOpen(false); }}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-[110]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-6xl w-full h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={vehicle.allPhotos[currentPhotoIndex].url}
              alt={`${vehicle.name} zoomed`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            {vehicle.allPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(prev => (prev === 0 ? vehicle.allPhotos.length - 1 : prev - 1)); }}
                  className="absolute left-4 lg:-left-12 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-14 w-14 flex items-center justify-center font-bold text-2xl transition-all shadow-lg backdrop-blur-sm"
                >
                  &larr;
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(prev => (prev === vehicle.allPhotos.length - 1 ? 0 : prev + 1)); }}
                  className="absolute right-4 lg:-right-12 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full h-14 w-14 flex items-center justify-center font-bold text-2xl transition-all shadow-lg backdrop-blur-sm"
                >
                  &rarr;
                </button>
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-white/70 font-medium tracking-widest text-sm bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md">
                  {currentPhotoIndex + 1} / {vehicle.allPhotos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetail;
