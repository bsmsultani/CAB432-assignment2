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

  class VideoAnalyser {
    constructor(ReqFile, tempPathSave = null) {
      // ... other code ...
  
      (async () => {
        const videoHash = generateMD5Hash(buffer); // Generate MD5 for the video
        const isProcessed = await this.isVideoProcessed(videoHash); // Check if video was processed
  
        if (!isProcessed) {
          await this.__bufferToFile(buffer, fileExtension);
          await this.__parseFrame();
          const frames = await this.__analyseFrames();
          
          // save the frames to a json file
          // ... your code ...
  
          await this.markVideoAsProcessed(videoHash); // Mark video as processed in Redis
        } else {
          console.log("Video already processed.");
        }
      })();
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
  }
  