import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { FiClock, FiPlay, FiCheck, FiPackage, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrdersKanban = () => {
  const [orders, setOrders] = useState({
    AWAITING_PAYMENT: [],
    QUEUED: [],
    PREPARING: [],
    READY: [],
    SERVED: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getKanban();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order moved to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleMarkPaid = async (orderId) => {
    try {
      await orderAPI.markPaid(orderId);
      toast.success('Payment confirmed');
      fetchOrders();
    } catch (error) {
      console.error('Error marking paid:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    }
  };

  const handleVerifyPayment = async (orderId) => {
    try {
      await orderAPI.verifyPayment(orderId);
      toast.success('Online payment verified');
      fetchOrders();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error(error.response?.data?.message || 'Failed to verify payment');
    }
  };

  const columns = [
    { 
      key: 'AWAITING_PAYMENT', 
      title: 'Awaiting Payment', 
      color: 'border-orange-500',
      bgColor: 'bg-orange-500/10',
      icon: FiAlertCircle
    },
    { 
      key: 'QUEUED', 
      title: 'In Queue', 
      color: 'border-blue-500',
      bgColor: 'bg-blue-500/10',
      icon: FiClock
    },
    { 
      key: 'PREPARING', 
      title: 'Preparing', 
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-500/10',
      icon: FiPlay
    },
    { 
      key: 'READY', 
      title: 'Ready', 
      color: 'border-green-500',
      bgColor: 'bg-green-500/10',
      icon: FiCheck
    },
    { 
      key: 'SERVED', 
      title: 'Served', 
      color: 'border-gray-500',
      bgColor: 'bg-gray-500/10',
      icon: FiPackage
    }
  ];

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const OrderCard = ({ order, column }) => (
    <div className={`bg-gray-700/50 rounded-lg p-4 border-l-4 ${column.color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm text-orange-400">
          #{order.order_id.substring(0, 8).toUpperCase()}
        </span>
        <span className="text-xs text-gray-400">{formatTime(order.timestamp)}</span>
      </div>
      
      <p className="text-white font-medium mb-1">{order.student?.name || 'Student'}</p>
      
      <div className="text-sm text-gray-400 mb-3">
        {order.items.map((item, i) => (
          <span key={i}>
            {item.name} × {item.quantity}
            {i < order.items.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-white">₹{order.total_amount}</span>
        <span className={`text-xs px-2 py-1 rounded ${
          order.payment_mode === 'ONLINE' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
        }`}>
          {order.payment_mode} • Counter {order.counter}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {column.key === 'AWAITING_PAYMENT' && (
          <button
            onClick={() => handleMarkPaid(order.order_id)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded-lg transition-all duration-200"
          >
            Mark Paid
          </button>
        )}
        
        {column.key === 'QUEUED' && (
          <button
            onClick={() => handleStatusUpdate(order.order_id, 'PREPARING')}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-2 px-3 rounded-lg transition-all duration-200"
          >
            Start Preparing
          </button>
        )}
        
        {column.key === 'PREPARING' && (
          <button
            onClick={() => handleStatusUpdate(order.order_id, 'READY')}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded-lg transition-all duration-200"
          >
            Mark Ready
          </button>
        )}
        
        {column.key === 'READY' && (
          <span className="text-xs text-gray-400 text-center w-full py-2">
            Waiting for pickup
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <h1 className="text-3xl font-bold text-white mb-6">Order Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {columns.map((col) => (
            <div key={col.key} className="bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Order Management</h1>
        <p className="text-gray-400">Drag and drop orders or use action buttons</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map((column) => (
          <div key={column.key} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className={`flex items-center gap-2 mb-4 p-2 rounded-lg ${column.bgColor}`}>
              <column.icon className={`text-lg ${column.color.replace('border-', 'text-')}`} />
              <h3 className="font-semibold text-white">{column.title}</h3>
              <span className="ml-auto bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                {orders[column.key]?.length || 0}
              </span>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
              {orders[column.key]?.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">No orders</p>
              ) : (
                orders[column.key]?.map((order) => (
                  <OrderCard key={order._id} order={order} column={column} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersKanban;
