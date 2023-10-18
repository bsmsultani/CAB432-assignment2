import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import os from 'os';

const upload = multer();

async function bufferToFile(buffer, fileExtension) {
  const videoId = uuidv4();
  const videoDir = path.join(os.tmpdir(), videoId);

  console.log('Saving video file to:', videoDir);

  try {
    fs.mkdirSync(videoDir);

    const uniqueFilename = `${videoId}.${fileExtension}`;
    const filePath = path.join(videoDir, uniqueFilename);

    await fs.promises.writeFile(filePath, buffer);
    return videoId;
  } catch (err) {
    throw err;
  }
}

async function videoUpload(req, res, next) {
  upload.single('video')(req, res, async function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Error uploading video.');
    }

    if (!req.file) {
      return res.status(400).send('No video file uploaded.');
    }

    try {
      const { buffer, originalname } = req.file;
      const fileExtension = path.extname(originalname).slice(1);
      const videoId = await bufferToFile(buffer, fileExtension);

      res.status(200).send({ videoId });

    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .send(
          'Error saving video file. Make sure you are uploading a valid video file.'
        );
    }
  });
}

export default videoUpload;
