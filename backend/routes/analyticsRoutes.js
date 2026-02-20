const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getHourlyOrders,
  getRevenueSplit,
  getTopSellingItems,
  getDailySummary
} = require('../controllers/analyticsController');
const { protect, vendorOnly } = require('../middleware/authMiddleware');

// All analytics routes are vendor only
router.get('/dashboard', protect, vendorOnly, getDashboardAnalytics);
router.get('/hourly', protect, vendorOnly, getHourlyOrders);
router.get('/revenue-split', protect, vendorOnly, getRevenueSplit);
router.get('/top-items', protect, vendorOnly, getTopSellingItems);
router.get('/daily-summary', protect, vendorOnly, getDailySummary);

module.exports = router;
