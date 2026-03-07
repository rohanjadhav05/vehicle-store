import axiosInstance from '../utils/axiosInstance';

export const getAllVehicles = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.brandId) params.append('brandId', filters.brandId);
  if (filters.fuelTypeId) params.append('fuelTypeId', filters.fuelTypeId);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

  const response = await axiosInstance.get(`/vehicles?${params.toString()}`);
  return response.data;
};

export const getVehicleById = async (id) => {
  const response = await axiosInstance.get(`/vehicles/${id}`);
  return response.data;
};

// Admin only endpoints
export const createVehicle = async (vehicleData) => {
  const response = await axiosInstance.post('/vehicles', vehicleData);
  return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await axiosInstance.put(`/vehicles/${id}`, vehicleData);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await axiosInstance.delete(`/vehicles/${id}`);
  return response.data;
};

export const getVehicleSummary = async () => {
  const response = await axiosInstance.get('/vehicles/summary');
  return response.data;
};
