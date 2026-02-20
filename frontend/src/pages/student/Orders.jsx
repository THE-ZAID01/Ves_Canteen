import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { FiClock, FiCheckCircle, FiAlertCircle, FiPackage } from 'react-icons/fi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === 'ALL'
    ? orders
    : filter === 'ACTIVE'
      ? orders.filter(o => !['SERVED'].includes(o.order_status))
      : orders.filter(o => o.order_status === 'SERVED');

  const getStatusColor = (status) => {
    const colors = {
      CREATED: 'bg-gray-500/20 text-gray-400',
      AWAITING_PAYMENT: 'bg-orange-500/20 text-orange-400',
      QUEUED: 'bg-blue-500/20 text-blue-400',
      PREPARING: 'bg-yellow-500/20 text-yellow-400',
      READY: 'bg-green-500/20 text-green-400',
      SERVED: 'bg-gray-500/20 text-gray-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusIcon = (status) => {
    if (status === 'READY') return <FiCheckCircle className="text-green-400" />;
    if (status === 'AWAITING_PAYMENT') return <FiAlertCircle className="text-orange-400" />;
    if (status === 'SERVED') return <FiPackage className="text-gray-500" />;
    return <FiClock className="text-gray-400" />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-6">My Orders</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {['ALL', 'ACTIVE', 'COMPLETED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === f
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/6"></div>
              </div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <FiPackage className="text-4xl text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No orders found</p>
          <Link
            to="/student/menu"
            className="inline-block mt-4 text-orange-400 hover:text-orange-300"
          >
            Start ordering →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link
              key={order._id}
              to={`/student/orders/${order.order_id}`}
              className="block bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(order.order_status)}
                    <h3 className="font-semibold text-white">
                      Order #{order.order_id.substring(0, 8).toUpperCase()}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400">{formatDate(order.timestamp)}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                    {order.order_status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">
                    {order.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-400">₹{order.total_amount}</p>
                  <p className="text-xs text-gray-500">
                    {order.payment_mode} • Counter {order.counter}
                  </p>
                </div>
              </div>

              {order.order_status === 'READY' && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm font-medium">
                    🎉 Your order is ready! Collect from Counter {order.counter}
                  </p>
                </div>
              )}

              {order.queue_position && !['READY', 'SERVED'].includes(order.order_status) && (
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                  <span>Queue: #{order.queue_position}</span>
                  <span>Est. time: ~{order.estimated_time} min</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
