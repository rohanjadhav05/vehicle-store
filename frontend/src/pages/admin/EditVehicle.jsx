import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getVehicleById, updateVehicle } from '../../api/vehicles';
import { getAllBrands } from '../../api/brands';
import { getAllFuelTypes } from '../../api/fuelTypes';
import Loader from '../../components/Loader';

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    brand_id: '',
    fuelType_id: '',
    price: '',
    stock: '',
    description: '',
    thumbnailUrl: '',
  });

  const [specs, setSpecs] = useState([{ key: '', value: '' }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleData, brandsData, fuelTypesData] = await Promise.all([
          getVehicleById(id),
          getAllBrands(),
          getAllFuelTypes()
        ]);

        setBrands(brandsData);
        setFuelTypes(fuelTypesData);

        setFormData({
          name: vehicleData.name,
          brandId: vehicleData.brand?.id || '',
          fuelTypeId: vehicleData.fuelType?.id || '',
          price: vehicleData.price,
          stock: vehicleData.stock,
          description: vehicleData.description || '',
          thumbnailUrl: vehicleData.thumbnailUrl || '',
        });

        if (vehicleData.specs) {
          const parsed = JSON.parse(vehicleData.specs);
          const specsArray = Object.keys(parsed).map(k => ({ key: k, value: parsed[k] }));
          setSpecs(specsArray);
        }
      } catch (err) {
        toast.error('Failed to load vehicle details');
        navigate('/admin/vehicles');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      specs: JSON.stringify(specsObj)
    };

    try {
      setLoading(true);
      await updateVehicle(id, payload);
      toast.success('Vehicle updated successfully!');
      navigate('/admin/vehicles');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/vehicles')}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          ⬅️ Back
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Edit Vehicle</h1>
          <p className="mt-1 text-slate-500">Update the details of <span className="font-bold text-slate-700">{formData.name}</span>.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name / Model *</label>
              <input
                type="text" name="name" required value={formData.name} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
              <select
                name="brand_id" required value={formData.brand_id} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
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
                name="fuelType_id" required value={formData.fuelType_id} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="" disabled>Select fuel type</option>
                {fuelTypes.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($) *</label>
              <input
                type="number" step="0.01" name="price" required value={formData.price} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity *</label>
              <input
                type="number" name="stock" required value={formData.stock} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail URL</label>
              <input
                type="url" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description" rows="4" value={formData.description} onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Specifications</h3>
            <div className="space-y-3">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="text" placeholder="Key (e.g. Engine)" value={spec.key}
                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text" placeholder="Value (e.g. 2.0L Turbo)" value={spec.value}
                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="mt-2 text-sm font-medium text-blue-600 border border-blue-200 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
              >
                + Add Spec
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button
              type="button" onClick={() => navigate('/admin/vehicles')}
              className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[120px]"
            >
              {loading ? <Loader inline /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicle;
