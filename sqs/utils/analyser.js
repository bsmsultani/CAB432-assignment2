import os from 'os';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';

const apiKey = "AIzaSyDIvVTx_Jrbf3utLtqiXt0zjZf_54ik1sU";

class Analyser {
    constructor(s3) {
        if (!s3) { throw new Error("s3Utils is required"); }
        this.s3 = s3;
    }

    async analyseVideo(videoKey) {
        const file = await this.s3.getObject(videoKey);
        const videoBuffer = file.Body;

        const videoHash = videoKey.split('/')[0];
        const tempPathSave = path.join(os.tmpdir(), videoHash);

        // Create directories for saving the video and extracted frames
        fs.mkdirSync(tempPathSave, { recursive: true });
        const framesDir = path.join(tempPathSave, 'frames');
        fs.mkdirSync(framesDir, { recursive: true });

        console.log('Saving video to:', tempPathSave);

        // Save the video to a temporary file
        const fileExtension = path.extname(videoKey);
        const filePath = path.join(tempPathSave, `${videoHash}${fileExtension}`);
        await fs.promises.writeFile(filePath, videoBuffer);

        // Extract frames from the video
        await this.__parseFrame(filePath, framesDir);

        // Analyze frames
        const frames = await this.__analyseFrames(framesDir);

        // Save frames analysis results
        const jsonPath = path.join(tempPathSave, 'frames.json');
        fs.writeFileSync(jsonPath, JSON.stringify(frames, null, 4));

        // Upload the results to S3

        console.log("Uploading frames.json to S3");
        await this.s3.putObject(`${videoHash}/frames.json`, jsonPath);

        fs.rmdirSync(tempPathSave, { recursive: true });
        

    }

    async __parseFrame(filePath, framesDir) {
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(filePath)
                .on('end', () => {
                    console.log('Finished extracting frames.');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Error:', err);
                    reject(err);
                })
                .output(path.join(framesDir, '%04d.jpeg'))
                .outputOptions(['-vf', 'fps=1,scale=720:-1', '-threads', '4', '-preset', 'ultrafast'])
                .run();
        });
    }

    async __analyseFrames(framesDir) {
        const frames = fs.readdirSync(framesDir);
        const objects = [];
        await Promise.all(
            frames.map(async (frame) => {
                const framePath = path.join(framesDir, frame);
                const frameObjects = await this.__annotateFrame(framePath);
                if (!frameObjects) return;

                const frameSec = parseInt(frame.split('.')[0]);
                objects.push({ second: frameSec, objects: frameObjects });
            })
        );
        objects.sort((a, b) => a.second - b.second);
        return objects;
    }

    async __annotateFrame(framePath) {
        const content = fs.readFileSync(framePath);
        try {
            const response = await axios.post(
                `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
                {
                    requests: [
                        {
                            image: {
                                content: content.toString('base64'),
                            },
                            features: [{ type: 'OBJECT_LOCALIZATION' }],
                        },
                    ],
                }
            );
            return response.data.responses[0].localizedObjectAnnotations;
        } catch (error) {
            console.error('Error detecting objects in the image:', error);
            return null;
        }
    }

}

export default Analyser;
