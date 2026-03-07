import axiosInstance from '../utils/axiosInstance';

export const getMyBookings = async () => {
  const response = await axiosInstance.get('/bookings');
  return response.data;
};

export const createBooking = async (vehicleId) => {
  const response = await axiosInstance.post('/bookings', { vehicleId });
  return response.data;
};

export const getAllBookings = async () => {
  const response = await axiosInstance.get('/bookings/all');
  return response.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await axiosInstance.put(`/bookings/${id}/status`, { status });
  return response.data;
};
