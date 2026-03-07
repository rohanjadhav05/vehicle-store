import React from 'react';
import { useNavigate } from 'react-router-dom';

const VehicleCard = ({ vehicle }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group flex flex-col"
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={vehicle.thumbnailUrl || 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg'}
          alt={vehicle.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        {vehicle.brand?.name && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {vehicle.brand.name}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-slate-800 text-lg line-clamp-1">{vehicle.name}</h3>
        </div>

        <div className="text-sm text-slate-500 flex items-center gap-1 mb-4 flex-grow">
          <span>⛽ {vehicle.fuelType?.name || 'Unknown'}</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-blue-600 font-bold text-xl">
            ${vehicle.price?.toLocaleString()}
          </span>
          <button className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
