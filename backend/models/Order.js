const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
    required: true
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    default: 1,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    default: () => uuidv4(),
    unique: true
  },
  student_email: {
    type: String,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_mode: {
    type: String,
    enum: ['ONLINE', 'OFFLINE'],
    required: true
  },
  payment_status: {
    type: String,
    enum: ['PENDING', 'WAITING_FOR_PAYMENT', 'PAID'],
    default: 'PENDING'
  },
  order_status: {
    type: String,
    enum: ['CREATED', 'AWAITING_PAYMENT', 'QUEUED', 'PREPARING', 'READY', 'SERVED'],
    default: 'CREATED'
  },
  counter: {
    type: String,
    enum: ['A', 'B'],
    required: true
  },
  qr_token: {
    type: String,
    default: function() {
      return this.order_id;
    }
  },
  queue_position: {
    type: Number,
    default: 0
  },
  estimated_time: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  paid_at: Date,
  prepared_at: Date,
  ready_at: Date,
  served_at: Date
});

// Valid state transitions
const validTransitions = {
  ONLINE: {
    CREATED: ['QUEUED'],
    PENDING: ['PAID'],
    PAID: ['QUEUED'],
    QUEUED: ['PREPARING'],
    PREPARING: ['READY'],
    READY: ['SERVED']
  },
  OFFLINE: {
    CREATED: ['AWAITING_PAYMENT'],
    AWAITING_PAYMENT: ['QUEUED'],
    WAITING_FOR_PAYMENT: ['PAID'],
    PAID: ['QUEUED'],
    QUEUED: ['PREPARING'],
    PREPARING: ['READY'],
    READY: ['SERVED']
  }
};

// Method to check if transition is valid
orderSchema.methods.canTransitionTo = function(newStatus, statusType = 'order') {
  const mode = this.payment_mode;
  const currentStatus = statusType === 'order' ? this.order_status : this.payment_status;
  
  if (statusType === 'payment') {
    // Payment status transitions
    if (currentStatus === 'PENDING' && newStatus === 'PAID') return true;
    if (currentStatus === 'WAITING_FOR_PAYMENT' && newStatus === 'PAID') return true;
    return false;
  }
  
  // Order status transitions
  const transitions = validTransitions[mode];
  if (!transitions || !transitions[currentStatus]) return false;
  return transitions[currentStatus].includes(newStatus);
};

// Calculate queue position
orderSchema.methods.calculateQueuePosition = async function() {
  const Order = mongoose.model('Order');
  const count = await Order.countDocuments({
    payment_status: 'PAID',
    order_status: { $nin: ['SERVED'] },
    timestamp: { $lt: this.timestamp },
    _id: { $ne: this._id }
  });
  return count + 1;
};

// Pre-save hook to set qr_token
orderSchema.pre('save', function(next) {
  if (!this.qr_token) {
    this.qr_token = this.order_id;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
