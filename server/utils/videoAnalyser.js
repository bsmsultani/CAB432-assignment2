import os from 'os';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';

const apiKey = "AIzaSyDIvVTx_Jrbf3utLtqiXt0zjZf_54ik1sU";

class VideoAnalyser
{
  
    constructor(ReqFile, tempPathSave = null)
    {
      if (!ReqFile) throw new Error('No video file uploaded.');
      const { buffer, originalname } = ReqFile;
      const fileExtension = path.extname(originalname).slice(1);
      if (fileExtension !== 'mp4') throw new Error('Invalid video file type. File must be an mp4.');
      this.originalname = originalname;
      this.videoId = uuidv4();
      if (!tempPathSave) this.tempPathSave = path.join(os.tmpdir(), this.videoId); fs.mkdirSync(this.tempPathSave);
      this.framesDir = path.join(this.tempPathSave, 'frames'); fs.mkdirSync(this.framesDir);

      (async () => {
        await this.__bufferToFile(buffer, fileExtension);
        await this.__parseFrame();
        const frames = await this.__analyseFrames();

        // save the frames to a json file
        const jsonPath = "./frames.json";

        fs.writeFile(jsonPath, JSON.stringify(frames, null, 4), (err) => {
          if (err) {
            console.error(err);
            return;
          };
          console.log("File has been created");
        });
      })();
    }

    
    /**
     * Writes a buffer to a file with a given file extension.
     * @async
     * @param {Buffer} buffer - The buffer to write to the file.
     * @param {string} fileExtension - The file extension to use for the file.
     * @throws {Error} If there is an error writing the file.
     */
    async __bufferToFile(buffer, fileExtension) {
      console.log('Saving video file to:', this.tempPathSave);
      try
      {
        const uniqueFilename = `${this.videoId}.${fileExtension}`;
        this.filePath = path.join(this.tempPathSave, uniqueFilename);
        await fs.promises.writeFile(this.filePath, buffer);
      }
      catch (err) { throw err; }
    }

    /**
     * Parses a video frame by extracting frames from the video file and saving them as JPEG images.
     * @async
     * @function __parseFrame
     * @memberof videoAnalyser
     * @instance
     * @throws {Error} If there is an error while extracting frames.
     * @returns {Promise<void>} A Promise that resolves when the frames have been extracted and saved successfully.
     */
    async __parseFrame() {
      return new Promise((resolve, reject) => {
          const command = ffmpeg();

          command.input(this.filePath)
          .on('end', () => {
              console.log('Finished extracting frames.');
              resolve();  // Resolve the promise when done
          })
          .on('error', (err) => {
              console.error('Error:', err);
              reject(err);  // Reject the promise on error
          })
          .output(path.join(this.framesDir, '%04d.jpeg'))
          .outputOptions(['-vf', 'fps=1,scale=720:-1', '-threads', '4', '-preset', 'ultrafast'])
          .run();
      });
    }

    /**
     * Analyzes the frames in the frames directory and returns an array of objects
     * containing information about the objects detected in each frame.
     * @returns {Promise<Array>} A promise that resolves to an array of objects containing
     * information about the objects detected in each frame.
     */
    async __analyseFrames() {
      const frames = fs.readdirSync(this.framesDir);
      console.log('Analyzing frames...');
      const objects = [];
      await Promise.all(
        frames.map(async (frame) => {
          const framePath = path.join(this.framesDir, frame);
          const frameObjects = await this.__annotateFrame(framePath);
          if (!frameObjects) return;
          objects.push({ path: framePath, objects: frameObjects });
        })
      );
      console.log('Finished analyzing frames.');
      return objects;
    }


    /**
     * Analyzes a single frame of a video by sending it to the Google Cloud Vision API for object localization.
     * @async
     * @param {string} framePath - The path to the frame image file.
     * @returns {Promise<Object[]>} - A promise that resolves with an array of objects detected in the frame.
     */
    async __annotateFrame(framePath) {
      const content = fs.readFileSync(framePath);
      try {
          const response = await axios.post(
              'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey,
              {
                  requests: [
                      {
                          image: {
                              content: content.toString('base64'),
                          },
                          features: [
                              {
                                  type: 'OBJECT_LOCALIZATION',
                              },
                          ],
                      },
                  ],
              }
          );
          const objects = response.data.responses[0].localizedObjectAnnotations;
          return objects;
      } catch (error) {
          console.error('Error detecting objects in the image:', error);
      }
    }
}


export default VideoAnalyser;