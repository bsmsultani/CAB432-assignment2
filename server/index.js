import express from 'express';
import cors from 'cors';
import redis from 'redis';
import upload from './middleware/upload.js';
import videoData from './middleware/videoData.js';
import AWS from 'aws-sdk';


const app = express();
const port = 3001;


const redisClient = redis.createClient({
  url: 'redis://cab432group109.km2jzi.ng.0001.apse2.cache.amazonaws.com:6379',
});

redisClient.connect()
  .then(() => console.log("Connected to Redis"))
  .catch(console.error);


AWS.config.update({
  region: 'ap-southeast-2',
});


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  req.redisClient = redisClient;
  req.AWS = AWS;
  next();
});

app.get('/', (req, res) => {
  res.status(200).send('Hello, world!');
});


app.post('/api/video/upload', upload);


app.post('/api/video/data', videoData);


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
