import express from 'express';
import cors from 'cors';
import multer from 'multer';


const app = express();
const port = process.env.PORT || 3001;

const upload = multer();


app.use(cors());
// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/video/upload", upload.single("video"), (req, res) => {
  try {
    // Access the uploaded video file using req.file.buffer
    if (!req.file) {
      return res.status(400).json({ error: "No video file provided" });
    }

    console.log(req.file);

    // You can now process the video in-memory or perform other operations.
    // For example, you can analyze the video using a library like ffmpeg.

    // Send a success response
    res.status(200).json({ message: "Video uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error uploading video" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
