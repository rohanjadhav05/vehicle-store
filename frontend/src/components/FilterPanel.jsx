import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { filterAtom } from '../recoil/filterAtom';
import { getAllBrands } from '../api/brands';
import { getAllFuelTypes } from '../api/fuelTypes';
import toast from 'react-hot-toast';

const FilterPanel = () => {
  const [filters, setFilters] = useRecoilState(filterAtom);
  const [brands, setBrands] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  
  // Local state for inputs before applying
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    const fetchSelectOptions = async () => {
      try {
        const [brandsData, fuelTypesData] = await Promise.all([
          getAllBrands(),
          getAllFuelTypes(),
        ]);
        setBrands(brandsData);
        setFuelTypes(fuelTypesData);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load filter options');
      }
    };
    fetchSelectOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setFilters(localFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { brandId: '', fuelTypeId: '', minPrice: '', maxPrice: '' };
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DBEAFE]">
      <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
        <span>⚙️</span> Filters
      </h3>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
          <select
            name="brandId"
            value={localFilters.brandId || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F]"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
          <select
            name="fuelTypeId"
            value={localFilters.fuelTypeId || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F]"
          >
            <option value="">All Fuel Types</option>
            {fuelTypes.map((ft) => (
              <option key={ft.id} value={ft.id}>
                {ft.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              value={localFilters.minPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] text-sm"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              value={localFilters.maxPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] text-sm"
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-2">
          <button
            onClick={applyFilters}
            className="w-full bg-[#1E3A5F] text-white font-medium rounded-xl py-2.5 hover:bg-[#163050] transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="w-full border border-[#BFDBFE] text-slate-600 font-medium rounded-xl py-2.5 hover:bg-[#F8FAFF] transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
