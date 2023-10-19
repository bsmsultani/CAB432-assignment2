import React, { useState, useRef, useEffect } from 'react';
import './videoDropBox.css';

function VideoUploadForm() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [videoId, setVideoId] = useState(null);

  const videoFile = useRef(null);

  const SERVER = localStorage.getItem('server');
  const UPLOAD_ENDPOINT = `${SERVER}/api/video/upload`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if a file has been selected
    if (!videoFile.current.files[0]) {
      setUploadError('Please select a video file.');
      return;
    }
    
    // Clear any previous error messages
    setUploadError('');

    // Implement your file upload logic here
    // Set uploading to true while the upload is in progress
    setUploading(true);

    try {
      // Make an API request to upload the selected video file
      const formData = new FormData();
      formData.append('video', videoFile.current.files[0]);

      // Replace the following with your actual API endpoint
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error uploading video: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      setVideoId(data.videoId);

      // CHANGE THIS LATERRR TO INCLUDE FRAME RATE

      const res = await fetch(`${SERVER}/api/parseframe/${data.videoId}`)

      if (!res.ok) {
        throw new Error(`Parsing error: ${res.status} ${res.statusText}`);
      }

      alert('asked for frame parsing')

      // Handle successful upload
    } catch (error) {
      console.log(error);
      setUploadError(error.message);
    } finally {
      // Reset the uploading state
      setUploading(false);
    }
  };



  return (
    <div className="video-drop-box">
      <form onSubmit={handleSubmit} className="upload-video" encType="multipart/form-data">
        <input
          type="file"
          name="video"
          accept="video/*"
          ref={videoFile}
          disabled={uploading}
        />
        <input
          type="submit"
          value={uploading ? 'Processing...' : 'Upload'}
          disabled={uploading}
        />
        {uploadError && <p className="error-message">{uploadError}</p>}
      </form>
    </div>
  );
}

export default VideoUploadForm;
