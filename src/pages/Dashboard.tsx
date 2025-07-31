import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useRaidTracker } from '../contexts/RaidTrackerContext';
import { raidRunService, analyticsService } from '../database/dbService';
import { RaidRun } from '../database/db';
import { formatDate, formatTime } from '../utils/timeUtils';

const DashboardContainer = styled.div`
  padding: 24px 0;
`;

const DashboardHeader = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 24px;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionCard = styled(Link)`
  flex: 1;
  background-color: var(--surface);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  color: var(--text-primary);
  text-decoration: none;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    width: 48px;
    height: 48px;
    color: var(--primary);
  }
  
  h3 {
    margin: 0;
    font-size: 1.3rem;
  }
  
  p {
    color: var(--text-secondary);
    margin: 0;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const RecentRuns = styled.div`
  background-color: var(--surface);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: var(--text-primary);
`;

const RunsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RunCard = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  transition: background-color 0.3s;
  color: var(--text-primary);
  text-decoration: none;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const RunInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RunName = styled.div`
  font-weight: 500;
`;

const RunDate = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const RunTime = styled.div<{ $status: string }>`
  font-family: monospace;
  font-weight: 500;
  color: ${props => {
    switch (props.$status) {
      case 'completed': return 'var(--success)';
      case 'failed': return 'var(--error)';
      default: return 'var(--secondary)';
    }
  }};
`;

const Stats = styled.div`
  background-color: var(--surface);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--primary);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: var(--text-secondary);
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    margin-bottom: 16px;
  }
`;

const Dashboard: React.FC = () => {
  const { currentRun, isRunning, isPaused } = useRaidTracker();
  const [recentRuns, setRecentRuns] = useState<RaidRun[]>([]);
  const [totalRuns, setTotalRuns] = useState<number>(0);
  const [completedRuns, setCompletedRuns] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [totalDeaths, setTotalDeaths] = useState<number>(0);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get recent runs
        const runs = await raidRunService.getAll();
        const sortedRuns = runs.sort((a, b) => {
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        }).slice(0, 5);
        setRecentRuns(sortedRuns);
        
        // Calculate stats
        setTotalRuns(runs.length);
        
        const completed = runs.filter(run => run.status === 'completed');
        setCompletedRuns(completed.length);
        
        if (completed.length > 0) {
          const times = completed.map(run => run.totalTime || 0);
          setBestTime(Math.min(...times));
        }
        
        let deaths = 0;
        for (const run of runs) {
          deaths += run.deaths.length;
        }
        setTotalDeaths(deaths);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };
    
    loadDashboardData();
  }, []);
  
  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>Welcome to GW2 Raid Tracker</Title>
        <Subtitle>Track and analyze your Guild Wars 2 raid performance</Subtitle>
      </DashboardHeader>
      
      <QuickActions>
        <ActionCard to="/tracker">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
          </svg>
          <h3>{currentRun ? (isRunning ? 'Continue Run' : 'Resume Run') : 'Start New Run'}</h3>
          <p>{currentRun ? `Currently tracking: ${currentRun.status}` : 'Track your raid performance'}</p>
        </ActionCard>
        
        <ActionCard to="/history">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3" />
          </svg>
          <h3>View History</h3>
          <p>Review your past raid runs</p>
        </ActionCard>
        
        <ActionCard to="/analytics">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z" />
          </svg>
          <h3>Analytics</h3>
          <p>Analyze your performance data</p>
        </ActionCard>
      </QuickActions>
      
      <DashboardGrid>
        <RecentRuns>
          <SectionTitle>Recent Runs</SectionTitle>
          
          {recentRuns.length > 0 ? (
            <RunsList>
              {recentRuns.map(run => (
                <RunCard key={run.id} to={`/history/${run.id}`}>
                  <RunInfo>
                    <RunName>Raid Wing {run.raidWingId}</RunName>
                    <RunDate>{formatDate(new Date(run.startTime))}</RunDate>
                  </RunInfo>
                  <RunTime $status={run.status}>
                    {run.totalTime ? formatTime(run.totalTime) : 'In Progress'}
                  </RunTime>
                </RunCard>
              ))}
            </RunsList>
          ) : (
            <EmptyState>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M13,2.03V2.05L13,4.05C17.39,4.59 20.5,8.58 19.96,12.97C19.5,16.61 16.64,19.5 13,19.93V21.93C18.5,21.38 22.5,16.5 21.95,11C21.5,6.25 17.73,2.5 13,2.03M11,2.06C9.05,2.25 7.19,3 5.67,4.26L7.1,5.74C8.22,4.84 9.57,4.26 11,4.06V2.06M4.26,5.67C3,7.19 2.25,9.04 2.05,11H4.05C4.24,9.58 4.8,8.23 5.69,7.1L4.26,5.67M2.06,13C2.26,14.96 3.03,16.81 4.27,18.33L5.69,16.9C4.81,15.77 4.24,14.42 4.06,13H2.06M7.1,18.37L5.67,19.74C7.18,21 9.04,21.79 11,22V20C9.58,19.82 8.23,19.25 7.1,18.37M16.82,15.19L12.71,11.08C13.12,10.04 12.89,8.82 12.03,7.97C11.13,7.06 9.78,6.88 8.69,7.38L10.63,9.32L9.28,10.68L7.29,8.73C6.75,9.82 7,11.17 7.88,12.08C8.74,12.94 9.96,13.16 11,12.76L15.11,16.86C15.29,17.05 15.56,17.05 15.74,16.86L16.78,15.83C17,15.65 17,15.33 16.82,15.19Z" />
              </svg>
              <p>No raid runs recorded yet.</p>
              <Link to="/tracker">
                <button>Start Your First Run</button>
              </Link>
            </EmptyState>
          )}
        </RecentRuns>
        
        <Stats>
          <SectionTitle>Your Stats</SectionTitle>
          
          <StatGrid>
            <StatCard>
              <StatLabel>Total Runs</StatLabel>
              <StatValue>{totalRuns}</StatValue>
            </StatCard>
            
            <StatCard>
              <StatLabel>Completion Rate</StatLabel>
              <StatValue>
                {totalRuns > 0 ? `${Math.round((completedRuns / totalRuns) * 100)}%` : 'N/A'}
              </StatValue>
            </StatCard>
            
            <StatCard>
              <StatLabel>Best Time</StatLabel>
              <StatValue>
                {bestTime ? formatTime(bestTime) : 'N/A'}
              </StatValue>
            </StatCard>
            
            <StatCard>
              <StatLabel>Total Deaths</StatLabel>
              <StatValue>{totalDeaths}</StatValue>
            </StatCard>
          </StatGrid>
        </Stats>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default Dashboard;