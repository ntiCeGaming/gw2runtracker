import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 0 20px;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 700;
  margin: 0;
  color: var(--primary);
  text-shadow: 0 0 10px rgba(200, 0, 0, 0.3);
  
  @media (max-width: 576px) {
    font-size: 6rem;
  }
`;

const ErrorTitle = styled.h2`
  font-size: 2rem;
  margin: 0 0 24px 0;
  color: var(--text-primary);
`;

const ErrorMessage = styled.p`
  font-size: 1.2rem;
  margin-bottom: 32px;
  color: var(--text-secondary);
  max-width: 600px;
`;

const HomeButton = styled(Link)`
  display: inline-block;
  background-color: var(--primary);
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #a02530;
  }
`;

const NotFound: React.FC = () => {
  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <ErrorTitle>Page Not Found</ErrorTitle>
      <ErrorMessage>
        The page you're looking for doesn't exist or has been moved. 
        Perhaps you were looking for a different raid wing?
      </ErrorMessage>
      <HomeButton to="/">Return to Dashboard</HomeButton>
    </NotFoundContainer>
  );
};

export default NotFound;