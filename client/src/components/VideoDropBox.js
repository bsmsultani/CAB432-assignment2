import React, { useState, useRef } from 'react';
import './videoDropBox.css';

const VideoDropBox = () => {
  const [dragging, setDragging] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const videoRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    // Handle the dropped video here
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const videoFile = droppedFiles[0];

      // Display the video preview
      const videoObjectURL = URL.createObjectURL(videoFile);
      setVideoURL(videoObjectURL);

      // Update the video element source
      if (videoRef.current) {
        videoRef.current.src = videoObjectURL;
      }
    }
  };

  const handleFileInputChange = (e) => {
    // Handle the selected file when the user chooses a file using the "Browse" button
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Display the video preview
      const videoObjectURL = URL.createObjectURL(selectedFile);
      setVideoURL(videoObjectURL);

      // Update the video element source
      if (videoRef.current) {
        videoRef.current.src = videoObjectURL;
      }
    }
  };

  const handleUploadClick = () => {
    // Handle the upload logic here
    if (videoURL) {
      // You can send the video file to your server for further processing
      // Example: fetch('/uploadVideo', { method: 'POST', body: videoFile });

      // Reset the component after upload (clear the video preview)
      setVideoURL(null);
      if (videoRef.current) {
        videoRef.current.src = '';
      }
    }
  };

  return (
    <div>
      <div
        className={`video-drop-box ${dragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {videoURL ? (
          <video ref={videoRef} controls width="100%">
            <source src={videoURL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>{dragging ? 'Drop the video here' : 'Drag and drop a video here'}</p>
        )}

        <br />

        {videoURL ? (
          <div>
            <label htmlFor="fileInput" className="browse-button">
              Browse File
            </label>
            <button onClick={handleUploadClick} className="upload-button">
              Upload
            </button>
          </div>
        ) : (
          <label htmlFor="fileInput" className="browse-button">
            Browse File
          </label>
        )}
      </div>

      <input
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
        id="fileInput"
      />
    </div>
  );
};

export default VideoDropBox;
