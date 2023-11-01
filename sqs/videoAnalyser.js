import os from 'os';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import crypto from 'crypto';
import { spawn } from 'child_process';

function generateMD5Hash(buffer) {
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex');
}

const apiKey = "AIzaSyDIvVTx_Jrbf3utLtqiXt0zjZf_54ik1sU";

class VideoAnalyser
{
  
    constructor(videoHash, s3)
    {
      this.redisClient = redisClient;
      this.videoId = uuidv4();
      if (!tempPathSave) this.tempPathSave = path.join(os.tmpdir(), this.videoId); fs.mkdirSync(this.tempPathSave);
      this.framesDir = path.join(this.tempPathSave, 'frames'); fs.mkdirSync(this.framesDir);
      this.graphOutputDir = path.join(this.tempPathSave, 'graphs');
      if (!fs.existsSync(this.graphOutputDir)) fs.mkdirSync(this.graphOutputDir);
      

    }

    async initAnalysis(buffer, fileExtension) {
      this.videoHash = generateMD5Hash(buffer);
      const isProcessed = await this.isVideoProcessed();
      console.log('isProcessed', isProcessed);

      if (isProcessed == false || isProcessed == true) { // CHANGE LATER
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
    this.jsonPath = path.join(this.tempPathSave, 'frames.json');
    fs.writeFileSync(this.jsonPath, JSON.stringify(frames, null, 4));
    console.log('Saved frames to:', this.jsonPath);
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
      objects.sort((a, b) => a.second - b.second);
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


    plot_objects_overtime() {
        return new Promise((resolve, reject) => {
            console.log('Generating graph...');

            let frames;
            try {
                frames = JSON.parse(fs.readFileSync(this.jsonPath));
                if (!frames) throw new Error('No json data for frames found.');
            } catch (error) { return reject(new Error('Error reading json files for frames: ' + error.message)); }

            // get the largest second
            const lastFrame = frames[frames.length - 1];
            const firstSecond = frames[0].second;
            const lastSecond = lastFrame.second;
            const interval = parseInt((lastSecond - firstSecond) / 20);


            const args = [
                "--filepath", this.jsonPath,
                "--output", this.graphOutputDir,
                "--function", "plot_top_objects",
                "--interval", interval.toString(),
                "--output_dir", this.graphOutputDir,
            ];

            const scriptPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'plot.py');

            const process = spawn('python3', [scriptPath, ...args]);

            process.on('exit', (code) => {
                if (code === 0) {
                    const fileName = "top_objects.html";
                    const filePath = path.join(this.graphOutputDir, fileName);
                    const file = fs.readFileSync(filePath);
                    resolve(file);
                } else {
                    reject(new Error('Error generating graph.'));
                }
            });

            process.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        });
    }


  async analyseVideo() {
      
  }
}

export default VideoAnalyser;