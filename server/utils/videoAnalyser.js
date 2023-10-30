import os from 'os';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import crypto from 'crypto';
import { spawn } from 'child_process';
import AWS from 'aws-sdk';


function generateMD5Hash(buffer) {
  const hash = crypto.createHash('md5');
  hash.update(buffer);
  return hash.digest('hex');
}

const apiKey = "AIzaSyDIvVTx_Jrbf3utLtqiXt0zjZf_54ik1sU";

//npm install install aws-sdk


/*
[901444280953_CAB432-STUDENT]
aws_access_key_id=ASIA5DYSEEJ4754RNK55
aws_secret_access_key=uZ4+keTpEepPhQ/Kgqduo3ru8Bmk3Ck/0ZRR/XrE
aws_session_token=IQoJb3JpZ2luX2VjEKL//////////wEaDmFwLXNvdXRoZWFzdC0yIkcwRQIgM+RihE7zuLuf88uTJ4Jiq8BHjUTh0Bj8q4dEtWRKiLECIQDvem1am3vFw7sFBLVCsQNGqD2LhqE263fA9XgQKAmBSyquAwjL//////////8BEAMaDDkwMTQ0NDI4MDk1MyIMPArGWEuTVA3nOG7DKoIDfy7588sP0hhpRMo7gWIHWKqMWxiLqz6uSE5qQiVf78aqmkupKf2A+Wo+9Cb8T4KjuguyZHKZ7J1vpXtowKdUsJTDx9YuYu9rm/rVd7mq4mu28rnnRq/fHRxNQxQH7GkTpJyrEmccJO5afUNZDpYNktT25a1c8N60sNOQQ25haJtnx01kfjbVkPiG7YuiG7/k3ulQqHS0m67X5BuLItrE1IYSC/VRl25ZuDQrOrVRKJivdoLnjI5+XBCW1dmNhA2MzqO77tKkvZmQi1In/y8vV3m4wIxRpDx+19h8HNDyIN9qO8ZYEO/svAsIZARF0thJNlEkOJ/O1S4CHdjZe6vrwb/b+HUZI/E47hZRx/K9/XGILQFyqBlYZBFNto3p8SZebuotrox8I28COsLaX/wCizpPjp7TIpKpIj7LhJaloQ8aGbZgsfDYhM/wQ+nW7d4OI1qlD3Wyh+tScjFUzOwWm86IWmKmprIIgG4xsEQzX45fD4Ch1h0aIlRrIZZg1rXCEPQw4Jn8qQY6pgG4qsa/XVyZ+tprM7T5WfYcrprvx7XrPZp9Z41l5xtjVWyKCNQKY705C5snEShf8t95H1cPje4rCTXu6BtsSnXEsBHtGRun+t9xAs+Tyuy1+GmlL+Sb2RnhWtkEdWdkjG42sA1r+jTS1hxdpnhDbUpO8HCiYC0R+m55BUhJSvL0yhjPav9+YVJo/GKyZPdfcKF5CZ8oXHUY2XQXnEYYOwHU1Kok+BGJ

AWS.config.update({
  region: 'ap-southeast-2', // THESE KEYS are on my ec2 that already have perms for automatic retrieval.
  accessKeyId: 'ASIA5DYSEEJ4754RNK55',
  secretAccessKey: 'uZ4+keTpEepPhQ/Kgqduo3ru8Bmk3Ck/0ZRR/XrE'
});*/


 AWS.config.update({
  
   accessKeyId: 'ASIA5DYSEEJ4754RNK55',
   secretAccessKey:'uZ4+keTpEepPhQ/Kgqduo3ru8Bmk3Ck/0ZRR/XrE' ,
   sessionToken: 'IQoJb3JpZ2luX2VjEKL//////////wEaDmFwLXNvdXRoZWFzdC0yIkcwRQIgM+RihE7zuLuf88uTJ4Jiq8BHjUTh0Bj8q4dEtWRKiLECIQDvem1am3vFw7sFBLVCsQNGqD2LhqE263fA9XgQKAmBSyquAwjL//////////8BEAMaDDkwMTQ0NDI4MDk1MyIMPArGWEuTVA3nOG7DKoIDfy7588sP0hhpRMo7gWIHWKqMWxiLqz6uSE5qQiVf78aqmkupKf2A+Wo+9Cb8T4KjuguyZHKZ7J1vpXtowKdUsJTDx9YuYu9rm/rVd7mq4mu28rnnRq/fHRxNQxQH7GkTpJyrEmccJO5afUNZDpYNktT25a1c8N60sNOQQ25haJtnx01kfjbVkPiG7YuiG7/k3ulQqHS0m67X5BuLItrE1IYSC/VRl25ZuDQrOrVRKJivdoLnjI5+XBCW1dmNhA2MzqO77tKkvZmQi1In/y8vV3m4wIxRpDx+19h8HNDyIN9qO8ZYEO/svAsIZARF0thJNlEkOJ/O1S4CHdjZe6vrwb/b+HUZI/E47hZRx/K9/XGILQFyqBlYZBFNto3p8SZebuotrox8I28COsLaX/wCizpPjp7TIpKpIj7LhJaloQ8aGbZgsfDYhM/wQ+nW7d4OI1qlD3Wyh+tScjFUzOwWm86IWmKmprIIgG4xsEQzX45fD4Ch1h0aIlRrIZZg1rXCEPQw4Jn8qQY6pgG4qsa/XVyZ+tprM7T5WfYcrprvx7XrPZp9Z41l5xtjVWyKCNQKY705C5snEShf8t95H1cPje4rCTXu6BtsSnXEsBHtGRun+t9xAs+Tyuy1+GmlL+Sb2RnhWtkEdWdkjG42sA1r+jTS1hxdpnhDbUpO8HCiYC0R+m55BUhJSvL0yhjPav9+YVJo/GKyZPdfcKF5CZ8oXHUY2XQXnEYYOwHU1Kok+BGJ',
  region: "ap-southeast-2",
 });

