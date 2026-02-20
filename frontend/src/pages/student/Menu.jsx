import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { FiPlus, FiMinus, FiShoppingCart, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const { addToCart, getItemQuantity, incrementQuantity, decrementQuantity, itemCount, total } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await menuAPI.getAll({ available: true });
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = filter === 'ALL' 
    ? menuItems 
    : menuItems.filter(item => item.category === filter);

  const getCategoryBadge = (category) => {
    const badges = {
      HOT: 'badge-hot',
      SPECIAL: 'badge-special',
      USUAL: 'badge-usual'
    };
    return badges[category] || 'badge-usual';
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Menu</h1>
          <p className="text-gray-400">Choose from our delicious offerings</p>
        </div>
        
        {itemCount > 0 && (
          <button
            onClick={() => navigate('/student/cart')}
            className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-all duration-200"
          >
            <FiShoppingCart />
            <span>Cart ({itemCount})</span>
            <span className="font-bold">₹{total}</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        <FiFilter className="text-gray-400 flex-shrink-0" />
        {['ALL', 'HOT', 'SPECIAL', 'USUAL'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
              filter === cat
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {cat === 'ALL' ? 'All Items' : cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="w-full h-32 bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No items available in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const quantity = getItemQuantity(item._id);
            
            return (
              <div
                key={item._id}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700 card-hover"
              >
                {/* Item Image Placeholder */}
                <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">🍽️</span>
                </div>

                {/* Item Details */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <span className={`badge ${getCategoryBadge(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-orange-400">₹{item.price}</p>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Add to Cart */}
                {quantity === 0 ? (
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FiPlus />
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => decrementQuantity(item._id)}
                      className="w-10 h-10 flex items-center justify-center text-orange-400 hover:bg-gray-600 rounded-lg transition-all duration-200"
                    >
                      <FiMinus />
                    </button>
                    <span className="text-white font-semibold">{quantity}</span>
                    <button
                      onClick={() => incrementQuantity(item._id)}
                      className="w-10 h-10 flex items-center justify-center text-orange-400 hover:bg-gray-600 rounded-lg transition-all duration-200"
                    >
                      <FiPlus />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden">
          <button
            onClick={() => navigate('/student/cart')}
            className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg shadow-orange-500/30 transition-all duration-200"
          >
            <FiShoppingCart />
            <span>{itemCount} items</span>
            <span className="font-bold">₹{total}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;
