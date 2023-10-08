import express from 'express';
import cors from 'cors';

app.use(cors());

const app = express();
const port = process.env.PORT || 3001;

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle the video upload route
app.post('/api/video/upload', (req, res) => {
    console.log('uploading video');

  // Check if there's a video file in the request body
  if (!req.body.video) {
    return res.status(400).json({ error: 'No video data provided.' });
  }

  // Access the video data from the request body
  const videoData = req.body.video;

  console.log(videoData);

  // Now you can process the videoData as needed, e.g., you can save it to a database or perform other operations.

  // Send a response indicating success
  res.status(200).json({ message: 'Video data received and processed successfully.' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
