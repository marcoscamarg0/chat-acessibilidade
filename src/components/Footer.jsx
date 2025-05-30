import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  FaHeart, 
  FaLinkedin, 
  FaGithub, 
  FaUniversity, 
  FaFlask,
  FaExternalLinkAlt,
  FaUserGraduate,
  FaChalkboardTeacher
} from 'react-icons/fa';
import './styles/Footer.css';

const Footer = () => {
  const { darkMode } = useTheme();

  return (
    <footer className={`app-footer ${darkMode ? 'dark' : ''}`}>
      <div className="footer-content">
        {/* Seção principal de desenvolvimento */}
        <div className="footer-section development">
          <div className="love-message">
            <FaHeart className="heart-icon" aria-hidden="true" />
            <span>Desenvolvido com amor por</span>
          </div>
          
          <div className="developers">
            {/* Marcos Camargo */}
            <div className="developer">
              <div className="developer-info">
                <FaUserGraduate className="developer-icon" aria-hidden="true" />
                <div className="developer-details">
                  <h3 className="developer-name">Marcos Camargo</h3>
                  <span className="developer-role">Desenvolvedor</span>
                </div>
              </div>
              <div className="social-links">
                <a 
                  href="https://linkedin.com/in/marcoscamarg0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link linkedin"
                  aria-label="LinkedIn do Marcos Camargo"
                  title="LinkedIn do Marcos Camargo"
                >
                  <FaLinkedin size={18} />
                </a>
                <a 
                  href="https://github.com/marcoscamarg0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link github"
                  aria-label="GitHub do Marcos Camargo"
                  title="GitHub do Marcos Camargo"
                >
                  <FaGithub size={18} />
                </a>
              </div>
            </div>

            {/* Orientação */}
            <div className="orientation">
              <span className="orientation-text">orientado pela</span>
            </div>

            {/* Sylvana Karla */}
            <div className="developer advisor">
              <div className="developer-info">
                <FaChalkboardTeacher className="developer-icon" aria-hidden="true" />
                <div className="developer-details">
                  <h3 className="developer-name">Sylvana Karla</h3>
                  <span className="developer-role">Orientadora</span>
                </div>
              </div>
              <div className="social-links">
                <a 
                  href="https://www.linkedin.com/in/sylvanasantos/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link linkedin"
                  aria-label="LinkedIn da Sylvana Karla"
                  title="LinkedIn da Sylvana Karla"
                >
                  <FaLinkedin size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de instituições */}
        <div className="footer-section institutions">
          {/* Instituto Federal de Brasília */}
          <div className="institution">
            <div className="institution-info">
              <FaUniversity className="institution-icon" aria-hidden="true" />
              <div className="institution-details">
                <h4 className="institution-name">Instituto Federal de Brasília</h4>
                <span className="institution-role">Instituição de Ensino</span>
              </div>
            </div>
            <a 
              href="https://www.ifb.edu.br/brasilia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="institution-link"
              aria-label="Site do Instituto Federal de Brasília"
              title="Visitar site do IFB"
            >
              <FaExternalLinkAlt size={14} />
            </a>
          </div>

          {/* CNPq */}
          <div className="institution">
            <div className="institution-info">
              <FaFlask className="institution-icon" aria-hidden="true" />
              <div className="institution-details">
                <h4 className="institution-name">CNPq</h4>
                <span className="institution-role">Financiamento</span>
              </div>
            </div>
            <a 
              href="https://www.gov.br/cnpq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="institution-link"
              aria-label="Site do CNPq"
              title="Visitar site do CNPq"
            >
              <FaExternalLinkAlt size={14} />
            </a>
          </div>
        </div>

        {/* Seção de informações do projeto */}
        <div className="footer-section project-info">
          <div className="project-description">
            <h4>Chat Acessibilidade</h4>
            <p>
              Projeto desenvolvido com foco em acessibilidade digital, 
              oferecendo análise automatizada de sites e assistência 
              sobre diretrizes WCAG.
            </p>
          </div>
          
          <div className="project-links">
            <a 
              href="https://github.com/marcoscamarg0/chat-acessibilidade" 
              target="_blank" 
              rel="noopener noreferrer"
              className="project-link"
              aria-label="Código fonte do projeto no GitHub"
            >
              <FaGithub size={16} />
              <span>Código Fonte</span>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <div className="copyright">
          <span>© {new Date().getFullYear()} Chat Acessibilidade. </span>
          <span>Todos os direitos reservados.</span>
        </div>
        <div className="tech-info">
          <span>Desenvolvido com React, Vite e Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;