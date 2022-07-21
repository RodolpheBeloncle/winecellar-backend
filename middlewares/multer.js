const multer = require('multer');

// multer config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/img');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});

const dest = 'uploads/img';
const limits = { fileSize: 1000 * 1000 * 4 }; // limit to 4mb
const upload = multer({ dest, limits, storage }).single('img');
module.exports = upload ;
