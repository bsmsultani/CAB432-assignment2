import path from 'path';
import RedisUtils from '../utils/redisUtils.js';
import S3Utils from '../utils/s3Utils.js';

const bucketName = "cab432group100";

async function upload(req, res, next) {
    const video_hash = req.body.video_hash;
    
    console.log('video_hash', video_hash);

    const redis = new RedisUtils(req.redisClient, video_hash);
    if (await redis.isVideoProcessed() == false) {

        const s3 = new S3Utils(req.AWS);
        const results = await s3.listBucketContents();
        const url = await s3.getSignedUrl(video_hash);
        console.log('url', url);
        console.log('results', results);
        
        return res.status(200).send({ message: "Video already processed" });
    }

    res.send({ message: "Video uploaded successfully" });

}

export default upload;
