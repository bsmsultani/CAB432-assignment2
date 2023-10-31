import path from 'path';
import RedisUtils from '../utils/redisUtils';

async function upload(req, res, next) {
    video_hash = req.body.video_hash;
    const redis = new RedisUtils(req.redisClient, video_hash);
    if (await redis.isVideoProcessed()) {
        return res.status(200).send({ message: "Video already processed" });
    }



    

}

export default upload;
