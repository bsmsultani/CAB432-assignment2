import { pipeline } from '@xenova/transformers';
import express from 'express';

const app = express();
 

app.get('/', (req, res) => {
    res.send('Hello World!')
})



async function run() {
    let url = 'https://uploads-ssl.webflow.com/5a52d9bb35a80000013504f8/5b0f7bd3f058d7814b0b9bcf_how-to-choose-a-horse.jpg';
    let captioner = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
    let output = await captioner(url);

    console.log(output);
}

run();


app.listen(3000, () => console.log('Server ready, visit http://localhost:3000'))
