import multer from 'multer';
import VideoAnalyser from '../utils/videoAnalyser.js';
import fs from 'fs';

const upload = multer();



async function videoUpload(req, res, next) {
  upload.single('video')(req, res, async function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Error uploading video.');
    }
    console.log('Video uploaded.');
    try
    { 
      const analyser = new VideoAnalyser(req.file, null, req.redisClient);
      // send a response 200 OK
      res.status(200).json({ videoId: analyser.videoId });
      
    }
    catch (err) { console.log(err); return res.status(500).send(err); }
    
  });
}

export default videoUpload;
