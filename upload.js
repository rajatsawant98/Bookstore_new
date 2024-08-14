const multer = require('multer');
const path = require('path');
const crypto = require('crypto');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now(); // Current timestamp
        const randomString = crypto.randomBytes(8).toString('hex'); // Generate a random string
        const fileExtension = path.extname(file.originalname); // Get the file extension

        // Construct the new filename with fieldname, timestamp, and random string
        const newFilename = `${timestamp}-${file.fieldname}-${randomString}${fileExtension}`;

        cb(null, newFilename); // Save the file with the new filename
    }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, JPG, and PNG are allowed.'));
    }
};

// Set up multer middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5 MB file size limit
});


module.exports = upload;
