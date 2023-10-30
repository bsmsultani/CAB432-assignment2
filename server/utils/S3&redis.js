//npm install bull
//https://github.com/OptimalBits/bull

const Queue = require('bull');

const videoProcessingQueue = new Queue('video-processing');

videoProcessingQueue.add({
  videoId: 'your-video-id',
  // any other relevant data
});

videoProcessingQueue.process(async job => {
  // Here, job.data contains the video details you added earlier
  const { videoId } = job.data;
  
  // Do your video processing here...
  // ...

  return Promise.resolve({ result: 'video processed' });
});

videoProcessingQueue.on('completed', (job, result) => {
  console.log(`Job completed with result ${result}`);
});

videoProcessingQueue.on('failed', (job, err) => {
  console.log(`Job failed with error ${err}`);
});

process.on('exit', () => {
  videoProcessingQueue.close();
});

  
