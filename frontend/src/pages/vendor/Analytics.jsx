import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { analyticsAPI } from '../../services/api';
import { FiTrendingUp, FiDollarSign, FiShoppingBag, FiCalendar } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [revenueSplit, setRevenueSplit] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [dashboardRes, hourlyRes, splitRes, topItemsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getHourly(),
        analyticsAPI.getRevenueSplit(),
        analyticsAPI.getTopItems({ limit: 5 })
      ]);

      setStats(dashboardRes.data);
      setHourlyData(hourlyRes.data);
      setRevenueSplit(splitRes.data);
      setTopItems(topItemsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pie Chart Data
  const pieChartData = {
    labels: ['Online', 'Offline'],
    datasets: [
      {
        data: [
          revenueSplit?.online?.revenue || 0,
          revenueSplit?.offline?.revenue || 0
        ],
        backgroundColor: ['#3b82f6', '#f97316'],
        borderColor: ['#2563eb', '#ea580c'],
        borderWidth: 2
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9ca3af',
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `₹${context.parsed}`
        }
      }
    }
  };

  // Bar Chart Data
  const barChartData = {
    labels: hourlyData.map(h => `${h.hour}:00`),
    datasets: [
      {
        label: 'Orders',
        data: hourlyData.map(h => h.orders),
        backgroundColor: '#f97316',
        borderRadius: 4
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Orders by Hour',
        color: '#fff',
        font: {
          size: 16
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9ca3af',
          stepSize: 1
        }
      }
    }
  };

  const StatCard = ({ icon: Icon, label, value, subValue, color }) => (
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
        <h1 className="text-3xl font-bold text-white mb-6">Analytics</h1>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Business insights and performance</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              dateRange === 'today'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              dateRange === 'week'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={FiShoppingBag}
          label="Total Orders"
          value={stats?.totalOrders || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Online Orders"
          value={stats?.onlineOrders || 0}
          subValue={`₹${stats?.onlineRevenue || 0} revenue`}
          color="bg-green-500"
        />
        <StatCard
          icon={FiCalendar}
          label="Offline Orders"
          value={stats?.offlineOrders || 0}
          subValue={`₹${stats?.offlineRevenue || 0} revenue`}
          color="bg-orange-500"
        />
        <StatCard
          icon={FiDollarSign}
          label="Total Revenue"
          value={`₹${stats?.totalRevenue || 0}`}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Split Pie Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Split</h3>
          <div className="h-64 flex items-center justify-center">
            {(revenueSplit?.online?.revenue || revenueSplit?.offline?.revenue) ? (
              <Pie data={pieChartData} options={pieChartOptions} />
            ) : (
              <p className="text-gray-400">No revenue data</p>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-blue-500/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">
                ₹{revenueSplit?.online?.revenue || 0}
              </p>
              <p className="text-sm text-gray-400">Online</p>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-400">
                ₹{revenueSplit?.offline?.revenue || 0}
              </p>
              <p className="text-sm text-gray-400">Offline</p>
            </div>
          </div>
        </div>

        {/* Hourly Orders Bar Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Orders by Hour</h3>
          <div className="h-80">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Top Selling Items</h3>
        {topItems.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No sales data yet</p>
        ) : (
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-700 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-white">{item._id}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-400">₹{item.totalRevenue}</p>
                  <p className="text-sm text-gray-400">{item.totalQuantity} sold</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
