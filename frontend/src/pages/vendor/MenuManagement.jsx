import { useState, useEffect } from 'react';
import { menuAPI } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'USUAL',
    description: ''
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editItem) {
        await menuAPI.update(editItem._id, {
          ...formData,
          price: parseFloat(formData.price)
        });
        toast.success('Item updated successfully');
      } else {
        await menuAPI.create({
          ...formData,
          price: parseFloat(formData.price)
        });
        toast.success('Item added successfully');
      }
      
      setShowModal(false);
      setEditItem(null);
      setFormData({ name: '', price: '', category: 'USUAL', description: '' });
      fetchMenu();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.response?.data?.message || 'Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await menuAPI.delete(id);
      toast.success('Item deleted');
      fetchMenu();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await menuAPI.toggleAvailability(id);
      fetchMenu();
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      HOT: 'badge-hot',
      SPECIAL: 'badge-special',
      USUAL: 'badge-usual'
    };
    return badges[category] || 'badge-usual';
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Menu Management</h1>
          <p className="text-gray-400">Add, edit, or remove menu items</p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setFormData({ name: '', price: '', category: 'USUAL', description: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          <FiPlus />
          Add Item
        </button>
      </div>

      {/* Menu Table */}
      {loading ? (
        <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <p className="text-gray-400 mb-4">No menu items yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-orange-400 hover:text-orange-300"
          >
            Add your first item →
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="text-left p-4 text-gray-400 font-medium">Item</th>
                <th className="text-left p-4 text-gray-400 font-medium">Category</th>
                <th className="text-left p-4 text-gray-400 font-medium">Price</th>
                <th className="text-left p-4 text-gray-400 font-medium">Available</th>
                <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item._id} className="border-t border-gray-700 hover:bg-gray-700/30">
                  <td className="p-4">
                    <p className="font-medium text-white">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-400 truncate max-w-xs">{item.description}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`badge ${getCategoryBadge(item.category)}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-orange-400">₹{item.price}</span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAvailability(item._id)}
                      className={`flex items-center gap-2 ${
                        item.isAvailable ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {item.isAvailable ? (
                        <>
                          <FiToggleRight className="text-2xl" />
                          <span className="text-sm">Yes</span>
                        </>
                      ) : (
                        <>
                          <FiToggleLeft className="text-2xl" />
                          <span className="text-sm">No</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Vada Pav"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 20"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  <option value="USUAL">Usual</option>
                  <option value="SPECIAL">Special</option>
                  <option value="HOT">Hot</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  rows="3"
                  placeholder="Brief description..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                >
                  {editItem ? 'Update' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
