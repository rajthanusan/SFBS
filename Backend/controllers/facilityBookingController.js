const cloudinary = require('../config/cloudinaryConfig'); 
const multer = require('multer');
const QRCode = require('qrcode');
const FacilityBooking = require('../models/FacilityBooking');
const sendFacilityBookingConfirmationEmail = require('../utils/facilityEmailService'); 

const upload = multer({ storage: multer.memoryStorage() });

const ALL_SLOTS = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
  "16:00 - 17:00", "17:00 - 18:00", 
];

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: folder }, (error, result) => {
      if (error) {
        return reject(error);  
      }
      resolve(result);  
    }).end(buffer); 
  });
};

exports.createFacilityBooking = [
  upload.single('receipt'),  
  async (req, res) => {
    const { userName, userEmail, userPhoneNumber, sportName, courtNumber, courtPrice, date, timeSlots } = req.body;

    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'Receipt is required for booking' });
      }

      const receiptResult = await uploadToCloudinary(req.file.buffer, 'facility_receipts');
      const receiptUrl = receiptResult.secure_url; 

      let slotsArray = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;
      if (!Array.isArray(slotsArray)) {
        return res.status(400).json({ msg: 'Invalid timeSlots format. Must be an array.' });
      }

      const invalidSlots = slotsArray.filter(slot => !ALL_SLOTS.includes(slot));
      if (invalidSlots.length > 0) {
        return res.status(400).json({ msg: 'Invalid time slots', invalidSlots });
      }

      const bookingDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (bookingDate < today) {
        return res.status(400).json({ msg: 'Booking date cannot be in the past' });
      }

      const existingBookings = await FacilityBooking.find({
        courtNumber,
        date,
        sportName,
        timeSlots: { $in: slotsArray }
      });

      if (existingBookings.length > 0) {
        const unavailableSlots = existingBookings.flatMap(booking => booking.timeSlots)
                                                .filter(slot => slotsArray.includes(slot));
        return res.status(400).json({ msg: 'Some time slots are already booked', unavailableSlots });
      }

      const totalHours = slotsArray.length;
      const totalPrice = courtPrice * totalHours;

      const facilityBooking = new FacilityBooking({
        userId: req.user.id,
        userName,
        userEmail,
        userPhoneNumber,
        sportName,
        courtNumber,
        courtPrice,
        date,
        timeSlots: slotsArray,
        totalHours,
        totalPrice,
        receipt: receiptUrl  
      });

      await facilityBooking.save();

      const qrCodeData = JSON.stringify({
        bookingId: facilityBooking._id,
        userName: facilityBooking.userName,
        userEmail: facilityBooking.userEmail,
        sportName: facilityBooking.sportName,
        courtNumber: facilityBooking.courtNumber,
        date: facilityBooking.date,
        timeSlots: facilityBooking.timeSlots,
        totalHours: facilityBooking.totalHours,
        courtPrice: facilityBooking.courtPrice,
        totalPrice: facilityBooking.totalPrice
      });

      const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);  

      const qrCodeResult = await uploadToCloudinary(qrCodeBuffer, 'facility_qrcodes');  
      facilityBooking.qrCode = qrCodeResult.secure_url;  

      await facilityBooking.save();

      await sendFacilityBookingConfirmationEmail(userEmail, {
        bookingId: facilityBooking._id,
        userName,
        sportName,
        courtNumber,
        date: facilityBooking.date,
        timeSlots: slotsArray,
        totalHours,
        totalPrice,
        receipt: facilityBooking.receipt,
        qrCode: facilityBooking.qrCode
      });

      res.status(201).json({
        msg: 'Booking created successfully, and confirmation email sent',
        facilityBooking,
      });
    } catch (err) {
      console.error('Error creating facility booking:', err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  }
];






