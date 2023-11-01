import React, { useState, useRef, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import './videoDropBox.css';

function VideoUploadForm() {
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [s3Url, setS3Url] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [videoHash, setVideoHash] = useState(null);

  const videoFile = useRef(null);

  const SERVER = process.env.REACT_APP_SERVER_URL || localStorage.getItem('server');
  const UPLOAD_ENDPOINT = `${SERVER}/api/video/upload`;

  useEffect(() => {
    setShowPreview(false);
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


  const calculateHash = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const binary = event.target.result;
        const hash = CryptoJS.SHA256(binary).toString(CryptoJS.enc.Hex);
        resolve(hash);
        reader.removeEventListener('load', reader.onload);
      };
      reader.onerror = (error) => {
        reject(error);
        reader.removeEventListener('error', reader.onerror);
      };
      reader.readAsBinaryString(file);
    });
  };

  const uploadToS3 = () => {
    return new Promise((resolve, reject) => {
      const file = videoFile.current.files[0];
      const xhr = new XMLHttpRequest();

      xhr.open('PUT', s3Url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadMessage(`Uploading to S3: ${Math.floor(percentComplete)}% (${event.loaded} of ${event.total} bytes)`);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(true);
        } else {
          reject(new Error(`Error uploading: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error(`Error uploading: ${xhr.status} ${xhr.statusText}`));
      };

      xhr.setRequestHeader('Content-Type', 'video/mp4');
      xhr.send(file);
    });
  };


  const getVideoData = async () => {
    try {
      const result = await fetch(`${SERVER}/api/video/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_hash: videoHash }),
      });
  
      if (!result.ok) {
        throw new Error(`Error fetching video data: ${result.status} ${result.statusText}`);
      }
  
      const data = await result.json();
  
      if (data.jsonData) {
        console.log('Video data received:', data.jsonData);

      } else {
        console.log('Video data not available yet, retrying...');
        setTimeout(getVideoData, 3000);
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
      setTimeout(getVideoData, 3000);
    }
  };


  useEffect(() => {
    if (!s3Url) {
      return;
    }

    setUploadMessage('Preparing to upload...');
    uploadToS3()
      .then(() => {
          setUploadMessage('Video uploaded successfully');
          setShowPreview(true);
          getVideoData();
          setUploading(false);
      })
      .catch((error) => {
          setUploadMessage(error.message);
      });

  }, [s3Url]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const file = videoFile.current.files[0];
    if (!file) {
      setUploadMessage('Please select a video file.');
      return;
    }

    setUploadMessage('Checking if video already processed...');
    setUploading(true);

    try {
      const hash = await calculateHash(file);
      setVideoHash(hash);

      const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_hash: hash }),
      });

      if (!response.ok) {
        throw new Error(`Error uploading hash: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.s3Url) {
        setS3Url(data.s3Url);
        setUploadMessage('Video is not processed yet.');
      } else {
        setUploadMessage('Video is already processed.');
        setUploading(false);
      }
    } catch (error) {
      setUploadMessage(error.message);
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

      {videoPreviewUrl && showPreview && (
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
