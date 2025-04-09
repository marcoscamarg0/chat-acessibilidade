import React, { useRef } from 'react';

function FileUpload({ onUpload, disabled }) {
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/html') {
      onUpload(file);
    } else {
      alert('Por favor, selecione um arquivo HTML válido.');
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="file-upload-container">
      <h4>Fazer Upload de HTML</h4>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".html"
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <button 
        onClick={triggerFileInput}
        className="file-upload-button"
        disabled={disabled}
      >
        Selecionar Arquivo HTML
      </button>
    </div>
  );
}

export default FileUpload;