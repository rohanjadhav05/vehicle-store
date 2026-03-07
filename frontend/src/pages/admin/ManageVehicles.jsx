import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllVehicles, deleteVehicle } from '../../api/vehicles';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import AddBrandModal from '../../components/AddBrandModal';

const ManageVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await getAllVehicles();
      setVehicles(data.content || data);
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDeleteConfirm = async () => {
    try {
      await deleteVehicle(deleteModal.id);
      toast.success('Vehicle deleted successfully');
      setVehicles(vehicles.filter(v => v.id !== deleteModal.id));
      setDeleteModal({ show: false, id: null, name: '' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete vehicle');
    }
  };

  const filteredVehicles = vehicles.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.brand?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1E3A5F]">Manage Vehicles</h1>
          <p className="mt-1 text-slate-500 font-medium">Add, edit, or remove vehicles from the catalog.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="bg-[#D97706] text-white font-bold rounded-xl px-6 py-3 hover:bg-[#B45309] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>➕</span> Add Brand
          </button>
          <button
            onClick={() => navigate('/admin/vehicles/add')}
            className="bg-[#1E3A5F] text-white font-bold rounded-xl px-6 py-3 hover:bg-[#163050] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>✨</span> Add Vehicle
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or brand..."
          className="w-full sm:w-96 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader />
      ) : filteredVehicles.length === 0 ? (
        <EmptyState icon="🚙" message="No vehicles match your search." />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#DBEAFE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#F8FAFF]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thumbnail</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fuel Type</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-[#F8FAFF] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-16 bg-slate-100 rounded-lg overflow-hidden border border-[#BFDBFE]">
                        <img
                          src={vehicle.thumbnailUrl || 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg'}
                          alt={vehicle.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800">{vehicle.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {vehicle.brand?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 flex items-center gap-1">
                      ⛽ {vehicle.fuelType?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#1E3A5F]">
                      ${vehicle.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center">
                      <span className={`px-2 py-1 rounded-md font-medium ${vehicle.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {vehicle.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/vehicles/edit/${vehicle.id}`)}
                        className="text-[#1E3A5F] hover:text-[#163050] mx-2 p-2 hover:bg-[#F8FAFF] rounded-lg transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, id: vehicle.id, name: vehicle.name })}
                        className="text-red-600 hover:text-red-900 mx-2 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Delete Vehicle</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <span className="font-bold">{deleteModal.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
                className="flex-1 bg-slate-100 text-slate-700 font-bold rounded-xl py-3 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 text-white font-bold rounded-xl py-3 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AddBrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />
    </div>
  );
};

export default ManageVehicles;
