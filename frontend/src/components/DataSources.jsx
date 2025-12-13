import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import '../App.css'; // Import shared styles

const DataSources = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'User' });
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null); 

  // Load User & Fetch Existing Files on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (token) {
      fetchFiles(token);
    }
  }, []);

  const fetchFiles = async (token) => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/datasources', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // --- FILE UPLOAD LOGIC ---

  const uploadFile = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    try {
        await axios.post('http://127.0.0.1:5000/upload', formData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
            }
        });
        alert("Upload Successful!");
        fetchFiles(token); // Refresh list
    } catch (error) {
        console.error("Upload failed", error);
        alert("Upload failed. Check console for details.");
    }
  };

  // Drag & Drop Handlers (Visual feedback logic preserved)
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = 'var(--success)';
    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = 'var(--border-light)';
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = 'var(--border-light)';
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
        uploadFile(droppedFiles[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const onFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
        uploadFile(e.target.files[0]);
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this file?")) return;
    const token = localStorage.getItem('token');
    try {
        await axios.delete(`http://127.0.0.1:5000/datasources/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setFiles(files.filter(f => f.id !== id));
    } catch (err) {
        alert("Delete failed");
    }
  };

  return (
    <div className="app-container">
      
      {/* 1. SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
          StreamForge
        </div>

        <nav className="sidebar-nav">
          <SidebarItem label="Overview" icon="🏠" onClick={() => navigate('/dashboard')} />
          <SidebarItem label="All Pipelines" icon="🚀" onClick={() => navigate('/pipelines')} />
          <SidebarItem label="Data Sources" icon="🗄️" active />
          <SidebarItem label="Processed Data" icon="📦" onClick={() => navigate('/processed')} />
          <SidebarItem label="Settings" icon="⚙️" />
        </nav>

        {/* Profile */}
        <div className="sidebar-profile">
            <div className="flex items-center gap-10" style={{ overflow: 'hidden' }}>
                <div className="profile-avatar">
                   👤
                </div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>{user.username}</p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '12px' }}>Free Plan</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="btn-sidebar-logout"
            >
                <span>🚪</span> Logout
            </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="main-content">
        <div className="content-wrapper">
          
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '10px', margin: 0 }}>Data Sources</h1>
            <p className="text-muted" style={{ margin: 0 }}>Manage your raw data files and database connections.</p>
          </div>

          {/* HIDDEN INPUT FOR CLICK UPLOADS */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileSelect} 
            style={{ display: 'none' }} 
          />

          {/* UPLOAD AREA */}
          <div 
            className="upload-area"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={handleClick}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>☁️</div>
            <h3 style={{ color: 'white', marginBottom: '10px', marginTop: 0 }}>Click or Drag file to upload</h3>
            <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>Supports CSV, JSON, Excel (Max 10MB)</p>
          </div>

          {/* FILES LIST */}
          <div className="card">
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Connected Sources</h3>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Date Added</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted" style={{ padding: '30px' }}>No files uploaded yet.</td></tr>
                ) : (
                    files.map(file => (
                    <tr key={file.id}>
                        <td style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '16px' }}>📄</span> {file.name}
                        </td>
                        <td className="text-muted">{file.type}</td>
                        <td className="text-muted">{file.size}</td>
                        <td className="text-muted">{file.date}</td>
                        <td style={{ textAlign: 'right' }}>
                        <button 
                            onClick={() => handleDelete(file.id)}
                            className="btn btn-ghost-danger" 
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                            Remove
                        </button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ label, icon, active, onClick }) => (
  <div className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>
    <span>{icon}</span>
    <span>{label}</span>
  </div>
);

export default DataSources;