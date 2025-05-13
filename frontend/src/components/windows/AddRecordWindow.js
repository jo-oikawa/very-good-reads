import React from 'react';
import Window from '../Window/Window';
import { WINDOW_TYPES } from '../../context/WindowContext';

const AddRecordWindow = ({ formData, setFormData, handleSubmit }) => {
  return (
    <Window id={WINDOW_TYPES.ADD_RECORD}>
      <div className="add-record-window">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Author:</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Format:</label>
            <input
              type="text"
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Notes:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label>Status:</label>
            <select
              value={formData.status || 'to-read'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="to-read">To-Read</option>
              <option value="reading">Reading</option>
              <option value="read">Read</option>
              <option value="did-not-finish">Did Not Finish</option>
            </select>
          </div>
          
          <button type="submit" className="win95-button">Add Record</button>
        </form>
      </div>
    </Window>
  );
};

export default AddRecordWindow;