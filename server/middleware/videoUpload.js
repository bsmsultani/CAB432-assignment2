import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';

// Configure multer to handle file uploads
const upload = multer();
const DEFAULT_FRAME_RATE = 30;

async function extractFramesFromVideo(videoBuffer, rate) {
  return new Promise((resolve, reject) => {
      // 2nd package helps with video handling and everything sorta
      ffmpeg()
          .input(videoBuffer)
          .fps(rate) // Set the frame rate for extraction// temp
          .on('end', resolve)
          .on('error', reject)
          .output('path_to_save_frames/frame_%i.png')  //frames to be saved somewhere for extraction, temp for now. 
          .run();
  });
}

function videoUpload(req, res, next) {
  upload.single("video")(req, res, async function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error uploading video.");
    }

    let frameRate = DEFAULT_FRAME_RATE;// temp created as you said ++ for now its just 30 so the logic on next line is ignored but
    if (isNaN(frameRate) || frameRate < 5 || frameRate > 100) { //  let frameRate = parseInt(req.body.frameRate); this line will work on 28.
        return res.status(400).send("Invalid frame rate specified.");
    }

    try {
      await extractFramesFromVideo(req.file.buffer, frameRate);
      res.status(200).send("File uploaded and frames extracted successfully.");
    } catch (frameExtractionError) {
      console.error(frameExtractionError);
      res.status(500).send("Error extracting frames from video.");
    }
  });
}

export default videoUpload;