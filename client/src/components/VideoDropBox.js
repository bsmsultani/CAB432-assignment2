import React, { useRef } from "react";
import './videoDropBox.css';

const VideoDropBox = () => {
  // Create a ref to store the file input element
  // a ref is a way to access a DOM element in React
  // the video file is stored in the ref

  const videoFile = useRef(null);
  const SERVER = localStorage.getItem('server');
  const UPLOAD_URL = `${SERVER}/api/video/upload`;

  // Function to handle form submission
  // NEED TO ADD ERROR HANDLING SUCH AS IF NO FILE IS SELECTED
  // IF THE SERVER IS DOWN, ETC.

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a FormData object to store the selected video file
    const formData = new FormData();
    formData.append('video', videoFile.current.files[0]);

    fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      alert(data);
    })
    .catch(err => {
      console.log(err);
      alert(`Error uploading video, ${err}`);
    });
  }

  return (
    <div className="video-drop-box">
      <form onSubmit={handleSubmit} className="upload-video">
        <input 
          type='file' 
          name='video' 
          accept="video/*" 
          ref={videoFile}
        />
        <input type="submit" value="Upload" />
      </form>
    </div>
  );
}

export default VideoDropBox;
