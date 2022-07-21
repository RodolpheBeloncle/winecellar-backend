const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'dbjnz8gwu',
  api_key: '553783697929514',
  api_secret: 'QBPgWyE7LZornkd7EEwRko1xtAo',
});

uploadToCloudinary = (path, folder) => {
  return cloudinary.v2.uploader
    .upload(path, { folder })
    .then((data) => {
      return { url: data.url, public_id: data.public_id };
    })
    .catch((error) => {
      console.log(error);
    });
};

removeFromCloudinary = async (public_id) => {
  await cloudinary.v2.uploader.destroy(public_id, function (error, result) {
    console.log(result, error);
  });
};

module.exports = { uploadToCloudinary, removeFromCloudinary };
