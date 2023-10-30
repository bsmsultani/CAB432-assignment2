import os from 'os';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import redis from 'redis';
import crypto from 'crypto';

//To connect to a remote Redis instance or ElastiCache, provide the connection details when creating the client:

// connect to ec2 to get this working(cab432group109 is the cluster name)
const redisClient = redis.createClient({
  url: 'redis://cab432group109.km2jzi.ng.0001.apse2.cache.amazonaws.com:6379',
});



function generateMD5Hash(buffer) {
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex');
}





const apiKey = "AIzaSyDIvVTx_Jrbf3utLtqiXt0zjZf_54ik1sU";  //need to hide this key before submission.

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

      this.initAnalysis(buffer, fileExtension);
    }
    async initAnalysis(buffer, fileExtension) {
      const videoHash = generateMD5Hash(buffer); // Generate MD5 for the video
      const isProcessed = await this.isVideoProcessed(videoHash); // Check if video was processed

      if (!isProcessed) {
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

          await this.markVideoAsProcessed(videoHash); // Mark video as processed in Redis
      } else {
          console.log("Video already processed.");
      }
  }

  isVideoProcessed(videoHash) {
      return new Promise((resolve, reject) => {
          redisClient.sismember("processed_videos", videoHash, (err, result) => {
              if (err) reject(err);
              resolve(result === 1);
          });
      });
  }

  markVideoAsProcessed(videoHash) {
      return new Promise((resolve, reject) => {
          redisClient.sadd("processed_videos", videoHash, (err, result) => {
              if (err) reject(err);
              resolve(true);
          });
      });
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