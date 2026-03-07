import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import toast from 'react-hot-toast';
import { vehicleAtom } from '../../recoil/vehicleAtom';
import { filterAtom } from '../../recoil/filterAtom';
import { getAllVehicles } from '../../api/vehicles';
import FilterPanel from '../../components/FilterPanel';
import VehicleCard from '../../components/VehicleCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';

const VehicleCatalog = () => {
  const [vehicleState, setVehicleState] = useRecoilState(vehicleAtom);
  const filters = useRecoilValue(filterAtom);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setVehicleState((prev) => ({ ...prev, loading: true }));
        // Clean up empty filters
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
        );
        const data = await getAllVehicles(cleanFilters);
        
        // Assuming paginated backend but handling unpaginated list directly
        const vehicles = data.content || data; 
        
        setVehicleState({
          vehicles: vehicles,
          loading: false,
          totalCount: data.totalElements || vehicles.length,
        });
      } catch (err) {
        toast.error('Failed to load vehicles');
        setVehicleState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchVehicles();
  }, [filters, setVehicleState]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Explore Vehicles</h1>
        <p className="mt-2 text-slate-500">Find the perfect automobile for your next journey.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4">
          <div className="sticky top-24">
            <FilterPanel />
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          {vehicleState.loading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <Loader />
            </div>
          ) : vehicleState.vehicles.length === 0 ? (
            <EmptyState message="No vehicles found matching your criteria." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {vehicleState.vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCatalog;
