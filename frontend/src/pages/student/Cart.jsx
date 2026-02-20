import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { FiPlus, FiMinus, FiTrash2, FiArrowRight, FiShoppingBag } from 'react-icons/fi';

const Cart = () => {
  const { cartItems, total, incrementQuantity, decrementQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <FiShoppingBag className="text-4xl text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Add some items to get started</p>
        <button
          onClick={() => navigate('/student/menu')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Cart</h1>
          <p className="text-gray-400">{cartItems.length} item(s)</p>
        </div>
        <button
          onClick={clearCart}
          className="text-red-400 hover:text-red-300 flex items-center gap-2"
        >
          <FiTrash2 />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex items-center gap-4"
            >
              {/* Item Image Placeholder */}
              <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🍽️</span>
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{item.name}</h3>
                <p className="text-orange-400 font-medium">₹{item.price}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-700 rounded-lg">
                  <button
                    onClick={() => decrementQuantity(item._id)}
                    className="w-10 h-10 flex items-center justify-center text-orange-400 hover:bg-gray-600 rounded-l-lg transition-all duration-200"
                  >
                    <FiMinus />
                  </button>
                  <span className="w-10 text-center text-white font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => incrementQuantity(item._id)}
                    className="w-10 h-10 flex items-center justify-center text-orange-400 hover:bg-gray-600 rounded-r-lg transition-all duration-200"
                  >
                    <FiPlus />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="w-10 h-10 flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                >
                  <FiTrash2 />
                </button>
              </div>

              {/* Item Total */}
              <div className="text-right min-w-[80px]">
                <p className="text-white font-bold">₹{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-8">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between text-gray-400">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4 mb-6">
              <div className="flex justify-between text-white">
                <span className="font-semibold">Subtotal</span>
                <span className="font-bold">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/student/payment')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              Proceed to Payment
              <FiArrowRight />
            </button>

            <button
              onClick={() => navigate('/student/menu')}
              className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
            >
              Add More Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
