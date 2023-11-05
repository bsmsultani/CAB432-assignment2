import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import './commonObjectsChart.css';

const CommonObjectsChart = ({ videoData }) => {
  const [topNCount, setTopNCount] = useState(10);

  const objectCounts = videoData.reduce((acc, data) => {
    data.objects.forEach((obj) => {
      if (acc[obj.name]) {
        acc[obj.name] += 1;
      } else {
        acc[obj.name] = 1;
      }
    });
    return acc;
  }, {});

  const chartData = Object.entries(objectCounts).map(([name, count]) => ({
    name,
    count
  }));

  chartData.sort((a, b) => b.count - a.count);

  const topN = chartData.slice(0, topNCount);

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setTopNCount(Number.isNaN(value) ? 0 : Math.max(1, value));
  };

  return (
    <div className="common-objects-chart-container">
      <label htmlFor="topNInput">Show Top N Objects: </label>
      <input
        id="topNInput"
        type="number"
        value={topNCount}
        onChange={handleInputChange}
        min="1"
        style={{ marginBottom: '10px' }}
      />
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          width={500}
          height={300}
          data={topN}
          margin={{
            top: 20, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommonObjectsChart;
