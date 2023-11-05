import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import './videoPreview.css';

const VideoPreview = ({ videoPreviewUrl, showPreview, videoData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const [searchResultsCount, setSearchResultsCount] = useState(0); // State to store the count of search results
  const [frequencyData, setFrequencyData] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    if (searchTerm) {
      const newFrequencyData = videoData.reduce((acc, data) => {
        const count = data.objects.reduce((count, obj) => 
          obj.name.toLowerCase().includes(searchTerm) ? count + 1 : count, 0);
        if (count > 0) {
          acc.push({ second: data.second, frequency: count });
        }
        return acc;
      }, []);
      setFrequencyData(newFrequencyData);
    } else {
      setFrequencyData([]);
    }
  }, [searchTerm, videoData]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setSearchIndex(0); // Reset search index on new search term
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    const results = videoData.filter((data) =>
      data.objects.some((obj) => obj.name.toLowerCase().includes(searchTerm))
    );
    setSearchResultsCount(results.length); // Update the count of search results

    if (results.length > 0) {
      const result = results[searchIndex % results.length];
      videoRef.current.currentTime = result.second;
      setCurrentTime(result.second);
      setSearchIndex((prevIndex) => prevIndex + 1);
    } else {
      alert('Object not found');
      setSearchIndex(0); // Reset search index if no results
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const handleChartClick = (state) => {
    if (state && state.activeLabel) {
      const clickedTime = state.activeLabel;
      videoRef.current.currentTime = clickedTime;
      setCurrentTime(clickedTime);
    }
  };

  return (
    showPreview && (
      <div className='video-preview-container'>
        <div className='video-controls'>
          <div className="video-preview">
            <video ref={videoRef} controls src={videoPreviewUrl} />
          </div>
          <div className='search-in-video'>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search for objects..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <input type="submit" value="Search" />
              {/* Display the number of search results */}
              {searchTerm && (
                <div className="search-results-count">
                  Results: {searchResultsCount}
                </div>
              )}
            </form>
          </div>
        </div>
        {searchTerm && (
          <div className="frequency-chart">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={frequencyData} onClick={handleChartClick}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="second" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="frequency" stroke="#8884d8" dot={false} />
                <ReferenceLine x={currentTime} stroke="red" label="Current second" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    )
  );
};

export default VideoPreview;
