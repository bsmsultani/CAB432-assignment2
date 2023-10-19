import express from 'express';
import cors from 'cors';
import videoUpload from './middleware/videoUpload.js';


const app = express();
const port = process.env.PORT || 3001;


app.use(cors());
// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post("/api/video/upload", videoUpload);


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
