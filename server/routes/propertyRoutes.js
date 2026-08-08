const express = require('express');
const router = express.Router();
const { getProperties, createProperty, updateProperty, deleteProperty } = require('../controllers/propertyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getProperties);
router.post('/', protect, createProperty);
router.put('/:id', protect, updateProperty);
router.delete('/:id', protect, deleteProperty);

module.exports = router;