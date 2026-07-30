const Category = require('../models/Category');

// GET /api/categories?type=expense|income
const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {
      $or: [{ userId: null }, { userId: req.user._id }],
    };
    if (type) filter.type = type;

    const categories = await Category.find(filter).sort({ isBuiltIn: -1, name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, type, icon, extraFields } = req.body;
    const category = await Category.create({
      userId: req.user._id,
      name,
      type,
      icon,
      extraFields: extraFields || [],
      isBuiltIn: false,
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (category.isBuiltIn) {
      return res.status(403).json({ message: 'Cannot edit a built-in category' });
    }

    const { name, icon, extraFields } = req.body;
    if (name) category.name = name;
    if (icon !== undefined) category.icon = icon;
    if (extraFields) category.extraFields = extraFields;

    await category.save();
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (category.isBuiltIn) {
      return res.status(403).json({ message: 'Cannot delete a built-in category' });
    }

    await category.deleteOne();
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };