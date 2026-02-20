import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderAPI } from '../../services/api';
import { FiSmartphone, FiDollarSign, FiCheck, FiArrowRight, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Payment = () => {
  const [paymentMode, setPaymentMode] = useState('ONLINE');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [showUPILink, setShowUPILink] = useState(false);
  const { cartItems, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0 && !order) {
    navigate('/student/menu');
    return null;
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          menuItem: item._id,
          quantity: item.quantity
        })),
        payment_mode: paymentMode
      };

      const response = await orderAPI.create(orderData);
      setOrder(response.data);
      
      if (paymentMode === 'ONLINE') {
        setShowUPILink(true);
      } else {
        // Offline order - show receipt
        clearCart();
        toast.success('Order placed! Pay at Counter A');
        navigate(`/student/orders/${response.data.order_id}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirmed = async () => {
    setLoading(true);
    try {
      await orderAPI.confirmPayment(order.order_id);
      clearCart();
      toast.success('Payment confirmation sent! Waiting for vendor verification.');
      navigate(`/student/orders/${order.order_id}`);
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const openUPIApp = () => {
    if (order?.upi_link) {
      window.location.href = order.upi_link;
    }
  };

  if (showUPILink && order) {
    return (
      <div className="animate-fadeIn max-w-lg mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSmartphone className="text-3xl text-orange-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
          <p className="text-gray-400 mb-6">Pay ₹{total} using your UPI app</p>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">UPI ID</p>
            <p className="text-lg font-mono text-white">{import.meta.env.VITE_VENDOR_UPI || 'vescanteen@upi'}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={openUPIApp}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FiExternalLink />
              Open UPI App
            </button>

            <button
              onClick={handlePaymentConfirmed}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Confirming...
                </>
              ) : (
                <>
                  <FiCheck />
                  I Have Paid
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Click "I Have Paid" after completing payment. Vendor will verify and confirm.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-6">Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Selection */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Select Payment Method</h2>
          
          <div className="space-y-4">
            {/* Online Payment */}
            <button
              onClick={() => setPaymentMode('ONLINE')}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                paymentMode === 'ONLINE'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  paymentMode === 'ONLINE' ? 'bg-orange-500' : 'bg-gray-700'
                }`}>
                  <FiSmartphone className={`text-2xl ${
                    paymentMode === 'ONLINE' ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Online Payment (UPI)</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Pay instantly using any UPI app
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Counter B</span>
                    <span className="text-gray-500">Skip the payment queue</span>
                  </div>
                </div>
                {paymentMode === 'ONLINE' && (
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <FiCheck className="text-white text-sm" />
                  </div>
                )}
              </div>
            </button>

            {/* Offline Payment */}
            <button
              onClick={() => setPaymentMode('OFFLINE')}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                paymentMode === 'OFFLINE'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  paymentMode === 'OFFLINE' ? 'bg-orange-500' : 'bg-gray-700'
                }`}>
                  <FiDollarSign className={`text-2xl ${
                    paymentMode === 'OFFLINE' ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Pay at Counter</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Cash or UPI at the payment counter
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">Counter A</span>
                    <span className="text-gray-500">Pay when collecting</span>
                  </div>
                </div>
                {paymentMode === 'OFFLINE' && (
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <FiCheck className="text-white text-sm" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-8">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between text-gray-400">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4 mb-6">
              <div className="flex justify-between text-white">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-orange-400">₹{total}</span>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400">
                {paymentMode === 'ONLINE' ? (
                  <>Collect from <strong className="text-blue-400">Counter B</strong> after payment confirmation</>
                ) : (
                  <>Pay and collect from <strong className="text-orange-400">Counter A</strong></>
                )}
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Placing Order...
                </>
              ) : (
                <>
                  Place Order
                  <FiArrowRight />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
