import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { orderAPI } from '../../services/api';
import { FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle, FiPackage, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getById(orderId);
      setOrder(response.data);
      
      // Show toast when order becomes ready
      if (response.data.order_status === 'READY' && order?.order_status !== 'READY') {
        toast.success('🎉 Your order is ready for pickup!', { duration: 6000 });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Order not found');
      navigate('/student/orders');
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.order_id);
    toast.success('Order ID copied!');
  };

  const getStatusStep = (status) => {
    const steps = {
      'CREATED': 0,
      'AWAITING_PAYMENT': 1,
      'PENDING': 1,
      'PAID': 2,
      'QUEUED': 2,
      'PREPARING': 3,
      'READY': 4,
      'SERVED': 5
    };
    return steps[status] || 0;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="animate-fadeIn flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  const currentStep = getStatusStep(order.order_status);
  const isOnline = order.payment_mode === 'ONLINE';
  
  const steps = isOnline
    ? ['Order Created', 'Payment Pending', 'In Queue', 'Preparing', 'Ready', 'Served']
    : ['Order Created', 'Awaiting Payment', 'In Queue', 'Preparing', 'Ready', 'Served'];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/student/orders')}
          className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-200"
        >
          <FiArrowLeft className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Order Details</h1>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="font-mono">#{order.order_id.substring(0, 8).toUpperCase()}</span>
            <button onClick={copyOrderId} className="hover:text-orange-400">
              <FiCopy className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Status & QR */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Alert */}
          {order.order_status === 'READY' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
              <FiCheckCircle className="text-4xl text-green-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-green-400 mb-2">Your Order is Ready!</h2>
              <p className="text-gray-400">Please collect from <strong className="text-white">Counter {order.counter}</strong></p>
            </div>
          )}

          {order.order_status === 'AWAITING_PAYMENT' && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 text-center">
              <FiAlertCircle className="text-4xl text-orange-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-orange-400 mb-2">Payment Required</h2>
              <p className="text-gray-400">Please complete payment at <strong className="text-white">Counter A</strong></p>
            </div>
          )}

          {/* Progress Steps */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">Order Progress</h3>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-700">
                <div 
                  className="h-full bg-orange-500 transition-all duration-500"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                      index <= currentStep
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-500'
                    }`}>
                      {index < currentStep ? (
                        <FiCheckCircle />
                      ) : index === currentStep ? (
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center max-w-[60px] ${
                      index <= currentStep ? 'text-orange-400' : 'text-gray-500'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Queue Info */}
            {order.queue_position && !['READY', 'SERVED'].includes(order.order_status) && (
              <div className="mt-6 flex items-center justify-center gap-6 p-4 bg-gray-700/50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">#{order.queue_position}</p>
                  <p className="text-xs text-gray-400">Queue Position</p>
                </div>
                <div className="w-px h-10 bg-gray-600"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">~{order.estimated_time} min</p>
                  <p className="text-xs text-gray-400">Estimated Wait</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
            
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-white">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
              <span className="font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-orange-400">₹{order.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Right Column - QR & Info */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Order Receipt</h3>
            
            <div className="bg-white rounded-xl p-4 mb-4">
              <QRCodeSVG
                value={order.qr_token}
                size={200}
                className="mx-auto"
                level="H"
              />
            </div>

            <p className="text-center text-sm text-gray-400 mb-4">
              {order.order_status === 'SERVED' 
                ? 'Order completed'
                : 'Show this QR at the counter'}
            </p>

            {order.order_status === 'SERVED' && (
              <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                <FiPackage className="text-2xl text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Order has been served</p>
              </div>
            )}
          </div>

          {/* Order Info */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Order Info</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Counter</span>
                <span className="font-semibold text-white">{order.counter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Mode</span>
                <span className="font-semibold text-white">{order.payment_mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Status</span>
                <span className={`font-semibold ${
                  order.payment_status === 'PAID' ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {order.payment_status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Order Time</span>
                <span className="text-white">{formatDate(order.timestamp)}</span>
              </div>
              {order.paid_at && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Paid At</span>
                  <span className="text-white">{formatDate(order.paid_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
