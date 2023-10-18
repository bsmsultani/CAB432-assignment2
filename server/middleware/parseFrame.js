import fs from 'fs';
import os from 'os';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

const command = ffmpeg();

async function parseFrame(req, res, next) {
    const { videoId } = req.params;

    console.log("videoId", videoId);

    const tempDir = os.tmpdir();
    const videoPath = path.join(tempDir, `${videoId}.mp4`);

    // Parse the frame
    await command.input(videoPath)
        .outputOptions([
            '-vf', 'select=eq(pict_type\,I)',
            '-vsync', 'vfr',
            '-r', '30',
            '-qscale:v', '2',
            '-an',
            '-y',
            '-f', 'image2',
            'pipe:',
        ])
        .on('error', function(err) {
            console.error('Error parsing frame:', err);
        })
        .on('end', function() {
            console.log('Finished parsing frame.');
        })
        .run();

    // Save the frame to a folder
    const outputDir = path.join(tempDir, 'frames');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    const framePath = path.join(outputDir, `${Date.now()}.png`);
    fs.writeFileSync(framePath, Buffer.from(res.body));

    res.sendStatus(200);
}

export default parseFrame;