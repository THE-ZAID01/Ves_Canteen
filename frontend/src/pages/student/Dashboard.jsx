import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';
import { FiShoppingBag, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveOrders();
    // Poll every 5 seconds
    const interval = setInterval(fetchActiveOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      const active = response.data.filter(
        order => !['SERVED'].includes(order.order_status)
      );
      setActiveOrders(active);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      CREATED: 'text-gray-400',
      AWAITING_PAYMENT: 'text-orange-400',
      QUEUED: 'text-blue-400',
      PREPARING: 'text-yellow-400',
      READY: 'text-green-400',
      SERVED: 'text-gray-500'
    };
    return colors[status] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    if (status === 'READY') return <FiCheckCircle className="text-green-400 text-xl" />;
    if (status === 'AWAITING_PAYMENT') return <FiAlertCircle className="text-orange-400 text-xl" />;
    return <FiClock className="text-gray-400 text-xl" />;
  };

  return (
    <div className="animate-fadeIn">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, <span className="text-orange-400">{user?.name?.split(' ')[0]}</span>!
        </h1>
        <p className="text-gray-400">Ready to order something delicious?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          to="/student/menu"
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 card-hover"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiShoppingBag className="text-2xl text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Order Now</h3>
              <p className="text-white/70">Browse menu and place order</p>
            </div>
          </div>
        </Link>

        <Link
          to="/student/orders"
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 card-hover"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <FiClock className="text-2xl text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Order History</h3>
              <p className="text-gray-400">View all your orders</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Active Orders */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Active Orders</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No active orders</p>
            <Link
              to="/student/menu"
              className="inline-block mt-4 text-orange-400 hover:text-orange-300"
            >
              Start ordering →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <Link
                key={order._id}
                to={`/student/orders/${order.order_id}`}
                className="block bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(order.order_status)}
                    <div>
                      <p className="font-medium text-white">
                        Order #{order.order_id.substring(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-400">
                        {order.items.length} item(s) • ₹{order.total_amount}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getStatusColor(order.order_status)}`}>
                      {order.order_status.replace('_', ' ')}
                    </span>
                    {order.order_status === 'READY' && (
                      <p className="text-xs text-green-400 mt-1">
                        Counter {order.counter} • Collect now!
                      </p>
                    )}
                    {order.queue_position && order.order_status !== 'READY' && (
                      <p className="text-xs text-gray-400 mt-1">
                        Queue: #{order.queue_position} • ~{order.estimated_time} min
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
