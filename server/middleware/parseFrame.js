import os from 'os';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

const command = ffmpeg();

async function parseFrame(req, res, next) {
    const { videoId } = req.params;
    console.log('Parsing frames for video:', videoId);

    
    const videoDir = path.join(os.tmpdir(), videoId);
    const videoPath = path.join(videoDir, `${videoId}.mp4`);

    const outputDir = path.join(videoDir, 'frames');
    fs.mkdirSync(outputDir);

    command.input(videoPath)
    .on('end', () => {
        console.log('Finished extracting frames.');
        res.status(200).send({ message: 'Parsing frames' });
    })
    .on('error', (err) => {
        console.error('Error:', err);
        res.status(500).send({ message: 'Error parsing frames' });
    })
    .output(path.join(outputDir, 'frame-%04d.jpeg'))
    .outputOptions(['-vf', 'fps=1,scale=720:-1', '-threads', '4', '-preset', 'ultrafast'])
    .run();
}

export default parseFrame;