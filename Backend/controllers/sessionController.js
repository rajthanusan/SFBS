const SessionRequest = require('../models/SessionRequest');
const Coach = require('../models/CoachProfile');
const SessionBooking = require('../models/SessionBooking');

exports.createSessionRequest = async (req, res) => {
  try {
    const { userName, userEmail, userPhone, sportName, sessionType, coachProfileId, requestedTimeSlots } = req.body;

    // Validate if the requested time slots are available
    const coachProfile = await Coach.findById(coachProfileId);
    if (!coachProfile) {
      return res.status(404).json({ msg: 'Coach profile not found' });
    }

    const validTimeSlots = requestedTimeSlots.every(slot =>
      coachProfile.availableTimeSlots.some(coachSlot =>
        new Date(coachSlot.date).toDateString() === new Date(slot.date).toDateString() && coachSlot.timeSlot === slot.timeSlot
      )
    );

    if (!validTimeSlots) {
      return res.status(400).json({ msg: 'Requested time slots are not available.' });
    }

    const newSessionRequest = new SessionRequest({
      userId: req.user.id,  
      userName,
      userEmail,
      userPhone,
      sportName,
      sessionType,
      coachProfileId,
      coachId: coachProfile.userId,  
      requestedTimeSlots
    });

    await newSessionRequest.save();
    res.json(newSessionRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.respondToSessionRequest = async (req, res) => {
  try {
    const { status, courtNo } = req.body; 
    const sessionRequest = await SessionRequest.findById(req.params.id);

    if (!sessionRequest) {
      return res.status(404).json({ msg: 'Session request not found' });
    }

    sessionRequest.status = status;
    sessionRequest.updatedAt = Date.now();

    if (status === 'Accepted' && courtNo) {
      sessionRequest.courtNo = courtNo;
    }

    await sessionRequest.save();
    res.json(sessionRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


const Review = require('../models/Review'); 

exports.getUserSessionRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ msg: 'Access denied. You can only view your own session requests.' });
    }

    const sessionRequests = await SessionRequest.find({ userId: userId })
      .populate('coachProfileId', 'coachName coachLevel coachingSport coachPrice image')
      .populate('userId', 'name email');

    const response = await Promise.all(sessionRequests.map(async request => {
      if (!request.coachProfileId) {
        return {
          _id: request._id,
          userId: request.userId._id.toString(),
          userName: request.userName,
          userEmail: request.userEmail,
          userPhone: request.userPhone,
          sportName: request.sportName,
          sessionType: request.sessionType,
          coachProfileId: null,
          coachId: null,
          coachName: 'Coach data not available',
          coachLevel: 'N/A',
          coachingSport: 'N/A',
          sessionPrice: 'N/A',
          coachImage: null,
          avgRating: 'No reviews yet',
          requestedTimeSlots: request.requestedTimeSlots,
          status: request.status,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        };
      }

      const { individualSessionPrice, groupSessionPrice } = request.coachProfileId.coachPrice || {};
      const sessionPrice = request.sessionType === 'Individual Session' ? individualSessionPrice : groupSessionPrice;

      const reviews = await Review.find({ coachProfileId: request.coachProfileId._id });
      const avgRating = reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : null;

      return {
        _id: request._id,
        userId: request.userId._id.toString(),
        userName: request.userName,
        userEmail: request.userEmail,
        userPhone: request.userPhone,
        sportName: request.sportName,
        sessionType: request.sessionType,
        coachProfileId: request.coachProfileId._id.toString(),
        coachId: request.coachId.toString(),
        coachName: request.coachProfileId.coachName,
        coachLevel: request.coachProfileId.coachLevel,
        coachingSport: request.coachProfileId.coachingSport,
        sessionPrice: sessionPrice || 'N/A',  
        coachImage: request.coachProfileId.image,
        avgRating: avgRating ? avgRating.toFixed(2) : 'No reviews yet',
        requestedTimeSlots: request.requestedTimeSlots,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      };
    }));

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



exports.getCoachSessionRequests = async (req, res) => {
  try {
    if (req.user.role !== 'Coach') {
      return res.status(403).json({ msg: 'Access denied.' });
    }

    const sessionRequests = await SessionRequest.find({ coachId: req.user.id });
    res.json(sessionRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.getSessionRequestById = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const sessionRequest = await SessionRequest.findById(sessionId)
      .populate('coachProfileId', 'coachName coachLevel')  
      .populate('userId', 'name email');  

    if (!sessionRequest) {
      return res.status(404).json({ msg: 'Session request not found' });
    }

    const requestUserId = sessionRequest.userId._id.toString();
    const tokenUserId = req.user.id;
    const requestCoachId = sessionRequest.coachId?.toString();  

    if (tokenUserId !== requestUserId && tokenUserId !== requestCoachId) {
      return res.status(403).json({ msg: 'Access denied. You can only view your own session requests.' });
    }

    const response = {
      _id: sessionRequest._id,
      userId: sessionRequest.userId._id.toString(),
      userName: sessionRequest.userName,
      userEmail: sessionRequest.userEmail,
      userPhone: sessionRequest.userPhone,
      sportName: sessionRequest.sportName,
      sessionType: sessionRequest.sessionType,
      coachProfileId: sessionRequest.coachProfileId._id.toString(),
      coachId: sessionRequest.coachId.toString(),
      coachName: sessionRequest.coachProfileId.coachName,
      coachLevel: sessionRequest.coachProfileId.coachLevel,
      requestedTimeSlots: sessionRequest.requestedTimeSlots,
      status: sessionRequest.status,
      createdAt: sessionRequest.createdAt,
      updatedAt: sessionRequest.updatedAt,
    };

    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


const fs = require('fs');

const QRCode = require('qrcode');
const cloudinary = require('../config/cloudinaryConfig'); 
const multerCloudinary = require('multer'); 
const sendSessionBookingConfirmationEmail = require('../utils/sendSessionBookingConfirmationEmail');


const uploadReceipt = multerCloudinary({ storage: multerCloudinary.memoryStorage() });

const uploadQRCode = multerCloudinary({ storage: multerCloudinary.memoryStorage() });

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

// Book a Session
exports.bookSession = async (req, res) => {
  try {
    const { sessionRequestId } = req.body;

    const sessionRequest = await SessionRequest.findById(sessionRequestId)
      .populate('coachProfileId', 'coachName coachLevel coachingSport coachPrice')  
      .populate('coachId', 'email');

    if (!sessionRequest) {
      return res.status(404).json({ msg: 'Session request not found' });
    }

    if (sessionRequest.status !== 'Accepted') {
      return res.status(400).json({ msg: 'Session request has not been accepted yet' });
    }

    if (!sessionRequest.receipt) {
      return res.status(400).json({ msg: 'Receipt is required before booking a session' });
    }

    const coachProfile = sessionRequest.coachProfileId;
    if (!coachProfile || !coachProfile.coachPrice) {
      return res.status(400).json({ msg: 'Coach price information is missing.' });
    }

    const { individualSessionPrice, groupSessionPrice } = coachProfile.coachPrice;
    const sessionFee = sessionRequest.sessionType === 'Individual Session' ? individualSessionPrice : groupSessionPrice;

    const newBooking = new SessionBooking({
      sessionRequestId: sessionRequest._id,
      userId: sessionRequest.userId,
      userName: sessionRequest.userName,
      userEmail: sessionRequest.userEmail,
      userPhone: sessionRequest.userPhone,
      sportName: sessionRequest.sportName,
      sessionType: sessionRequest.sessionType,
      bookedTimeSlots: sessionRequest.requestedTimeSlots,
      coachId: sessionRequest.coachId._id, 
      coachName: coachProfile.coachName,
      coachEmail: sessionRequest.coachId.email,
      coachLevel: coachProfile.coachLevel,
      sessionFee: sessionFee,
      courtNo: sessionRequest.courtNo,
      receipt: sessionRequest.receipt 
    });

    await newBooking.save();

    
    const qrData = `Booking ID: ${newBooking._id}\nUser: ${newBooking.userName}\nSport: ${newBooking.sportName}\nSession Type: ${newBooking.sessionType}\nCoach: ${newBooking.coachName}\nFee: Rs. ${newBooking.sessionFee}\nDate & Time: ${newBooking.bookedTimeSlots.map(slot => `${slot.date} ${slot.timeSlot}`).join(', ')}`;
    
    const qrCodeBuffer = await QRCode.toBuffer(qrData);
    const qrCodeResult = await uploadToCloudinary(qrCodeBuffer, 'session_qrcodes');
    const qrCodeUrl = qrCodeResult.secure_url; 

    newBooking.qrCodeUrl = qrCodeUrl;
    await newBooking.save();

    await sendSessionBookingConfirmationEmail(newBooking.userEmail, newBooking);

    const response = {
      sessionRequestId: newBooking.sessionRequestId,
      userId: newBooking.userId,
      userName: newBooking.userName,
      userEmail: newBooking.userEmail,
      userPhone: newBooking.userPhone,
      sportName: newBooking.sportName,
      sessionType: newBooking.sessionType,
      coachId: newBooking.coachId.toString(), 
      coachName: newBooking.coachName,
      coachEmail: newBooking.coachEmail,
      coachLevel: newBooking.coachLevel,
      sessionFee: newBooking.sessionFee,
      courtNo: newBooking.courtNo,  
      receipt: newBooking.receipt, 
      qrCodeUrl: newBooking.qrCodeUrl, 

      _id: newBooking._id,
      createdAt: newBooking.createdAt,
      __v: newBooking.__v
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Upload Receipt for Session Request
exports.uploadReceipt = (req, res) => {
  uploadReceipt.single('receipt')(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ msg: err });
      }

      if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
      }

      let sessionRequest = await SessionRequest.findById(req.params.id);

      if (!sessionRequest) {
        return res.status(404).json({ msg: 'Session request not found' });
      }

      const receiptResult = await uploadToCloudinary(req.file.buffer, 'session_receipts');
      const receiptUrl = receiptResult.secure_url; 

      sessionRequest.receipt = receiptUrl;
      await sessionRequest.save();

      res.json(sessionRequest);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
};





// Get User's Booking History
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await SessionBooking.find({ userId });

    if (!bookings.length) {
      return res.status(404).json({ msg: 'No booking history found for this user.' });
    }

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Coach's Booking History
exports.getCoachBookings = async (req, res) => {
  try {
    const { coachId } = req.params;

    const bookings = await SessionBooking.find({ coachId });

    if (!bookings.length) {
      return res.status(404).json({ msg: 'No booking history found for this coach.' });
    }

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get All Session Bookings
exports.getAllBookings = async (req, res) => {
  try {
    
    const bookings = await SessionBooking.find();

    if (!bookings.length) {
      return res.status(404).json({ msg: 'No bookings found.' });
    }

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/receipts',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, 
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('receipt');

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images and PDFs Only!');
  }
}


exports.getQrCodeById = async (req, res) => {
  try {
    const booking = await SessionBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    res.json({
      qrCodeUrl: booking.qrCodeUrl  
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
