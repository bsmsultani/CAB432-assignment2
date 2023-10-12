import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

// Configure multer to handle file uploads
const upload = multer();
const DEFAULT_FRAME_RATE = 30;

// Function to save buffer to a file
async function bufferToFile(buffer, filename) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, buffer, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function extractFramesFromVideo(videoPath, rate) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(videoPath)
            .fps(rate)
            .on('end', resolve)
            .on('error', reject)
            .output('frames/frame_%05d.png')  //use 05d as it accepts all types of video frames. 
            .run();         //need help here though, it stores atm for trials to frames section but idt its supposed to do that. 
    });
}

async function videoUpload(req, res, next) {
  upload.single("video")(req, res, async function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error uploading video.");
    }

    let frameRate = DEFAULT_FRAME_RATE;
    // Uncomment the below line when ready to accept frame rate from the request body
    // let frameRate = parseInt(req.body.frameRate);

    if (isNaN(frameRate) || frameRate < 5 || frameRate > 100) {
        return res.status(400).send("Invalid frame rate specified.");
    }

    const tempFilePath = './temp_video.mp4';  // make a name changed here, this is temp. 
    try {
        await bufferToFile(req.file.buffer, tempFilePath);
        await extractFramesFromVideo(tempFilePath, frameRate);
        fs.unlinkSync(tempFilePath);  // delete the temporary file
        res.status(200).send("File uploaded and frames extracted successfully.");
    } catch (error) {
        console.error(error);
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);  // ensure we delete the temp file even on error
        }
        res.status(500).send("Error processing video.");
    }
  });
}

export default videoUpload;

