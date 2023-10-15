import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import os from 'os';


const upload = multer();

async function bufferToFile(buffer, fileExtension) {
  const tempDir = os.tmpdir();
  const fileId = uuidv4();
  const uniqueFilename = `${fileId}.${fileExtension}`;
  const filePath = path.join(tempDir, uniqueFilename);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve(fileId);
    });
  });
}

async function videoUpload(req, res, next) {
  upload.single("video")(req, res, async function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error uploading video.");
    }

    if (!req.file) {
      return res.status(400).send("No video file uploaded.");
    }

    try {
      const { buffer, originalname } = req.file;
      const fileExtension = originalname.split('.').pop();
      const fileId = await bufferToFile(buffer, fileExtension);

      res.status(200).send({ fileId });

    } catch (err) {
      console.error(err);
      return res.status(500).send("Error saving video file. Make sure you are uploading a valid video file.");
    }

  });
}

export default videoUpload;
