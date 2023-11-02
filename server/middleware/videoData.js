import S3Utils from "../utils/s3Utils.js";

async function videoData(req, res, next) {

    console.log('videoData middleware called');
    const videoHash = req.body.video_hash;

    try {
        if (!req.body.video_hash) {
            res.status(400).send('Missing video_hash');
            return;
        }

        const s3 = new S3Utils(req.AWS);
        const file = await s3.getObject(`${videoHash}/frames.json`);

        if (!file) {
            res.status(404).send('Video not found');
            return;
        }

        let jsonData;
            
        const content = file.Body.toString('utf-8');
        jsonData = JSON.parse(content);

        console.log("Sent JSON data");
        
        res.send({jsonData: jsonData});
    } catch (error) {
        if (error.code === 'NoSuchKey') {
            console.error('Video data is not available yet', videoHash);
            res.status(404).send('Video data is not available yet');
            return;
        }
        console.error('Error in videoData middleware:', error);
        res.status(500).send('Error processing video data');
    }
}

export default videoData;
