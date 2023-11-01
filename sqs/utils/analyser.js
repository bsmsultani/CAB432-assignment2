import os from 'os';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import { spawn } from 'child_process';

// Assuming apiKey and other dependencies are defined elsewhere

const apiKey = "AIzaSyDIvVTx_Jrbf3utLtqiXt0zjZf_54ik1sU";

class Analyser {
    constructor(s3) {
        if (!s3) { throw new Error("s3Utils is required"); }
        this.s3 = s3;
    }

    async analyseVideo(videoKey) {
        const file = await this.s3.getObject(videoKey);
        const videoBuffer = file.Body;

        const videoHash = videoKey;
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
        
        // Further processing can be done here...
        const graphOutputDir = path.join(tempPathSave, 'graphs'); // Added 'const' here
        fs.mkdirSync(graphOutputDir, { recursive: true });

        await this.plot_objects_overtime(jsonPath, graphOutputDir);

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

    plot_objects_overtime(jsonPath, graphOutputDir) {
        return new Promise((resolve, reject) => {
            console.log('Generating graph...');
            let frames;

            try {
                frames = JSON.parse(fs.readFileSync(jsonPath));
                if (!frames) throw new Error('No json data for frames found.');
            } catch (error) {
                return reject(new Error('Error reading json files for frames: ' + error.message));
            }

            const lastFrame = frames[frames.length - 1];
            const firstSecond = frames[0].second;
            const lastSecond = lastFrame.second;
            const interval = parseInt((lastSecond - firstSecond) / 20);

            const args = [
                "--filepath", jsonPath,
                "--output", graphOutputDir,
                "--function", "plot_top_objects",
                "--interval", interval.toString(),
                "--output_dir", graphOutputDir,
            ];

            const scriptPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'plot.py');
            const process = spawn('python3', [scriptPath, ...args]);

            process.on('exit', (code) => {
                if (code === 0) {
                    const fileName = "top_objects.html";
                    const filePath = path.join(graphOutputDir, fileName);
                    const file = fs.readFileSync(filePath);
                    resolve(file);
                } else {
                    reject(new Error('Error generating graph.'));
                }
            });

            process.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        });
    }

}

export default Analyser;
