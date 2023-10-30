import os from 'os';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import crypto from 'crypto';

function generateMD5Hash(buffer) {
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex');
}

const apiKey = "AIzaSyDIvVTx_Jrbf3utLtqiXt0zjZf_54ik1sU";

class VideoAnalyser
{
  
    constructor(ReqFile, tempPathSave = null, redisClient = null)
    {
      this.redisClient = redisClient;

      if (!ReqFile) throw new Error('No video file uploaded.');
      const { buffer, originalname } = ReqFile;
      const fileExtension = path.extname(originalname).slice(1);
      if (fileExtension !== 'mp4') throw new Error('Invalid video file type. File must be an mp4.');
      this.originalname = originalname;
      this.videoId = uuidv4();
      if (!tempPathSave) this.tempPathSave = path.join(os.tmpdir(), this.videoId); fs.mkdirSync(this.tempPathSave);
      this.framesDir = path.join(this.tempPathSave, 'frames'); fs.mkdirSync(this.framesDir);
      (async () => {
        await this.initAnalysis(buffer, fileExtension);
      }
      )();
      

    }

    async initAnalysis(buffer, fileExtension) {
      const isProcessed = await this.isVideoProcessed();
      console.log('isProcessed', isProcessed);

      if (!isProcessed) {
          await this.__bufferToFile(buffer, fileExtension);
          await this.__parseFrame();
          const frames = await this.__analyseFrames();
          await this.__saveFramesTemp(frames);
          await this.markVideoAsProcessed();

      } else {
          console.log("Video already processed.");
      }
  }

  async isVideoProcessed() {
    
    this.videoHash = generateMD5Hash(this.originalname);
    try {
      const isProcessed = await this.redisClient.sIsMember("processed_videos", this.videoHash);
      console.log('isProcessed', isProcessed);
      return isProcessed;
    }
    catch (err) {throw err; }
  }

  async markVideoAsProcessed() {
  try {await this.redisClient.sAdd("processed_videos", this.videoHash);}
  catch (err) {throw err; }};


  async __saveFramesTemp(frames) {
    const framesPath = path.join(this.tempPathSave, 'frames.json');
    fs.writeFileSync(framesPath, JSON.stringify(frames, null, 4));
    console.log('Saved frames to:', framesPath);
  }


  async __bufferToFile(buffer, fileExtension) {
      console.log('Saving video file to:', this.tempPathSave);
      try {
          const uniqueFilename = `${this.videoId}.${fileExtension}`;
          this.filePath = path.join(this.tempPathSave, uniqueFilename);
          await fs.promises.writeFile(this.filePath, buffer);
      } catch (err) {
          throw err;
      }
  }

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

  async __analyseFrames() {
      const frames = fs.readdirSync(this.framesDir);
      console.log('Analyzing frames...');
      const objects = [];
      await Promise.all(
          frames.map(async (frame) => {
              const framePath = path.join(this.framesDir, frame);
              const frameObjects = await this.__annotateFrame(framePath);
              if (!frameObjects) return;

              const frameSec = frame.split('.')[0];
              objects.push({ second: frameSec, objects: frameObjects });
          })
      );
      console.log('Finished analyzing frames.');
      return objects;
  }

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

  async analyseVideo() {
      
  }
}

export default VideoAnalyser;