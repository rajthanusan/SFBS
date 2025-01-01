const EquipmentBooking = require('../models/EquipmentBooking');
const QRCode = require('qrcode');
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig'); 
const sendEquipmentBookingConfirmationEmail = require('../utils/equipmentEmailService'); 

const upload = multer({ storage: multer.memoryStorage() });

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

/**
 * Create a new equipment booking with receipt and QR code, and send confirmation email.
 * @route POST /api/equipment-booking
 * @access Private
 */
exports.createEquipmentBooking = [
  upload.single('receipt'),  
  async (req, res) => {
    const { userName, userEmail, equipmentName, equipmentPrice, quantity, sportName, dateTime, userPhoneNumber } = req.body;

    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'Receipt is required for booking' });
      }

      const bookingDateTime = new Date(dateTime);
      const now = new Date();
      now.setHours(0, 0, 0, 0); 

      if (bookingDateTime < now) {
        return res.status(400).json({ msg: 'Booking date and time cannot be in the past' });
      }

      const totalPrice = equipmentPrice * quantity;

      const receiptResult = await uploadToCloudinary(req.file.buffer, 'equipment_receipts');
      const receiptUrl = receiptResult.secure_url; 
      const equipmentBooking = new EquipmentBooking({
        userId: req.user.id,
        userName,
        userEmail,
        equipmentName,
        equipmentPrice,
        quantity,
        sportName,
        dateTime,
        userPhoneNumber,
        totalPrice,
        receipt: receiptUrl 
      });

      await equipmentBooking.save();

      const qrCodeData = JSON.stringify({
        bookingId: equipmentBooking._id,
        userName: equipmentBooking.userName,
        userEmail: equipmentBooking.userEmail,
        equipmentName: equipmentBooking.equipmentName,
        dateTime: equipmentBooking.dateTime,
        quantity: equipmentBooking.quantity,
        equipmentPrice: equipmentBooking.equipmentPrice,
        totalPrice: equipmentBooking.totalPrice
      });

      const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);  

      const qrCodeResult = await uploadToCloudinary(qrCodeBuffer, 'equipment_qrcodes');
      const qrCodeUrl = qrCodeResult.secure_url; 

      equipmentBooking.qrCode = qrCodeUrl;
      await equipmentBooking.save();

      await sendEquipmentBookingConfirmationEmail(userEmail, {
        bookingId: equipmentBooking._id,
        userName,
        sportName,
        equipmentName,
        equipmentPrice,
        quantity,
        dateTime,
        totalPrice,
        receipt: equipmentBooking.receipt,  
        qrCode: equipmentBooking.qrCode     
      });

      res.status(201).json({
        msg: 'Booking created successfully, and confirmation email sent',
        equipmentBooking,
      });
    } catch (err) {
      console.error('Error creating equipment booking:', err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  }
];





// Get all equipment bookings (admin only)
exports.getAllEquipmentBookings = async (req, res) => {
  try {
    const bookings = await EquipmentBooking.find().populate('userId', '_id');

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/equipment-receipts/`;

    const transformedBookings = bookings.map(booking => ({
      ...booking._doc,
      userId: booking.userId._id.toString(),
      receipt: booking.receipt ? `${baseUrl}${path.basename(booking.receipt)}` : null
    }));

    res.status(200).json(transformedBookings);
  } catch (error) {
    console.error('Error fetching all equipment bookings:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all equipment bookings for a specific user
exports.getUserEquipmentBookings = async (req, res) => {
  const { userId } = req.params;

  try {
    const equipmentBookings = await EquipmentBooking.find({ userId })
      .populate('userId', 'name email role'); 

    if (equipmentBookings.length === 0) {
      return res.status(404).json({ msg: 'No bookings found for this user' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/equipment-receipts/`;

    const bookingsWithUserDetails = equipmentBookings.map(booking => ({
      _id: booking._id,
      userId: booking.userId._id.toString(),
      userName: booking.userId.name,
      role: booking.userId.role,
      userEmail: booking.userId.email,
      userPhoneNumber: booking.userPhoneNumber,
      equipmentName: booking.equipmentName,
      sportName: booking.sportName,
      equipmentPrice: booking.equipmentPrice,
      quantity: booking.quantity,
      totalPrice: booking.totalPrice,
      dateTime: booking.dateTime,
      createdAt: booking.createdAt,
      receipt: booking.receipt ? `${baseUrl}${path.basename(booking.receipt)}` : null,
      __v: booking.__v
    }));

    res.json(bookingsWithUserDetails);
  } catch (error) {
    console.error('Error fetching user equipment bookings:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get a specific equipment booking by ID
exports.getEquipmentBookingById = async (req, res) => {
  try {
    const booking = await EquipmentBooking.findById(req.params.id)
      .populate('userId', 'name email role');

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    if (booking.userId._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: 'Access denied. You are not authorized to view this booking.' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/equipment-receipts/`;

    const bookingWithUserDetails = {
      _id: booking.id,
      userId: booking.userId.id.toString(),
      userName: booking.userId.name,
      role: booking.userId.role,
      userEmail: booking.userId.email,
      userPhoneNumber: booking.userPhoneNumber,
      equipmentName: booking.equipmentName,
      sportName: booking.sportName,
      equipmentPrice: booking.equipmentPrice,
      quantity: booking.quantity,
      totalPrice: booking.totalPrice,
      dateTime: booking.dateTime,
      createdAt: booking.createdAt,
      receipt: booking.receipt ? `${baseUrl}${path.basename(booking.receipt)}` : null,
      __v: booking.__v
    };

    res.json(bookingWithUserDetails);
  } catch (error) {
    console.error('Error fetching equipment booking by ID:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


/**
 * Serve the QR code as a downloadable PNG file.
 * @route GET /api/equipment-booking/:id/download-qr
 * @access Private
 */
exports.downloadEquipmentQrCode = async (req, res) => {
  try {
    // Find the booking by ID
    const booking = await EquipmentBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Check if the QR code file exists
    if (!booking.qrCode || !fs.existsSync(booking.qrCode)) {
      return res.status(404).json({ msg: 'QR code not found' });
    }

    // Serve the QR code file for download
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
