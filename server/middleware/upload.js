import path from 'path';
import RedisUtils from '../utils/redisUtils.js';

const bucketName = "cab432group100";

async function upload(req, res, next) {
    const video_hash = req.body.video_hash;
    
    console.log('video_hash', video_hash);
    res.send({ message: "Video upload successful" });
    
    const redis = new RedisUtils(req.redisClient, video_hash);
    if (await redis.isVideoProcessed()) {
        return res.status(200).send({ message: "Video already processed" });
    }    

}

export default upload;
