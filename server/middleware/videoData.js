import S3Utils from "../utils/s3Utils.js";

async function videoData(req, res, next) {

    try {
        console.log('videoData middleware called');

        if (!req.body.video_hash) {
            res.status(400).send('Missing video_hash');
            return;
        }

        const videoHash = req.body.video_hash;

        const s3 = new S3Utils(req.AWS);
        const file = await s3.getObject(`${videoHash}/frames.json`);

        if (!file) {
            res.status(404).send('Video not found');
            return;
        }

        let jsonData;
            
        const content = file.Body.toString('utf-8');
        jsonData = JSON.parse(content);


        res.send({jsonData: jsonData});
    } catch (error) {
        console.error('Error in videoData middleware:', error);
        res.status(500).send('Error processing video data');
    }
}

export default videoData;
