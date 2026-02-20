import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, orderAPI } from '../../services/api';
import { FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        orderAPI.getKanban()
      ]);
      setStats(analyticsRes.data);
      
      // Get pending and ready orders
      const pending = [
        ...(ordersRes.data.QUEUED || []),
        ...(ordersRes.data.PREPARING || [])
      ].slice(0, 5);
      setPendingOrders(pending);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, subValue }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="text-2xl text-white" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                <div>
                  <div className="h-3 bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                </div>
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
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Today's overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={FiShoppingBag}
          label="Total Orders"
          value={stats?.totalOrders || 0}
          color="bg-blue-500"
          subValue={`Online: ${stats?.onlineOrders || 0} | Offline: ${stats?.offlineOrders || 0}`}
        />
        <StatCard
          icon={FiDollarSign}
          label="Revenue"
          value={`₹${stats?.totalRevenue || 0}`}
          color="bg-green-500"
          subValue={`Online: ₹${stats?.onlineRevenue || 0} | Offline: ₹${stats?.offlineRevenue || 0}`}
        />
        <StatCard
          icon={FiClock}
          label="Pending"
          value={stats?.pendingOrders || 0}
          color="bg-yellow-500"
        />
        <StatCard
          icon={FiCheckCircle}
          label="Ready"
          value={stats?.readyOrders || 0}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions & Pending Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/vendor/orders"
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-4 rounded-lg text-center transition-all duration-200"
            >
              <FiClock className="text-2xl mx-auto mb-2" />
              <span className="font-medium">Manage Orders</span>
            </Link>
            <Link
              to="/vendor/scanner"
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 p-4 rounded-lg text-center transition-all duration-200"
            >
              <FiCheckCircle className="text-2xl mx-auto mb-2" />
              <span className="font-medium">Scan QR</span>
            </Link>
            <Link
              to="/vendor/menu"
              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 p-4 rounded-lg text-center transition-all duration-200"
            >
              <FiShoppingBag className="text-2xl mx-auto mb-2" />
              <span className="font-medium">Edit Menu</span>
            </Link>
            <Link
              to="/vendor/analytics"
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 p-4 rounded-lg text-center transition-all duration-200"
            >
              <FiTrendingUp className="text-2xl mx-auto mb-2" />
              <span className="font-medium">Analytics</span>
            </Link>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Active Orders</h2>
            <Link to="/vendor/orders" className="text-orange-400 text-sm hover:text-orange-300">
              View all →
            </Link>
          </div>
          
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No pending orders right now
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-white">
                      #{order.order_id.substring(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-400">
                      {order.items.length} items • ₹{order.total_amount}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.order_status === 'QUEUED' 
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {order.order_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
