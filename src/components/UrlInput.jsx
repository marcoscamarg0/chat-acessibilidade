import React, { useState } from 'react';

function UrlInput({ onSubmit, disabled }) {
  const [url, setUrl] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() !== '') {
      onSubmit(url);
      setUrl('');
    }
  };
  
  return (
    <div className="url-input-container">
      <h4>Analisar URL</h4>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://exemplo.com.br"
          required
          disabled={disabled}
        />
        <button type="submit" disabled={url.trim() === '' || disabled}>
          Analisar
        </button>
      </form>
    </div>
  );
}

export default UrlInput;
