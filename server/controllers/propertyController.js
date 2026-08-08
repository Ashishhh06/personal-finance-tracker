const Property = require('../models/Property');

const getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.user._id }).sort({ purchaseDate: -1 });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch properties', error: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    const { propertyType, name, purchasePrice, currentEstimatedValue, purchaseDate } = req.body;

    if (!propertyType || !name || !purchasePrice || !currentEstimatedValue || !purchaseDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const property = await Property.create({
      userId: req.user._id,
      propertyType,
      name,
      purchasePrice,
      currentEstimatedValue,
      purchaseDate,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create property', error: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, userId: req.user._id });
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const updatableFields = ['propertyType', 'name', 'purchasePrice', 'currentEstimatedValue', 'purchaseDate'];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    await property.save();
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update property', error: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, userId: req.user._id });
    if (!property) return res.status(404).json({ message: 'Property not found' });

    await property.deleteOne();
    res.status(200).json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete property', error: error.message });
  }
};

module.exports = { getProperties, createProperty, updateProperty, deleteProperty };