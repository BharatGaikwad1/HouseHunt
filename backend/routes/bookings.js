import express from 'express';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Verify property is approved
    if (property.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot book a property that is not approved' });
    }

    // Check if user is trying to book their own property
    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book your own property' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ message: 'Invalid booking date range. End date must be after start date.' });
    }

    // Calculate total price server-side
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const dailyRate = property.price / 30;
    const computedPrice = Math.round(diffDays * dailyRate);

    // Check for date overlaps with existing confirmed bookings
    const overlappingBooking = await Booking.findOne({
      property: propertyId,
      status: 'confirmed',
      $or: [
        {
          startDate: { $lt: end },
          endDate: { $gt: start }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: 'This property is already booked for the selected dates. Please choose different dates.'
      });
    }

    // Create booking
    const booking = await Booking.create({
      property: propertyId,
      user: req.user._id,
      startDate,
      endDate,
      totalPrice: computedPrice,
      status: 'confirmed', // Automatically confirm booking upon payment/request
    });

    // Populate property before sending back
    const populatedBooking = await Booking.findById(booking._id).populate('property');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged-in user's bookings (Customer view)
// @route   GET /api/bookings/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'property',
        populate: {
          path: 'owner',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get bookings for properties owned by the logged-in user (Landlord view)
// @route   GET /api/bookings/landlord
// @access  Private
router.get('/landlord', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    // 1. Find all properties owned by this user
    const properties = await Property.find({ owner: req.user._id });
    const propertyIds = properties.map((p) => p._id);

    // 2. Find all bookings for these properties
    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('property')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Cancel/Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id).populate('property');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isCustomer = booking.user.toString() === req.user._id.toString();
    const isOwner = booking.property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Verify authorized user
    if (!isCustomer && !isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to change booking status' });
    }

    // Customer and Owner can only cancel bookings, Admin can set status freely
    if (!isAdmin && status !== 'cancelled') {
      return res.status(400).json({ message: 'Users can only cancel bookings' });
    }

    booking.status = status;
    await booking.save();

    // Populate property and user references for returned object
    const updatedBooking = await Booking.findById(booking._id)
      .populate('property')
      .populate('user', 'name email');

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
