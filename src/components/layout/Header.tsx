import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useRaidTracker } from '../../contexts/RaidTrackerContext';
import { useUser } from '../../contexts/UserContext';
import { formatTime } from '../../utils/timeUtils';
import Login from '../auth/Login';

const HeaderContainer = styled.header`
  background-color: var(--surface);
  padding: 16px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 24px;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  color: ${props => props.$active ? 'var(--primary)' : 'var(--text-primary)'};
  font-weight: ${props => props.$active ? '500' : '400'};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: ${props => props.$active ? '100%' : '0'};
    height: 2px;
    background-color: var(--primary);
    transition: width 0.3s;
  }
  
  &:hover:after {
    width: 100%;
  }
`;

const ActiveRunInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: rgba(192, 44, 56, 0.1);
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid var(--primary);
`;

const RunTimer = styled.div`
  font-family: monospace;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--primary);
`;

const RunStatus = styled.div<{ $status: 'in-progress' | 'paused' }>`
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: ${props => props.$status === 'in-progress' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.2)'};
  color: ${props => props.$status === 'in-progress' ? '#4caf50' : '#ffc107'};
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-size: 0.9rem;
`;

const UserName = styled.span`
  color: var(--primary);
  font-weight: 500;
`;

const AuthButton = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #45a049;
  }
`;

const LogoutButton = styled.button`
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--text-secondary);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--text-secondary);
    color: var(--background);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #ccc;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1001;
  
  &:hover {
    color: #fff;
  }
`;

const Header: React.FC = () => {
  const location = useLocation();
  const { currentRun, currentWing, isRunning, isPaused, elapsedTime } = useRaidTracker();
  const { user, signOut, isLoggedIn } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const handleSignOut = () => {
    signOut();
  };
  
  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <Logo>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
            </svg>
            <span>GW2 Raid Tracker</span>
          </Logo>
          
          {(isRunning || isPaused) && currentRun && currentWing && (
            <ActiveRunInfo>
              <div>
                <div>{currentWing.name}</div>
                <RunTimer>{formatTime(elapsedTime)}</RunTimer>
              </div>
              <RunStatus $status={isRunning ? 'in-progress' : 'paused'}>
                {isRunning ? 'Running' : 'Paused'}
              </RunStatus>
            </ActiveRunInfo>
          )}
          
          <Nav>
            <NavLink to="/" $active={location.pathname === '/'}>
              Dashboard
            </NavLink>
            <NavLink to="/tracker" $active={location.pathname === '/tracker'}>
              Tracker
            </NavLink>
            <NavLink to="/history" $active={location.pathname === '/history'}>
              History
            </NavLink>
            <NavLink to="/analytics" $active={location.pathname === '/analytics'}>
              Analytics
            </NavLink>
            <NavLink to="/settings" $active={location.pathname === '/settings'}>
              Settings
            </NavLink>
          </Nav>
          
          <AuthSection>
            {isLoggedIn && user ? (
              <UserInfo>
                <span>Welcome, <UserName>{user.username}</UserName></span>
                <LogoutButton onClick={handleSignOut}>Sign Out</LogoutButton>
              </UserInfo>
            ) : (
              <AuthButton onClick={() => setShowLoginModal(true)}>
                Sign In
              </AuthButton>
            )}
          </AuthSection>
        </HeaderContent>
      </HeaderContainer>
      
      {showLoginModal && (
        <Modal onClick={() => setShowLoginModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowLoginModal(false)}>×</CloseButton>
            <Login onClose={() => setShowLoginModal(false)} />
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default Header;