import axiosInstance from '../utils/axiosInstance';

export const getMyBookmarks = async () => {
  const response = await axiosInstance.get('/bookmarks');
  return response.data;
};

export const addBookmark = async (vehicleId) => {
  const response = await axiosInstance.post(`/bookmarks`, { vehicleId });
  return response.data;
};

export const removeBookmark = async (id) => {
  const response = await axiosInstance.delete(`/bookmarks/${id}`);
  return response.data;
};
