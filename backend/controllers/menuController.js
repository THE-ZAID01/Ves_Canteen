const Menu = require('../models/Menu');

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const { category, available } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category.toUpperCase();
    }
    
    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }
    
    const menuItems = await Menu.find(query).sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a new menu item
// @route   POST /api/menu
// @access  Private (Vendor only)
const addMenuItem = async (req, res) => {
  try {
    const { name, price, category, description, image } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    
    const menuItem = await Menu.create({
      name,
      price,
      category: category ? category.toUpperCase() : 'USUAL',
      description: description || '',
      image: image || '',
      isAvailable: true,
      createdBy: req.user._id
    });
    
    res.status(201).json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private (Vendor only)
const updateMenuItem = async (req, res) => {
  try {
    const { name, price, category, description, image, isAvailable } = req.body;
    
    const menuItem = await Menu.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    menuItem.name = name || menuItem.name;
    menuItem.price = price !== undefined ? price : menuItem.price;
    menuItem.category = category ? category.toUpperCase() : menuItem.category;
    menuItem.description = description !== undefined ? description : menuItem.description;
    menuItem.image = image !== undefined ? image : menuItem.image;
    menuItem.isAvailable = isAvailable !== undefined ? isAvailable : menuItem.isAvailable;
    
    const updatedItem = await menuItem.save();
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private (Vendor only)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    await menuItem.deleteOne();
    res.json({ message: 'Menu item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle item availability
// @route   PATCH /api/menu/:id/availability
// @access  Private (Vendor only)
const toggleAvailability = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    menuItem.isAvailable = !menuItem.isAvailable;
    const updatedItem = await menuItem.save();
    
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItem,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
};
