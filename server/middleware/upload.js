import RedisUtils from '../utils/redisUtils.js';
import S3Utils from '../utils/s3Utils.js';

async function upload(req, res, next) {
    if (!req.body.video_hash) {
        return res.status(400).send({ message: "Missing video_hash" });
    }

    const video_hash = req.body.video_hash;

    const redis = new RedisUtils(req.redisClient, video_hash);
    if (await redis.isVideoProcessed()) {
        return res.status(200).send({ message: "Video already processed" });
    }

    const s3 = new S3Utils(req.AWS);
    await redis.markVideoAsProcessed();
    const url = await s3.getSignedUrlForUpload(video_hash);
    res.status(200).send({ s3Url: url});
}

export default upload;
