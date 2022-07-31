const multer = require('multer');

// multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + 'uploads/img');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname.replace(/\s+/g, '-'));
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
  storage,
}).single('img');
module.exports = upload;
