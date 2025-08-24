const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(__dirname, 'current directory name')    
    const dir = path.join(__dirname, '/uploads');
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) return console.error(err);
      console.log("New Directory created successfully!");
    });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const extensions = file.originalname.toString().split('.');
    const extension = extensions[extensions.length - 1];
    const fileName = `${Date.now()}.${extension}`;
    cb(null, fileName);
  },
});

module.exports = multer({ storage });