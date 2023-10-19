import multer from 'multer';
import VideoAnalyser from '../utils/videoAnalyser.js';

const upload = multer();


async function videoUpload(req, res, next) {
  upload.single('video')(req, res, async function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Error uploading video.');
    }
    console.log('Video uploaded.');
    try { const analyser = new VideoAnalyser(req.file); res.status(200).send("Video uploaded successfully"); }
    catch (err) { console.log(err); return res.status(500).send(err); }
    
  });
}

export default videoUpload;
