import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import toast from 'react-hot-toast';
import { getAllBrands } from '../../api/brands';
import { filterAtom } from '../../recoil/filterAtom';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const setFilters = useSetRecoilState(filterAtom);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const data = await getAllBrands();
        setBrands(data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load brands');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const handleBrandClick = (brandId) => {
    setFilters((prev) => ({ ...prev, brandId: brandId }));
    navigate('/vehicles');
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-4">Top Auto Brands</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Discover our rich catalog mapped thoroughly by manufacturer. Pick your favorite brand below to instantly explore their available models and configurations.
        </p>
      </div>

      {brands.length === 0 ? (
        <EmptyState icon="🏷️" message="No brands available at the moment." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
          {brands.map((b) => (
            <div
              key={b.id}
              onClick={() => handleBrandClick(b.id)}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl hover:border-blue-100 transform hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="w-24 h-24 bg-white border border-slate-50 text-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-5 group-hover:scale-110 group-hover:-translate-y-1 shadow-sm transition-all duration-300 overflow-hidden">
                {b.logoUrl ? (
                  <img src={b.logoUrl} alt={b.name} className="w-full h-full object-contain p-3" />
                ) : (
                  <span className="font-extrabold text-blue-200">{b.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800 text-center">{b.name}</h3>
              <p className="text-sm font-medium text-blue-600 mt-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                View Vehicles →
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandsPage;
