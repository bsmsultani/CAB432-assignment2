import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';

const command = ffmpeg();
const apiKey = 'AIzaSyDIvVTx_Jrbf3utLtqiXt0zjZf_54ik1sU'; // Replace with your actual API key

/**
 * Detects objects in an image using the Google Cloud Vision API.
 * @async
 * @function detectObjectsInImage
 * @param {string} framePath - The path to the image file to analyze.
 * @returns {Promise<Object[]>} - A promise that resolves with an array of objects detected in the image.
 */

async function detectObjectsInImage(framePath) {
    const content = fs.readFileSync(framePath);
    try {
        const response = await axios.post(
            'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey,
            {
                requests: [
                    {
                        image: {
                            content: content.toString('base64'),
                        },
                        features: [
                            {
                                type: 'OBJECT_LOCALIZATION',
                            },
                        ],
                    },
                ],
            }
        );

        const objects = response.data.responses[0].localizedObjectAnnotations;
        return objects;

    } catch (error) {
        console.error('Error detecting objects in the image:', error);
    }
}


export default detectObjectsInImage;