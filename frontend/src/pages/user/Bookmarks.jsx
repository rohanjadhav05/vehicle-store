import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import { bookmarkAtom } from '../../recoil/bookmarkAtom';
import { getMyBookmarks, removeBookmark } from '../../api/bookmarks';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import { useNavigate } from 'react-router-dom';

const Bookmarks = () => {
  const [bookmarkState, setBookmarkState] = useRecoilState(bookmarkAtom);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setBookmarkState((prev) => ({ ...prev, loading: true }));
        const data = await getMyBookmarks();
        setBookmarkState({ bookmarks: data, loading: false });
      } catch (err) {
        toast.error('Failed to load bookmarks');
        setBookmarkState((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchBookmarks();
  }, [setBookmarkState]);

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    try {
      await removeBookmark(id);
      setBookmarkState((prev) => ({
        ...prev,
        bookmarks: prev.bookmarks.filter((b) => b.id !== id),
      }));
      toast.success('Removed from bookmarks');
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-3">
          <span>My Bookmarks</span> <span className="text-red-500">❤️</span>
        </h1>
        <p className="mt-3 text-slate-500 text-lg">Vehicles you've saved for later.</p>
      </div>

      {bookmarkState.loading ? (
        <Loader />
      ) : bookmarkState.bookmarks.length === 0 ? (
        <EmptyState icon="😕" message="No bookmarks yet. Start exploring vehicles!" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bookmarkState.bookmarks.map((bookmark) => {
            const vehicle = bookmark.vehicle;
            return (
              <div
                key={bookmark.id}
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group relative"
              >
                <button
                  onClick={(e) => handleRemove(e, bookmark.id)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 z-10 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={vehicle.thumbnailUrl || 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg'}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                    {vehicle.brand?.name}
                  </span>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{vehicle.name}</h3>
                  <div className="text-blue-600 font-extrabold text-xl mt-auto">
                    ${vehicle.price?.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
