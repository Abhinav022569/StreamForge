import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';

const DataSources = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: 'User' });
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null); // Reference to hidden input

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
                'Content-Type': 'multipart/form-data'
            }
        });
        alert("Upload Successful!");
        fetchFiles(token); // Refresh list
    } catch (error) {
        console.error("Upload failed", error);
        alert("Upload failed. Check console for details.");
    }
  };

  // 1. Handle Drag Over (Prevent default browser behavior)
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#10b981'; // Visual feedback
    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
  };

  // 2. Handle Drag Leave (Reset style)
  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#3f3f46';
    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
  };

  // 3. Handle Drop (Actually get the file)
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#3f3f46';
    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
        uploadFile(droppedFiles[0]); // Upload the first file dropped
    }
  };

  // 4. Handle Click (Trigger hidden input)
  const handleClick = () => {
    fileInputRef.current.click();
  };

  // 5. Handle File Selection from Dialog
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1115', display: 'flex' }}>
      
      {/* 1. SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: '#18181b', borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column', padding: '20px', flexShrink: 0 }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', marginBottom: '40px', paddingLeft: '10px' }}>
          <img src={logo} alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
          StreamForge
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
          <SidebarItem label="Overview" icon="🏠" onClick={() => navigate('/dashboard')} />
          <SidebarItem label="All Pipelines" icon="🚀" onClick={() => navigate('/pipelines')} />
          <SidebarItem label="Data Sources" icon="🗄️" active />
          <SidebarItem label="Settings" icon="⚙️" />
        </nav>

        {/* Profile */}
        <div style={{ borderTop: '1px solid #27272a', paddingTop: '20px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <div style={{ width: '32px', height: '32px', background: '#3f3f46', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>👤</div>
                <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }}>{user.username}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Free Plan</p>
                </div>
            </div>
            <button onClick={handleLogout} style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span>🚪</span> Logout
            </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        <div style={{ padding: '40px', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '10px', color: 'white' }}>Data Sources</h1>
            <p className="muted" style={{ margin: 0, color: '#9ca3af' }}>Manage your raw data files and database connections.</p>
          </div>

          {/* HIDDEN INPUT FOR CLICK UPLOADS */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileSelect} 
            style={{ display: 'none' }} 
          />

          {/* UPLOAD AREA (With Drag & Drop Events) */}
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={handleClick}
            style={{ 
                border: '2px dashed #3f3f46', 
                borderRadius: '12px', 
                padding: '40px', 
                textAlign: 'center', 
                marginBottom: '40px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>☁️</div>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>Click or Drag file to upload</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Supports CSV, JSON, Excel (Max 10MB)</p>
          </div>

          {/* FILES LIST */}
          <div className="card" style={{ padding: '0', overflow: 'hidden', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #27272a' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'white' }}>Connected Sources</h3>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #27272a', color: '#9ca3af', fontSize: '14px', backgroundColor: '#1f1f23' }}>
                  <th style={{ padding: '15px 20px', fontWeight: '500' }}>File Name</th>
                  <th style={{ padding: '15px 20px', fontWeight: '500' }}>Type</th>
                  <th style={{ padding: '15px 20px', fontWeight: '500' }}>Size</th>
                  <th style={{ padding: '15px 20px', fontWeight: '500' }}>Date Added</th>
                  <th style={{ padding: '15px 20px', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#666' }}>No files uploaded yet.</td></tr>
                ) : (
                    files.map(file => (
                    <tr key={file.id} style={{ borderBottom: '1px solid #27272a', color: 'white', fontSize: '14px' }}>
                        <td style={{ padding: '15px 20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '16px' }}>📄</span> {file.name}
                        </td>
                        <td style={{ padding: '15px 20px', color: '#9ca3af' }}>{file.type}</td>
                        <td style={{ padding: '15px 20px', color: '#9ca3af' }}>{file.size}</td>
                        <td style={{ padding: '15px 20px', color: '#9ca3af' }}>{file.date}</td>
                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                        <button 
                            onClick={() => handleDelete(file.id)}
                            className="btn btn-ghost" 
                            style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444', border: '1px solid #ef4444' }}
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
  <div 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      padding: '10px 15px', 
      borderRadius: '6px', 
      cursor: 'pointer',
      backgroundColor: active ? '#27272a' : 'transparent',
      color: active ? 'white' : '#9ca3af',
      transition: 'background 0.2s'
    }}
    onMouseOver={(e) => !active && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
    onMouseOut={(e) => !active && (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <span>{icon}</span>
    <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>
  </div>
);

export default DataSources;