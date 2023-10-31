import path from 'path';
import RedisUtils from '../utils/redisUtils.js';

const bucketName = "cab432group100";

async function upload(req, res, next) {
    const video_hash = req.body.video_hash;
    
    console.log('video_hash', video_hash);

    const redis = new RedisUtils(req.redisClient, video_hash);
    if (await redis.isVideoProcessed()) {

        // put in s3 bucket
        
        return res.status(200).send({ message: "Video already processed" });
    }

    res.send({ message: "Video uploaded successfully" });

}

export default upload;
