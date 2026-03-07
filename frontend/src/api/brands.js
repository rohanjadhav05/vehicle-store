import axiosInstance from '../utils/axiosInstance';

export const getAllBrands = async () => {
  const response = await axiosInstance.get('/brands');
  return response.data;
};

export const createBrand = async (brandData) => {
  const response = await axiosInstance.post('/brands', brandData);
  return response.data;
};
