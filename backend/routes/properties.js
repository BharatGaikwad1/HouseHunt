import express from 'express';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

const escapeRegex = (text) => {
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// @desc    Get all properties (with search, filtering, and role-based visibility)
// @route   GET /api/properties
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { location, type, minPrice, maxPrice, owner, status, sort, amenities } = req.query;
    const query = {};

    // Filtering by location (case-insensitive substring match, regex escaped)
    if (location) {
      query.location = { $regex: escapeRegex(location), $options: 'i' };
    }

    // Filtering by type
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filtering by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filtering by owner
    if (owner) {
      query.owner = owner;
    }

    // Filtering by amenities
    if (amenities) {
      const amenitiesList = amenities.split(',').map((a) => a.trim()).filter(Boolean);
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    // Handling approval status visibility
    // Admin can specify a status or search all.
    // If not specified, default behavior:
    // - If querying "my listings" (owner matches), show all their properties.
    // - Otherwise, show only approved properties to the general public.
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status && !owner) {
      // General public search returns only approved listings
      query.status = 'approved';
    }

    // Sorting query
    let sortQuery = { createdAt: -1 };
    if (sort === 'priceAsc') {
      sortQuery = { price: 1 };
    } else if (sort === 'priceDesc') {
      sortQuery = { price: -1 };
    }

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const properties = await Property.find(query)
      .populate('owner', 'name email')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single property details
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a property listing
// @route   POST /api/properties
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, location, price, type, amenities, image } = req.body;

    const property = await Property.create({
      title,
      description,
      location,
      price,
      type,
      amenities: amenities || [],
      image,
      owner: req.user._id,
      status: 'pending', // Requires admin approval
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a property listing
// @route   PUT /api/properties/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership or admin status
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    // Update fields
    property.title = req.body.title || property.title;
    property.description = req.body.description || property.description;
    property.location = req.body.location || property.location;
    property.price = req.body.price !== undefined ? req.body.price : property.price;
    property.type = req.body.type || property.type;
    property.amenities = req.body.amenities || property.amenities;
    property.image = req.body.image || property.image;

    // Reset status to pending if updated by owner (not admin) to ensure re-approval
    if (req.user.role !== 'admin') {
      property.status = 'pending';
    } else if (req.body.status) {
      property.status = req.body.status;
    }

    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a property listing
// @route   DELETE /api/properties/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership or admin status
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await property.deleteOne();
    res.json({ message: 'Property listing removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve or reject a property listing
// @route   PATCH /api/properties/:id/approve
// @access  Private/Admin
router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.status = status;
    const updatedProperty = await property.save();

    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all bookings for a property (to display unavailable dates)
// @route   GET /api/properties/:id/bookings
// @access  Public
router.get('/:id/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({
      property: req.params.id,
      status: 'confirmed',
    }).select('startDate endDate');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
