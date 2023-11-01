import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

class GraphGenerator {
    constructor(jsonPath) {
        this.jsonPath = jsonPath;

    }


    async default_graphs (graphOutputDir) {
        
        await this.plotObjectsOverTime(path.join(graphOutputDir, 'objects_over_time.html'));
        await this.plotObjectFrequencies(0, 10, path.join(graphOutputDir, 'object_frequencies.html'));
        
        // get 3 most common objects names
        const frames = JSON.parse(fs.readFileSync(this.jsonPath));
        const objects = {};
        frames.forEach((frame) => {
            frame.objects.forEach((object) => {
                if (!objects[object.name]) objects[object.name] = 1;
                else objects[object.name]++;
            });
        });

        const sortedObjects = Object.keys(objects).sort((a, b) => objects[b] - objects[a]);

        await this.plotCompareObjectsOverTime(sortedObjects.slice(0, 3), path.join(graphOutputDir, 'compare_objects_over_time.html'));

    }


    async plotObjectsOverTime(graphOutputFile) {
        return new Promise((resolve, reject) => {
            console.log('Generating graph...');
            let frames;

            try {
                frames = JSON.parse(fs.readFileSync(this.jsonPath));
                if (!frames) throw new Error('No json data for frames found.');
            } catch (error) {
                return reject(new Error(`Error reading json files for frames: ${error.message}`));
            }

            const lastFrame = frames[frames.length - 1];
            const firstSecond = frames[0].second;
            const lastSecond = lastFrame.second;
            const interval = Math.round((lastSecond - firstSecond) / 20);

            const args = [
                "--filepath", this.jsonPath,
                "--function", "plot_top_objects",
                "--interval", interval.toString(),
                "--output_file", graphOutputFile,
            ];

            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const scriptPath = path.join(__dirname, 'plot.py');
            const process = spawn('python3', [scriptPath, ...args]);

            process.on('exit', (code) => {
                if (code === 0) {
                    const file = fs.readFileSync(graphOutputFile);
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

    async plotCompareObjectsOverTime(selectedObjects, graphOutputFile) {
        return new Promise((resolve, reject) => {
            console.log('Generating comparison graph...');
    
            const args = [
                "--filepath", this.jsonPath,
                "--function", "compare_object_over_time",
                "--selected_objects", ...selectedObjects,
                "--output_file", graphOutputFile,
            ];
    
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const scriptPath = path.join(__dirname, 'plot.py');
            const process = spawn('python3', [scriptPath, ...args]);
    
            process.on('exit', (code) => {
                if (code === 0) {
                    const file = fs.readFileSync(graphOutputFile);
                    resolve(file);
                } else {
                    reject(new Error('Error generating comparison graph.'));
                }
            });
    
            process.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        });
    }
    
    async plotObjectFrequencies(start, end, graphOutputFile) {
        return new Promise((resolve, reject) => {
            console.log('Generating frequency graph...');
    
            const args = [
                "--filepath", this.jsonPath,
                "--function", "plot_object_frequencies",
                "--start", start.toString(),
                "--end", end.toString(),
                "--output_file", graphOutputFile,
            ];
    
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const scriptPath = path.join(__dirname, 'plot.py');
            const process = spawn('python3', [scriptPath, ...args]);
    
            process.on('exit', (code) => {
                if (code === 0) {
                    const file = fs.readFileSync(graphOutputFile);
                    resolve(file);
                } else {
                    reject(new Error('Error generating frequency graph.'));
                }
            });
    
            process.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
        });
    }
}

export default GraphGenerator;
