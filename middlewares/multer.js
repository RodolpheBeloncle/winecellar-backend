const multer = require('multer');
const fs = require('fs');

// multer config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    let path = `uploads/img`;
    fs.mkdirsSync(path);
    cb(null, __dirname + path);
  },
  filename(req, file, cb) {
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

const dest = 'uploads/img';
const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
  dest,
  storage,
}).single('img');
module.exports = upload;
