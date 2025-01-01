
const Equipment = require('../models/Equipment');
const cloudinary = require('../config/cloudinaryConfig'); 
const multer = require('multer');

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
 * Create a new piece of equipment.
 * @param {Object} req - The request object containing the equipment details and image file.
 * @param {Object} res - The response object.
 */
exports.createEquipment = [
  upload.single('image'), 
  async (req, res) => {
    try {
      const { equipmentName, sportName, rentPrice } = req.body;

      if (!req.file) {
        return res.status(400).json({ msg: 'Please upload an image.' });
      }

      const imageResult = await uploadToCloudinary(req.file.buffer, 'equipment_images');
      const imageUrl = imageResult.secure_url; 

      const equipment = new Equipment({
        equipmentName,
        sportName,
        rentPrice,
        image: imageUrl
      });

      await equipment.save();
      return res.status(201).json(equipment);
    } catch (err) {
      console.error('Server error while creating equipment:', err.message);
      return res.status(500).send('Server error. Please try again later.');
    }
  }
];

/**
 * Update an existing piece of equipment.
 * @param {Object} req - The request object containing the equipment details and optional image file.
 * @param {Object} res - The response object.
 */
exports.updateEquipment = [
  upload.single('image'), 
  async (req, res) => {
    try {
      const { equipmentName, sportName, rentPrice } = req.body;

      const equipment = await Equipment.findById(req.params.id);

      if (!equipment) {
        return res.status(404).json({ msg: 'Equipment not found.' });
      }

      equipment.equipmentName = equipmentName || equipment.equipmentName;
      equipment.sportName = sportName || equipment.sportName;
      equipment.rentPrice = rentPrice || equipment.rentPrice;
      equipment.updatedAt = Date.now();

      if (req.file) {
        const imageResult = await uploadToCloudinary(req.file.buffer, 'equipment_images');
        equipment.image = imageResult.secure_url; 
      }

      await equipment.save();
      return res.json(equipment);
    } catch (err) {
      console.error('Server error while updating equipment:', err.message);
      return res.status(500).send('Server error. Please try again later.');
    }
  }
];





/**
 * Delete an existing piece of equipment.
 * @param {Object} req - The request object containing the equipment ID.
 * @param {Object} res - The response object.
 */
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ msg: 'Equipment not found.' });
    }

    await Equipment.deleteOne({ _id: req.params.id });
    return res.json({ msg: 'Equipment removed successfully.' });
  } catch (err) {
    console.error('Server error while deleting equipment:', err.message);
    return res.status(500).send('Server error. Please try again later.');
  }
};

/**
 * Retrieve all equipment.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    return res.json(equipment);
  } catch (err) {
    console.error('Server error while retrieving all equipment:', err.message);
    return res.status(500).send('Server error. Please try again later.');
  }
};

/**
 * Retrieve a single piece of equipment by ID.
 * @param {Object} req - The request object containing the equipment ID.
 * @param {Object} res - The response object.
 */
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ msg: 'Equipment not found.' });
    }

    return res.json(equipment);
  } catch (err) {
    console.error('Server error while retrieving equipment by ID:', err.message);
    return res.status(500).send('Server error. Please try again later.');
  }
};

/**
 * Retrieve all available (active) equipment.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.getAvailableEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ isActive: true });
    return res.json(equipment);
  } catch (err) {
    console.error('Server error while retrieving available equipment:', err.message);
    return res.status(500).send('Server error. Please try again later.');
  }
};

/**
 * Toggle the active status of a piece of equipment.
 * @param {Object} req - The request object containing the equipment ID.
 * @param {Object} res - The response object.
 */
exports.toggleEquipmentStatus = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ msg: 'Equipment not found.' });
    }

    equipment.isActive = !equipment.isActive;
    equipment.updatedAt = Date.now();

    await equipment.save();
    return res.json(equipment);
  } catch (err) {
    console.error('Server error while toggling equipment status:', err.message);
    return res.status(500).send('Server error. Please try again later.');
  }
};
