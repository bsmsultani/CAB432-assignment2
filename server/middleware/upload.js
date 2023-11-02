import RedisUtils from '../utils/redisUtils.js';
import S3Utils from '../utils/s3Utils.js';

async function upload(req, res, next) {

    try {
        console.log('Uploading video...');
        if (!req.body.video_hash) {
            return res.status(400).send({ message: "Missing video_hash" });
        }
        

        const video_hash = req.body.video_hash;

        console.log(video_hash);
        const redis = new RedisUtils(req.redisClient, video_hash);
        const s3 = new S3Utils(req.AWS);

        // redis.deleteVideoFromProcessed();

        if (await redis.isVideoProcessed()) {
            const file = await s3.getObject(`${video_hash}/frames.json`);
            if (!file) {
                return res.status(404).send({ message: "Video not found" });
            }

            let jsonData;

            const content = file.Body.toString('utf-8');
            jsonData = JSON.parse(content);


            console.log('Sending JSON data');

            return res.send({ jsonData: jsonData });
            
        }

        await redis.markVideoAsProcessed();
            
        const key = `${video_hash}/video.mp4`;
        const url = await s3.getSignedUrlForUpload(key);
        res.status(200).send({ s3Url: url});
    }
    catch (error) {
        console.error('Error uploading video:', error);
        return res.status(500).send({ message: "Error uploading video", error});
    }
}

export default upload;
