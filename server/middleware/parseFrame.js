import os from 'os';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

const command = ffmpeg();

async function parseFrame(req, res, next) {
    const { videoId } = req.params;

    console.log("videoId", videoId);

    const tempDir = os.tmpdir();
    const videoPath = path.join(tempDir, `${videoId}.mp4`);

    command.input(videoPath)
    .on('end', () => {
        console.log('Finished extracting frames.');
        console.timeEnd('parseFrame');
    })
    .on('error', (err) => {
        console.error('Error:', err);
    })
    .output(path.join(outputDir, 'frame-%04d.jpeg'))
    .outputOptions(['-vf', 'fps=1,scale=480:-1', '-threads', '4', '-preset', 'ultrafast'])
    .run();

    res.status(200).send({ message: 'Parsing frames' });
}

export default parseFrame;