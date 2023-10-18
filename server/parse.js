import fs from 'fs';
import os from 'os';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

const command = ffmpeg();

async function parseFrame() {
    console.time('parseFrame');

    const videoPath = "./video.mp4";
    const outputDir = path.join('./', 'frames');

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    command.input(videoPath)
        .on('end', () => {
            console.log('Finished extracting frames.');
            console.timeEnd('parseFrame');
        })
        .on('error', (err) => {
            console.error('Error:', err);
        })
        .output(path.join(outputDir, 'frame-%04d.jpeg'))
        .outputOptions(['-vf', 'fps=1,scale=720:-1', '-threads', '4', '-preset', 'ultrafast'])
        .run();
}

(async () => {
    await parseFrame();
})();
