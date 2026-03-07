import axiosInstance from '../utils/axiosInstance';

export const getAllFuelTypes = async () => {
  const response = await axiosInstance.get('/fuel-types');
  return response.data;
};
