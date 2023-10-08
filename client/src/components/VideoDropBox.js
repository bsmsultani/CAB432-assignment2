import React, { useRef, useState } from "react";
import './videoDropBox.css';

const VideoDropBox = () => {
  const videoFile = useRef(null);
  const SERVER = localStorage.getItem('server');
  const UPLOAD_URL = `${SERVER}/api/video/upload`;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile.current.files[0]) {
      alert("Please select a video file.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('video', videoFile.current.files[0]);

      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
      } else {
        const errorData = await response.json();
        setUploadError(errorData.error || "Unknown error occurred.");
      }
    } catch (err) {
      console.error(err);
      setUploadError(`Error uploading video: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="video-drop-box">
      <form onSubmit={handleSubmit} className="upload-video">
        <input 
          type='file' 
          name='video' 
          accept="video/*" 
          ref={videoFile}
        />
        <input type="submit" value="Upload" disabled={uploading} />
        {uploadError && <p className="error-message">{uploadError}</p>}
      </form>
    </div>
  );
};

export default VideoDropBox;
