const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Vendor only middleware
const vendorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'VENDOR') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Vendor only.' });
  }
};

// Student only middleware
const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'STUDENT') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Student only.' });
  }
};

module.exports = { protect, vendorOnly, studentOnly };
