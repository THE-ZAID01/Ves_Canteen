const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  getKanbanOrders,
  confirmPayment,
  verifyPayment,
  scanForPayment,
  markPaid,
  updateOrderStatus,
  scanForServe,
  getQueueStatus
} = require('../controllers/orderController');
const { protect, vendorOnly, studentOnly } = require('../middleware/authMiddleware');

// Student routes
router.post('/', protect, studentOnly, createOrder);
router.get('/my-orders', protect, studentOnly, getMyOrders);
router.post('/:id/confirm-payment', protect, studentOnly, confirmPayment);

// Vendor routes
router.get('/kanban', protect, vendorOnly, getKanbanOrders);
router.get('/all', protect, vendorOnly, getAllOrders);
router.post('/:id/verify-payment', protect, vendorOnly, verifyPayment);
router.post('/scan-payment/:qr_token', protect, vendorOnly, scanForPayment);
router.post('/:id/mark-paid', protect, vendorOnly, markPaid);
router.patch('/:id/status', protect, vendorOnly, updateOrderStatus);
router.post('/scan-serve/:qr_token', protect, vendorOnly, scanForServe);

// Shared routes
router.get('/:id', protect, getOrderById);
router.get('/:id/queue-status', protect, getQueueStatus);

module.exports = router;
