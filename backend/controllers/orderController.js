const Order = require('../models/Order');
const Menu = require('../models/Menu');
const { v4: uuidv4 } = require('uuid');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (Student only)
const createOrder = async (req, res) => {
  try {
    const { items, payment_mode } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    
    if (!['ONLINE', 'OFFLINE'].includes(payment_mode)) {
      return res.status(400).json({ message: 'Invalid payment mode' });
    }
    
    // Calculate total and validate items
    let total_amount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item ${item.menuItem} not found` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is currently unavailable` });
      }
      
      const quantity = item.quantity || 1;
      total_amount += menuItem.price * quantity;
      
      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity
      });
    }
    
    // Set initial status based on payment mode
    let payment_status, order_status, counter;
    
    if (payment_mode === 'ONLINE') {
      payment_status = 'PENDING';
      order_status = 'CREATED';
      counter = 'B';
    } else {
      payment_status = 'WAITING_FOR_PAYMENT';
      order_status = 'AWAITING_PAYMENT';
      counter = 'A';
    }
    
    const order_id = uuidv4();
    
    const order = await Order.create({
      order_id,
      student_email: req.user.email,
      student: req.user._id,
      items: orderItems,
      total_amount,
      payment_mode,
      payment_status,
      order_status,
      counter,
      qr_token: order_id
    });
    
    // Generate UPI link for online payment
    let upi_link = null;
    if (payment_mode === 'ONLINE') {
      upi_link = `upi://pay?pa=${process.env.VENDOR_UPI_ID}&pn=VESCanteen&am=${total_amount}&cu=INR&tn=Order${order_id.substring(0, 8)}`;
    }
    
    res.status(201).json({
      ...order.toObject(),
      upi_link
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get student's orders
// @route   GET /api/orders/my-orders
// @access  Private (Student only)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.user._id })
      .sort({ timestamp: -1 })
      .populate('items.menuItem', 'name price');
    
    // Calculate queue position for each active order
    const ordersWithQueue = await Promise.all(orders.map(async (order) => {
      const orderObj = order.toObject();
      if (order.payment_status === 'PAID' && order.order_status !== 'SERVED') {
        orderObj.queue_position = await order.calculateQueuePosition();
        orderObj.estimated_time = orderObj.queue_position * 3; // 3 minutes per order
      }
      return orderObj;
    }));
    
    res.json(ordersWithQueue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ order_id: req.params.id })
      .populate('items.menuItem', 'name price')
      .populate('student', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Students can only view their own orders
    if (req.user.role === 'STUDENT' && order.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    const orderObj = order.toObject();
    if (order.payment_status === 'PAID' && order.order_status !== 'SERVED') {
      orderObj.queue_position = await order.calculateQueuePosition();
      orderObj.estimated_time = orderObj.queue_position * 3;
    }
    
    res.json(orderObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders (Vendor)
// @route   GET /api/orders
// @access  Private (Vendor only)
const getAllOrders = async (req, res) => {
  try {
    const { status, payment_status, date } = req.query;
    
    let query = {};
    
    if (status) {
      query.order_status = status.toUpperCase();
    }
    
    if (payment_status) {
      query.payment_status = payment_status.toUpperCase();
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.timestamp = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const orders = await Order.find(query)
      .sort({ timestamp: -1 })
      .populate('student', 'name email phone');
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get orders by status for Kanban view
// @route   GET /api/orders/kanban
// @access  Private (Vendor only)
const getKanbanOrders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const statuses = ['AWAITING_PAYMENT', 'QUEUED', 'PREPARING', 'READY', 'SERVED'];
    const kanban = {};
    
    for (const status of statuses) {
      kanban[status] = await Order.find({
        order_status: status,
        timestamp: { $gte: today }
      })
        .sort({ timestamp: 1 })
        .populate('student', 'name email phone');
    }
    
    res.json(kanban);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Student confirms payment (Online)
// @route   POST /api/orders/:id/confirm-payment
// @access  Private (Student only)
const confirmPayment = async (req, res) => {
  try {
    const order = await Order.findOne({ order_id: req.params.id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (order.payment_mode !== 'ONLINE') {
      return res.status(400).json({ message: 'This is not an online payment order' });
    }
    
    if (order.payment_status !== 'PENDING') {
      return res.status(400).json({ message: 'Payment already processed' });
    }
    
    // Mark as pending vendor confirmation
    order.payment_status = 'PENDING';
    order.order_status = 'CREATED';
    await order.save();
    
    res.json({ message: 'Payment confirmation sent. Waiting for vendor verification.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Vendor verifies payment (Online)
// @route   POST /api/orders/:id/verify-payment
// @access  Private (Vendor only)
const verifyPayment = async (req, res) => {
  try {
    const order = await Order.findOne({ order_id: req.params.id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.payment_mode === 'ONLINE' && order.payment_status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid order state for payment verification' });
    }
    
    order.payment_status = 'PAID';
    order.order_status = 'QUEUED';
    order.paid_at = new Date();
    await order.save();
    
    res.json({ message: 'Payment verified. Order is now in queue.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Scan QR for payment (Offline) - Vendor
// @route   POST /api/orders/scan-payment/:qr_token
// @access  Private (Vendor only)
const scanForPayment = async (req, res) => {
  try {
    const order = await Order.findOne({ qr_token: req.params.qr_token });
    
    if (!order) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }
    
    if (order.order_status !== 'AWAITING_PAYMENT') {
      return res.status(400).json({ 
        message: `Cannot process payment. Order status is ${order.order_status}`,
        order 
      });
    }
    
    res.json({ 
      message: 'Order found. Ready for payment confirmation.',
      order 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark offline payment as paid
// @route   POST /api/orders/:id/mark-paid
// @access  Private (Vendor only)
const markPaid = async (req, res) => {
  try {
    const order = await Order.findOne({ order_id: req.params.id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.payment_status === 'PAID') {
      return res.status(400).json({ message: 'Order already paid' });
    }
    
    if (order.order_status !== 'AWAITING_PAYMENT' && order.payment_status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid order state for payment' });
    }
    
    order.payment_status = 'PAID';
    order.order_status = 'QUEUED';
    order.paid_at = new Date();
    await order.save();
    
    res.json({ message: 'Payment confirmed. Order added to queue.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order status (Vendor)
// @route   PATCH /api/orders/:id/status
// @access  Private (Vendor only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['QUEUED', 'PREPARING', 'READY', 'SERVED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findOne({ order_id: req.params.id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Validate state transition
    if (!order.canTransitionTo(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${order.order_status} to ${status}` 
      });
    }
    
    order.order_status = status;
    
    // Set timestamps
    if (status === 'PREPARING') {
      order.prepared_at = new Date();
    } else if (status === 'READY') {
      order.ready_at = new Date();
    } else if (status === 'SERVED') {
      order.served_at = new Date();
    }
    
    await order.save();
    
    res.json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Scan QR after serving
// @route   POST /api/orders/scan-serve/:qr_token
// @access  Private (Vendor only)
const scanForServe = async (req, res) => {
  try {
    const order = await Order.findOne({ qr_token: req.params.qr_token })
      .populate('student', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }
    
    if (order.order_status === 'SERVED') {
      return res.status(400).json({ message: 'Order already served. QR code is invalid.' });
    }
    
    if (order.order_status !== 'READY') {
      return res.status(400).json({ 
        message: `Order is not ready for pickup. Current status: ${order.order_status}`,
        order 
      });
    }
    
    if (order.payment_status !== 'PAID') {
      return res.status(400).json({ 
        message: 'Payment not completed for this order',
        order 
      });
    }
    
    // Mark as served
    order.order_status = 'SERVED';
    order.served_at = new Date();
    await order.save();
    
    res.json({ 
      message: 'Order served successfully!',
      order 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get queue status for student
// @route   GET /api/orders/:id/queue-status
// @access  Private
const getQueueStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ order_id: req.params.id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.payment_status !== 'PAID') {
      return res.json({
        queue_position: null,
        estimated_time: null,
        message: 'Order not in queue yet. Payment pending.'
      });
    }
    
    if (order.order_status === 'SERVED') {
      return res.json({
        queue_position: 0,
        estimated_time: 0,
        message: 'Order has been served.'
      });
    }
    
    const queue_position = await order.calculateQueuePosition();
    const estimated_time = queue_position * 3;
    
    res.json({
      queue_position,
      estimated_time,
      order_status: order.order_status,
      counter: order.counter
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
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
};
