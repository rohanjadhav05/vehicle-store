import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createBrand } from '../api/brands';

const AddBrandModal = ({ isOpen, onClose, onSuccess }) => {
  const [brandModal, setBrandModal] = useState({ name: '', logoUrl: '', country: '' });
  const [isSubmittingBrand, setIsSubmittingBrand] = useState(false);

  if (!isOpen) return null;

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!brandModal.name) return toast.error('Brand name is required');
    try {
      setIsSubmittingBrand(true);
      await createBrand({ name: brandModal.name, logoUrl: brandModal.logoUrl, country: brandModal.country });
      toast.success('Brand added successfully');
      setBrandModal({ name: '', logoUrl: '', country: '' }); // reset
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add brand');
    } finally {
      setIsSubmittingBrand(false);
    }
  };

  const handleClose = () => {
    setBrandModal({ name: '', logoUrl: '', country: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Add New Brand</h3>
        <form onSubmit={handleAddBrand} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={brandModal.name}
              onChange={(e) => setBrandModal({ ...brandModal, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={brandModal.country}
              onChange={(e) => setBrandModal({ ...brandModal, country: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
            <input
              type="url"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={brandModal.logoUrl}
              onChange={(e) => setBrandModal({ ...brandModal, logoUrl: e.target.value })}
            />
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-100 text-slate-700 font-bold rounded-xl py-3 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingBrand}
              className="flex-1 bg-purple-600 text-white font-bold rounded-xl py-3 hover:bg-purple-700 transition-colors disabled:opacity-70"
            >
              {isSubmittingBrand ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBrandModal;
