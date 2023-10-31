import express from 'express';
import cors from 'cors';
import videoUpload from './middleware/videoUpload.js';
import redis from 'redis'; // Import the redis module
import upload from './middleware/upload.js';
import AWS from 'aws-sdk';

const app = express();
const port = process.env.PORT || 3001;

// Connect to EC2 to get this working (cab432group109 is the cluster name)

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

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Proper middleware function
app.use((req, res, next) => {
  req.redisClient = redisClient;
  req.AWS = AWS;
  next();
});

app.post('/api/video/upload', upload);


app.post("/api/video/upload", videoUpload);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
