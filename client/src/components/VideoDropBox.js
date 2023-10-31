import React, { useState, useRef, useEffect } from 'react';
import CryptoJS from 'crypto-js'; // Import the CryptoJS library
import './videoDropBox.css';

function VideoUploadForm() {
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

  const videoFile = useRef(null);

  const SERVER = localStorage.getItem('server');
  const UPLOAD_ENDPOINT = `${SERVER}/api/video/upload`; // Endpoint for hash upload

  useEffect(() => {
    setVideoData(null);
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const handleFileChange = () => {
    const file = videoFile.current.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const file = videoFile.current.files[0];
    if (!file) {
      setUploadMessage('Please select a video file.');
      return;
    }

    setUploadMessage('');
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const binary = event.target.result;
        const hash = CryptoJS.SHA256(binary).toString(CryptoJS.enc.Hex);

        const response = await fetch(UPLOAD_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ video_hash: hash }),
        });

        if (!response.ok) {
          throw new Error(`Error uploading hash: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setVideoData(data);

        setUploadMessage('Hash successfully uploaded and processed.')
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      setUploadMessage(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="video-drop-box">
        <form onSubmit={handleSubmit} className="upload-video" encType="multipart/form-data">
          <input
            type="file"
            name="video"
            accept="video/mp4"
            ref={videoFile}
            onChange={handleFileChange}
            disabled={uploading}
          />
          <input
            type="submit"
            value={uploading ? 'Processing...' : 'Upload'}
            disabled={uploading}
          />
          {uploadMessage && <p className="error-message">{uploadMessage}</p>}
        </form>
      </div>

      {videoPreviewUrl && videoData && (
        <div className='video-controls'>
          <div className="video-preview">
            <video controls src={videoPreviewUrl} />
          </div>
          <div className='search-in-video'>
            <input type="text" placeholder="Search in video" />
            <input type="submit" value="Search" />
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoUploadForm;