AWS.config.update({ region: "ap-southeast-2" });
const sqs = new AWS.SQS();


  

  


class VideoAnalyser
{
  
    constructor(tempPathSave = null, redisClient = null, bucketName)
    {
      this.s3 = new AWS.S3(); //new line
      this.redisClient = redisClient;
      this.videoId = uuidv4();
      this.bucketName = bucketName || "group109";
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
   /**
   * Creates an S3 bucket with the provided name.
   * 
   * @param {string} bucketName - The name of the bucket to create.
   * @returns {Promise} - Resolves when the bucket is created or an error occurs.
   */
   async createBucket(bucketName) {
    const params = {
      Bucket: this.bucketName,
      ACL: 'public',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-southeast-2'
      }
    };

    try {
      await this.s3.createBucket(params).promise();
      console.log(`Bucket ${bucketName} created successfully.`);
    } catch (error) {
      console.error("Error creating S3 bucket:", error);
      throw error;
    }
  }


  async uploadVideoToS3(videoId, videoBuffer) {
    const params = {
      Bucket: this.bucketName, // replace with your bucket name
      Key: `${videoId}.mp4`,
      Body: videoBuffer
    };

    try {
      await this.s3.putObject(params).promise();
      console.log(`Video uploaded to S3 with id: ${videoId}`);
    } catch (error) {
      console.error("Error uploading video to S3:", error);
      throw error;
    }
  }

  /**
   * Fetches the video buffer from an S3 bucket based on the videoId.
   *
   * @param {string} videoId - The unique identifier for the video.
   * @returns {Promise<Buffer>} - Resolves with the video buffer.
   */
  async getVideoBuffer(videoId) {
    const params = {
      Bucket: this.bucketName, 
      Key: `${videoId}.mp4` 
    };

    try {
      const data = await this.s3.getObject(params).promise();
      return data.Body;
    } catch (error) {
      console.error("Error fetching video from S3:", error);
      throw error;
    }
  }


  /**
 * Sends a video ID to the specified SQS queue.
 * 
 * @param {string} videoId - The unique identifier for the video.
 * @returns {Promise} - Resolves when the message has been sent or an error has occurred.
 */
async sendVideoToSQS(videoId) {
    // Parameters for sending the videoId as a message to the SQS queue
    const sendMessageParams = {
      MessageBody: JSON.stringify({
        videoId: videoId,
      }),
      // The URL of the SQS queue to which the message will be sent
      QueueUrl: 'https://sqs.ap-southeast-2.amazonaws.com/901444280953/cab432group109'
    };
  
    // Send the message to the SQS queue
    sqs.sendMessage(sendMessageParams, (err, data) => {
      if (err) {
        // Log any errors that occur during sending
        console.error("Error while sending message:", err);
      } else {
        // Log the message ID returned by AWS on successful sending
        console.log("Message sent, ID:", data.MessageId);
      }
    });
  }
  
  /**
   * Processes messages from the SQS queue. For each message, it retrieves the corresponding video,
   * analyses it, and then deletes the message from the queue.
   * 
   * @returns {Promise} - Resolves when all the available messages have been processed or an error occurs.
   */
  async processSQSMessages() {
    // Parameters for receiving messages from the SQS queue
    const receiveMessageParams = {
      QueueUrl: 'https://sqs.ap-southeast-2.amazonaws.com/901444280953/cab432group109',
      MaxNumberOfMessages: 10,   // Maximum number of messages to retrieve in one call
      WaitTimeSeconds: 20        // Use long polling to wait for messages
    };
    
    // Receive messages from the SQS queue
    sqs.receiveMessage(receiveMessageParams, async (err, data) => {
      if (err) {
        // Log any errors that occur during message reception
        console.error("Receive error", err);
      } else {
        // Check if there are any messages in the received data
        if (data.Messages) {
          // Iterate over each received message
          for (const message of data.Messages) {
            // Parse the content of the message to get the videoId
            const body = JSON.parse(message.Body);
            const videoId = body.videoId;

        // Here, retrieve the video using the provided videoId, then analyze it using the VideoAnalyser class
            const videoBuffer = await getVideoBuffer(videoId); 
            const fileExtension = "mp4"; 
            await this.initAnalysis(videoBuffer, fileExtension);
  
            // After processing the video, delete the message from the SQS queue to ensure it isn't processed again
            const deleteParams = {
              QueueUrl: 'https://sqs.ap-southeast-2.amazonaws.com/901444280953/cab432group109',
              ReceiptHandle: message.ReceiptHandle
            };
            sqs.deleteMessage(deleteParams, (deleteErr, deleteData) => {
              if (deleteErr) {
                // Log any errors that occur during message deletion
                console.error("Delete error", deleteErr);
              } else {
                // Log the message ID of the deleted message
                console.log("Message deleted", message.MessageId);
              }
            });
          }
        }
      }
    });
  }
}

export default VideoAnalyser;





