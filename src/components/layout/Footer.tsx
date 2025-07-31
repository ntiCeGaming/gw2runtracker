import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: var(--surface);
  padding: 24px 0;
  margin-top: 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  text-align: center;
  gap: 16px;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  
  a {
    color: var(--text-secondary);
    transition: color 0.3s;
    
    &:hover {
      color: var(--primary);
    }
  }
`;

const Copyright = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const SnowCrowsLogo = styled.div`
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 8px;
  font-size: 1.2rem;
`;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <SnowCrowsLogo>Snow Crows</SnowCrowsLogo>
        <FooterLinks>
          <a href="https://snowcrows.com/" target="_blank" rel="noopener noreferrer">
            Snow Crows Website
          </a>
          <a href="https://wiki.guildwars2.com/wiki/Raid" target="_blank" rel="noopener noreferrer">
            GW2 Raid Wiki
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </FooterLinks>
        <Copyright>
          &copy; {currentYear} GW2 Raid Tracker. Not affiliated with ArenaNet or Guild Wars 2.
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;