exports.getAvailableTimeSlots = async (req, res) => {
  const { courtNumber, date, sportName } = req.body;

  try {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const bookings = await FacilityBooking.find({
      courtNumber,
      sportName,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const bookedSlots = bookings.flatMap(booking => booking.timeSlots);
    const availableSlots = ALL_SLOTS.filter(slot => !bookedSlots.includes(slot));

    res.json({ availableSlots });
  } catch (err) {
    console.error('Error fetching available time slots:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


/**
 * Get all facility bookings with details and receipt URLs.
 * @route GET /api/facility-booking
 * @access Private (Admin only)
 */
exports.getAllFacilityBookings = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }

    const facilityBookings = await FacilityBooking.find()
      .populate('userId', 'name email role');

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/facility-receipts/`;

    const bookingsWithUserDetails = facilityBookings.map(booking => ({
      _id: booking._id,
      userId: booking.userId._id,
      userName: booking.userId.name,
      role: booking.userId.role,
      userEmail: booking.userId.email,
      userPhoneNumber: booking.userPhoneNumber,
      sportName: booking.sportName,
      courtNumber: booking.courtNumber,
      courtPrice: booking.courtPrice,
      date: booking.date,
      timeSlots: booking.timeSlots,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      receipt: booking.receipt ? `${baseUrl}${path.basename(booking.receipt)}` : null,
      __v: booking.__v
    }));

    res.json(bookingsWithUserDetails);
  } catch (err) {
    console.error('Error fetching all facility bookings:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * Get a specific facility booking by ID with user details and receipt URL.
 * @route GET /api/facility-booking/:id
 * @access Private
 */
exports.getFacilityBookingById = async (req, res) => {
  try {
    const booking = await FacilityBooking.findById(req.params.id)
      .populate('userId', 'name email role');

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/facility-receipts/`;

    const bookingWithUserDetails = {
      _id: booking._id,
      userId: booking.userId._id,
      userName: booking.userId.name,
      role: booking.userId.role,
      userEmail: booking.userId.email,
      userPhoneNumber: booking.userPhoneNumber,
      sportName: booking.sportName,
      courtNumber: booking.courtNumber,
      courtPrice: booking.courtPrice,
      date: booking.date,
      timeSlots: booking.timeSlots,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      receipt: booking.receipt ? `${baseUrl}${path.basename(booking.receipt)}` : null,
      __v: booking.__v
    };

    res.json(bookingWithUserDetails);
  } catch (err) {
    console.error('Error fetching booking by ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/**
 * Get facility bookings by user ID with user details and receipt URL.
 * @route GET /api/facility-booking/user/:userId
 * @access Private
 */
exports.getFacilityBookingsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const facilityBookings = await FacilityBooking.find({ userId })
      .populate('userId', 'name email role');

    if (facilityBookings.length === 0) {
      return res.status(404).json({ msg: 'No bookings found for this user' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/facility-receipts/`;

    const bookingsWithUserDetails = facilityBookings.map(booking => ({
      _id: booking._id,
      userId: booking.userId._id,
      userName: booking.userId.name,
      role: booking.userId.role,
      userEmail: booking.userId.email,
      userPhoneNumber: booking.userPhoneNumber,
      sportName: booking.sportName,
      courtNumber: booking.courtNumber,
      courtPrice: booking.courtPrice,
      date: booking.date,
      timeSlots: booking.timeSlots,
      totalHours: booking.totalHours,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      receipt: booking.receipt ? `${baseUrl}${path.basename(booking.receipt)}` : null,
      __v: booking.__v
    }));

    res.json(bookingsWithUserDetails);
  } catch (err) {
    console.error('Error fetching facility bookings by user ID:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

const fs = require('fs');

/**
 * Serve the QR code as a downloadable PNG file.
 * @route GET /api/facility-booking/:id/download-qr
 * @access Private
 */
exports.downloadQrCode = async (req, res) => {
  try {
    const booking = await FacilityBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    if (!booking.qrCode || !fs.existsSync(booking.qrCode)) {
      return res.status(404).json({ msg: 'QR code not found' });
    }

    res.download(booking.qrCode, `Booking-${booking._id}-QRCode.png`, (err) => {
      if (err) {
        console.error('Error downloading QR code:', err.message);
        return res.status(500).json({ msg: 'Server error' });
      }
    });
  } catch (err) {
    console.error('Error downloading QR code:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


exports.getAvailableFacilities = async (req, res) => {
  const { sportName, date, timeSlot } = req.body;

  try {
    if (!sportName || !date || !timeSlot) {
      return res.status(400).json({ msg: 'Please provide sport name, date, and time slot' });
    }

    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const bookings = await FacilityBooking.find({
      sportName,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlots: timeSlot, 
    });

    const bookedCourts = bookings.map(booking => booking.courtNumber);

    const availableFacilities = await Facility.find({
      sportName,
      courtNumber: { $nin: bookedCourts }  
    });

    if (availableFacilities.length === 0) {
      return res.status(404).json({ msg: 'No available facilities for the selected time slot' });
    }

    res.json({ availableFacilities });
  } catch (err) {
    console.error('Error fetching available facilities:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
