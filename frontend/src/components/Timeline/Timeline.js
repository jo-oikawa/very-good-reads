import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Timeline.css';

const Timeline = () => {
  const [readingData, setReadingData] = useState([]);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadingData();
  }, [timeRange]);

  const fetchReadingData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reading-records');
      const data = await response.json();
      
      // Process the data based on the selected time range
      const processedData = processReadingData(data, timeRange);
      setReadingData(processedData);
    } catch (error) {
      console.error('Error fetching reading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processReadingData = (data, range) => {
    // Group reading records by date based on the selected time range
    const groupedData = {};
    
    data.forEach(record => {
      const date = new Date(record.createdAt);
      let key;
      let formatOptions;
      
      switch (range) {
        case 'week':
          key = date.toLocaleDateString('en-US', { weekday: 'short' });
          formatOptions = { weekday: 'short' };
          break;
        case 'month':
          key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          formatOptions = { month: 'short', day: 'numeric' };
          break;
        case 'year':
          key = date.toLocaleDateString('en-US', { month: 'short' });
          formatOptions = { month: 'short' };
          break;
        default:
          key = date.toLocaleDateString();
          formatOptions = {};
      }
      
      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          booksRead: 0,
          pagesRead: 0,
          timeSpent: 0,
          readingSpeed: 0
        };
      }
      
      groupedData[key].booksRead += 1;
      
      // Calculate pages read and time spent
      if (record.pages) {
        groupedData[key].pagesRead += record.pages;
      }
      if (record.timeSpent) {
        groupedData[key].timeSpent += record.timeSpent;
      }
      
      // Calculate reading speed (pages per minute)
      if (record.pages && record.timeSpent) {
        groupedData[key].readingSpeed += (record.pages / record.timeSpent) * 60; // Convert to pages per minute
      }
    });
    
    // Calculate average reading speed for each day
    Object.values(groupedData).forEach(day => {
      if (day.readingSpeed > 0) {
        day.readingSpeed = Math.round(day.readingSpeed / day.booksRead);
      }
    });
    
    return Object.values(groupedData).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
  };

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>Reading Activity Timeline</h2>
        <div className="time-range-selector">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading reading activity...</p>
        </div>
      ) : readingData.length > 0 ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={readingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                formatter={(value, name) => {
                  if (name === 'booksRead') return [value, 'Books'];
                  if (name === 'pagesRead') return [value, 'Pages'];
                  if (name === 'readingSpeed') return [value, 'Pages/min'];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line 
                type="monotone" 
                dataKey="booksRead" 
                name="Books Read" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="pagesRead" 
                name="Pages Read" 
                stroke="#82ca9d" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="readingSpeed" 
                name="Reading Speed" 
                stroke="#ffc658" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="no-data-state">
          <p>No reading activity data available</p>
        </div>
      )}
    </div>
  );
};

export default Timeline; 