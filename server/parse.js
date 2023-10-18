import fs from 'fs';
import os from 'os';
import path from 'path';

import ffmpeg from 'fluent-ffmpeg';

const command = ffmpeg();

async function parseFrame() {
    const videoPath = "./video.mp4";
    const outputDir = path.join('./', 'frames');

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    command.input(videoPath)
        .on('end', () => {
            console.log('Finished extracting frames.');
        })
        .on('error', (err) => {
            console.error('Error:', err);
        })
        .output(path.join(outputDir, 'frame-%04d.png')) // Output filename format
        .outputOptions(['-vf', 'fps=1']) // Extract one frame per second
        .run();
}

(async () => {
    await parseFrame();
})();
