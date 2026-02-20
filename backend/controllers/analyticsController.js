const Order = require('../models/Order');

// @desc    Get analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private (Vendor only)
const getDashboardAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default to today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateFilter = {
        timestamp: { $gte: today, $lt: tomorrow }
      };
    }
    
    // Total orders
    const totalOrders = await Order.countDocuments({
      ...dateFilter,
      payment_status: 'PAID'
    });
    
    // Online orders
    const onlineOrders = await Order.countDocuments({
      ...dateFilter,
      payment_mode: 'ONLINE',
      payment_status: 'PAID'
    });
    
    // Offline orders
    const offlineOrders = await Order.countDocuments({
      ...dateFilter,
      payment_mode: 'OFFLINE',
      payment_status: 'PAID'
    });
    
    // Revenue calculations
    const revenueData = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          payment_status: 'PAID'
        }
      },
      {
        $group: {
          _id: '$payment_mode',
          total: { $sum: '$total_amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    let onlineRevenue = 0;
    let offlineRevenue = 0;
    
    revenueData.forEach(item => {
      if (item._id === 'ONLINE') {
        onlineRevenue = item.total;
      } else if (item._id === 'OFFLINE') {
        offlineRevenue = item.total;
      }
    });
    
    const totalRevenue = onlineRevenue + offlineRevenue;
    
    // Pending orders count
    const pendingOrders = await Order.countDocuments({
      ...dateFilter,
      order_status: { $in: ['QUEUED', 'PREPARING'] }
    });
    
    // Ready orders count
    const readyOrders = await Order.countDocuments({
      ...dateFilter,
      order_status: 'READY'
    });
    
    res.json({
      totalOrders,
      onlineOrders,
      offlineOrders,
      totalRevenue,
      onlineRevenue,
      offlineRevenue,
      pendingOrders,
      readyOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get hourly orders data for chart
// @route   GET /api/analytics/hourly
// @access  Private (Vendor only)
const getHourlyOrders = async (req, res) => {
  try {
    const { date } = req.query;
    
    let targetDate;
    if (date) {
      targetDate = new Date(date);
    } else {
      targetDate = new Date();
    }
    
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const hourlyData = await Order.aggregate([
      {
        $match: {
          timestamp: { $gte: targetDate, $lt: nextDay },
          payment_status: 'PAID'
        }
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total_amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Create full 24-hour array
    const fullHourlyData = [];
    for (let i = 0; i < 24; i++) {
      const hourData = hourlyData.find(h => h._id === i);
      fullHourlyData.push({
        hour: i,
        orders: hourData ? hourData.orders : 0,
        revenue: hourData ? hourData.revenue : 0
      });
    }
    
    res.json(fullHourlyData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get revenue split for pie chart
// @route   GET /api/analytics/revenue-split
// @access  Private (Vendor only)
const getRevenueSplit = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateFilter = {
        timestamp: { $gte: today, $lt: tomorrow }
      };
    }
    
    const revenueSplit = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          payment_status: 'PAID'
        }
      },
      {
        $group: {
          _id: '$payment_mode',
          total: { $sum: '$total_amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {
      online: { revenue: 0, count: 0 },
      offline: { revenue: 0, count: 0 }
    };
    
    revenueSplit.forEach(item => {
      if (item._id === 'ONLINE') {
        result.online = { revenue: item.total, count: item.count };
      } else if (item._id === 'OFFLINE') {
        result.offline = { revenue: item.total, count: item.count };
      }
    });
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get top selling items
// @route   GET /api/analytics/top-items
// @access  Private (Vendor only)
const getTopSellingItems = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    const topItems = await Order.aggregate([
      {
        $match: {
          ...dateFilter,
          payment_status: 'PAID'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json(topItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get daily summary for a date range
// @route   GET /api/analytics/daily-summary
// @access  Private (Vendor only)
const getDailySummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      // Default to last 7 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      
      const dailySummary = await Order.aggregate([
        {
          $match: {
            timestamp: { $gte: start, $lte: end },
            payment_status: 'PAID'
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            orders: { $sum: 1 },
            revenue: { $sum: '$total_amount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      return res.json(dailySummary);
    }
    
    const dailySummary = await Order.aggregate([
      {
        $match: {
          timestamp: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          payment_status: 'PAID'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total_amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(dailySummary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardAnalytics,
  getHourlyOrders,
  getRevenueSplit,
  getTopSellingItems,
  getDailySummary
};
