const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
} = require('../controllers/menuController');
const { protect, vendorOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);

// Protected routes (Vendor only)
router.post('/', protect, vendorOnly, addMenuItem);
router.put('/:id', protect, vendorOnly, updateMenuItem);
router.delete('/:id', protect, vendorOnly, deleteMenuItem);
router.patch('/:id/availability', protect, vendorOnly, toggleAvailability);

module.exports = router;
