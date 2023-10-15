import express from 'express';
import cors from 'cors';
import videoUpload from './middleware/videoUpload.js';
import parseFrame from './middleware/parseFrame.js';


const app = express();
const port = process.env.PORT || 3001;


app.use(cors());
// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// This endpoint is used by the frontend to upload a video
// The video is sent as a form-data request body
// You can access the video using req.file
// The video is stored in memory and is not written to disk

app.post("/api/video/upload", videoUpload);

app.get("/api/parseframe/:videoId", parseFrame)


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
