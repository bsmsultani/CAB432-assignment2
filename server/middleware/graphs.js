import RedisUtils from '../utils/redisUtils.js';
import S3Utils from '../utils/s3Utils.js';


async function graphs (req, res, next) {
    if (!req.body.video_hash) {
        return res.status(400).send({ message: "Missing video_hash" });
    }
    

    const video_hash = req.body.video_hash;
    const redis = new RedisUtils(req.redisClient, video_hash);

    // if (!await redis.isVideoProcessed()) {
    //     return res.status(200).send({ message: "Video not processed" });
    // }


    console.log(video_hash);

    const s3 = new S3Utils(req.AWS);
    const key = `${video_hash}/graphs`;

    try {
        const data = await s3.getObject(key);
        console.log(data);
        const graphs = JSON.parse(data.Body.toString('utf-8'));
        res.status(200).send({ graphs });

    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Error getting graphs" });
    }

}

export default graphs;
