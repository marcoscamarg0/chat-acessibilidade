// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import './index.css'; // Estilo base
import './App.css'; // Estilos específicos da aplicação
import App from './App.jsx';

// Adiciona atributos de acessibilidade ao elemento HTML
document.documentElement.lang = 'pt-BR';
document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light');

// Criar elemento root
const rootElement = document.getElementById('root');
if (!rootElement) {
  const rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
}

// Renderizar a aplicação
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);

// Detector de foco para acessibilidade
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('user-is-tabbing');
});