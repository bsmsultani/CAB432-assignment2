import multer from 'multer';

// Configure multer to handle file uploads
const upload = multer();

function videoUpload(req, res, next) {
  upload.single("video")(req, res, function (err) {


    console.log(err);

    res.status(200).send("File uploaded successfully.");

    
    console.log(req.file);
    next();
  });
}

export default videoUpload;