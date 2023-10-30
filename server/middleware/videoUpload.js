import multer from 'multer';
import VideoAnalyser from '../utils/videoAnalyser.js';
import path from 'path';


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
      if (!req.file) throw new Error('No video file uploaded.');
      const { buffer, originalname } = req.file;
      const fileExtension = path.extname(originalname).slice(1);
      if (fileExtension !== 'mp4') throw new Error('Invalid video file type. File must be an mp4.');
      
      const analyser = new VideoAnalyser(null, req.redisClient)
      await analyser.initAnalysis(buffer, fileExtension);
      const result = await analyser.plot_objects_overtime();

      res.status(200).json({ videoId: analyser.videoId });
      
    }
    catch (err) { console.log(err); return res.status(500).send(err); }
    
  });
}

export default videoUpload;
