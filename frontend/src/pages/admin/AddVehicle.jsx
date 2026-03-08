import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createVehicle } from '../../api/vehicles';
import { getAllBrands } from '../../api/brands';
import { getAllFuelTypes } from '../../api/fuelTypes';
import Loader from '../../components/Loader';
import { validateImageUrl } from '../../utils/imageUtils';

const AddVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    brandId: '',
    fuelTypeId: '',
    price: '',
    stock: '',
    description: '',
    thumbnailUrl: '',
    specs: ''
  });

  // Specs array builder [{key: '', value: ''}]
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);

  // Photos array builder [{url: ''}]
  const [photos, setPhotos] = useState([{ url: '' }]);

  useEffect(() => {
    const fetchSelectOptions = async () => {
      try {
        const [brandsData, fuelTypesData] = await Promise.all([
          getAllBrands(),
          getAllFuelTypes()
        ]);
        setBrands(brandsData);
        setFuelTypes(fuelTypesData);
      } catch (err) {
        toast.error('Failed to load form options');
      }
    };
    fetchSelectOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpecRow = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpecRow = (index) => setSpecs(specs.filter((_, i) => i !== index));

  const handlePhotoChange = (index, value) => {
    const newPhotos = [...photos];
    newPhotos[index].url = value;
    setPhotos(newPhotos);
  };

  const addPhotoRow = () => setPhotos([...photos, { url: '' }]);
  const removePhotoRow = (index) => setPhotos(photos.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.brandId || !formData.fuelTypeId || formData.price === '' || formData.stock === '') {
      toast.error('Please fill in all mandatory fields (*)');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    if (parseInt(formData.stock, 10) < 0) {
      toast.error('Stock quantity cannot be negative');
      return;
    }

    setLoading(true);

    const urlsToValidate = [];
    if (formData.thumbnailUrl && formData.thumbnailUrl.trim()) {
      urlsToValidate.push(formData.thumbnailUrl.trim());
    }
    const cleanPhotoUrls = photos.map(p => p.url).filter(url => url.trim() !== '');
    urlsToValidate.push(...cleanPhotoUrls);

    if (urlsToValidate.length > 0) {
      toast.loading('Validating images...', { id: 'img-val' });
      const validResults = await Promise.all(urlsToValidate.map(validateImageUrl));
      toast.dismiss('img-val');

      if (validResults.includes(false)) {
        setLoading(false);
        toast.error('One or more image URLs are invalid or broken.');
        return;
      }
    }

    // Reconstruct specs object to JSON string
    const specsObj = {};
    specs.forEach((s) => {
      if (s.key && s.value) {
        specsObj[s.key] = s.value;
      }
    });

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      brandId: parseInt(formData.brandId, 10),
      fuelTypeId: parseInt(formData.fuelTypeId, 10),
      specs: JSON.stringify(specsObj),
      photoUrls: photos.map(p => p.url).filter(url => url.trim() !== ''),
      thumbnailUrl: formData.thumbnailUrl,
      name: formData.name
    };

    try {
      await createVehicle(payload);
      toast.success('Vehicle created successfully!');
      navigate('/admin/vehicles');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/vehicles')}
          className="group flex items-center gap-2 px-4 py-2 bg-white border border-[#BFDBFE] rounded-xl text-[#1E3A5F] font-semibold hover:bg-[#F8FAFF] hover:border-[#1E3A5F] hover:shadow-md transition-all duration-300"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
          <span>Back</span>
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Add New Vehicle</h1>
          <p className="mt-1 text-slate-500">Fill in the details to add a new car to the inventory.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#DBEAFE] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name / Model *</label>
              <input
                type="text" name="name" required maxLength={200} value={formData.name} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
              <select
                name="brandId" required value={formData.brandId} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:outline-none bg-white"
              >
                <option value="" disabled>Select a brand</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type *</label>
              <select
                name="fuelTypeId" required value={formData.fuelTypeId} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:outline-none bg-white"
              >
                <option value="" disabled>Select fuel type</option>
                {fuelTypes.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹) *</label>
              <input
                type="number" step="0.01" name="price" required value={formData.price} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity *</label>
              <input
                type="number" name="stock" required value={formData.stock} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail URL</label>
              <input
                type="url" name="thumbnailUrl" maxLength={1000} value={formData.thumbnailUrl} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description" rows="4" value={formData.description} onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:outline-none"
            />
          </div>

          <div className="border-t border-[#DBEAFE] pt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Gallery Photos</h3>
            <p className="text-sm text-slate-500 mb-4">Add additional image URLs. These will be displayed in the slider.</p>
            <div className="space-y-3">
              {photos.map((photo, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="url" placeholder="https://example.com/image.jpg" maxLength={1000} value={photo.url}
                    onChange={(e) => handlePhotoChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:outline-none"
                  />
                  <button
                    type="button" onClick={() => removePhotoRow(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent shadow-sm"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button
                type="button" onClick={addPhotoRow}
                className="mt-2 text-sm font-medium text-[#1E3A5F] border border-[#BFDBFE] bg-[#F8FAFF] px-4 py-2 rounded-xl hover:bg-[#DBEAFE] transition-colors"
              >
                + Add Photo
              </button>
            </div>
          </div>

          <div className="border-t border-[#DBEAFE] pt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Specifications</h3>
            <div className="space-y-3">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="text" placeholder="Key (e.g. Engine)" value={spec.key}
                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:outline-none"
                  />
                  <input
                    type="text" placeholder="Value (e.g. 2.0L Turbo)" value={spec.value}
                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:outline-none"
                  />
                  <button
                    type="button" onClick={() => removeSpecRow(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent shadow-sm"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button
                type="button" onClick={addSpecRow}
                className="mt-2 text-sm font-medium text-[#1E3A5F] border border-[#BFDBFE] bg-[#F8FAFF] px-4 py-2 rounded-xl hover:bg-[#DBEAFE] transition-colors"
              >
                + Add Spec
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[#DBEAFE] flex justify-end gap-4">
            <button
              type="button" onClick={() => navigate('/admin/vehicles')}
              className="px-6 py-3 border border-[#BFDBFE] text-slate-600 font-bold rounded-xl hover:bg-[#F8FAFF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="px-8 py-3 bg-[#1E3A5F] text-white font-bold rounded-xl hover:bg-[#163050] transition-colors flex items-center justify-center min-w-[120px]"
            >
              {loading ? <Loader inline /> : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle;
