import os from 'os';
import path from 'path';

async function parseFrame(req, res, next) {
    const { videoId } = req.params;

    console.log("videoId", videoId);

    const tempDir = os.tmpdir();
    const videoPath = path.join(tempDir, `${videoId}.mp4`);

    res.status(200).send('Frame parsed successfully');
}

export default parseFrame;
