import { pipeline } from '@xenova/transformers';

async function run() {
    let url = 'https://uploads-ssl.webflow.com/5a52d9bb35a80000013504f8/5b0f7bd3f058d7814b0b9bcf_how-to-choose-a-horse.jpg';
    let captioner = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
    let output = await captioner(url);

    console.log(output);
}

run();