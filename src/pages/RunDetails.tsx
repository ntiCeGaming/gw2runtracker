import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { raidRunService, raidWingService, raidStepService } from '../database/dbService';
import { RaidRun, RaidWing, RaidStep } from '../database/db';
import { formatDate, formatTime, getDurationDescription } from '../utils/timeUtils';

const DetailsContainer = styled.div`
  padding: 24px 0;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
  text-decoration: none;
  margin-bottom: 24px;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RunHeader = styled.div`
  background-color: var(--surface);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const RunTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const RunStatus = styled.div<{ $status: string }>`
  display: inline-block;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 500;
  margin-bottom: 16px;
  background-color: ${props => {
    switch (props.$status) {
      case 'completed': return 'rgba(76, 175, 80, 0.2)';
      case 'failed': return 'rgba(244, 67, 54, 0.2)';
      case 'in-progress': return 'rgba(33, 150, 243, 0.2)';
      case 'paused': return 'rgba(255, 193, 7, 0.2)';
      default: return 'rgba(158, 158, 158, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#4caf50';
      case 'failed': return '#f44336';
      case 'in-progress': return '#2196f3';
      case 'paused': return '#ffc107';
      default: return '#9e9e9e';
    }
  }};
`;

const RunTime = styled.div`
  font-family: monospace;
  font-size: 2.5rem;
  font-weight: 500;
  color: var(--primary);
  margin: 16px 0;
`;

const RunInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  span:first-child {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  span:last-child {
    font-weight: 500;
    font-size: 1.1rem;
  }
`;

const Section = styled.div`
  background-color: var(--surface);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: var(--text-primary);
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StepItem = styled.div<{ $completed: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.$completed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border-left: 4px solid ${props => props.$completed ? 'var(--success)' : 'transparent'};
  border-radius: 4px;
`;

const StepInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StepName = styled.div`
  font-weight: 500;
`;

const StepDescription = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const StepTime = styled.div`
  font-family: monospace;
  font-weight: 500;
  color: var(--primary);
`;

const DeathsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DeathItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 4px solid var(--error);
  border-radius: 4px;
`;

const DeathInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const DeathLocation = styled.div`
  font-weight: 500;
`;

const DeathNotes = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const DeathTime = styled.div`
  font-family: monospace;
  font-weight: 500;
  color: var(--error);
`;

const NotesSection = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--text-primary);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  color: var(--text-secondary);
  font-style: italic;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48px;
  font-size: 1.2rem;
  color: var(--text-secondary);
`;

const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'failed': return 'Failed';
    case 'in-progress': return 'In Progress';
    case 'paused': return 'Paused';
    default: return 'Unknown';
  }
};

const RunDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<RaidRun | null>(null);
  const [wing, setWing] = useState<RaidWing | null>(null);
  const [steps, setSteps] = useState<RaidStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRunDetails = async () => {
      if (!id) {
        navigate('/404');
        return;
      }

      try {
        setLoading(true);
        const runId = parseInt(id);
        
        if (isNaN(runId)) {
          navigate('/404');
          return;
        }

        const runData = await raidRunService.getById(runId);
        if (!runData) {
          navigate('/404');
          return;
        }

        setRun(runData);

        // Load wing data
        const wingData = await raidWingService.getById(runData.raidWingId);
        if (wingData) {
          setWing(wingData);
          
          // Load steps for this wing
          const stepsData = await raidStepService.getAllForWing(runData.raidWingId);
          setSteps(stepsData);
        }
      } catch (err) {
        console.error('Error loading run details:', err);
        setError('Failed to load run details');
      } finally {
        setLoading(false);
      }
    };

    loadRunDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <DetailsContainer>
        <LoadingState>
          Loading run details...
        </LoadingState>
      </DetailsContainer>
    );
  }

  if (error || !run) {
    return (
      <DetailsContainer>
        <BackButton to="/history">
          ← Back to History
        </BackButton>
        <div className="text-error">{error || 'Run not found'}</div>
      </DetailsContainer>
    );
  }

  return (
    <DetailsContainer>
      <BackButton to="/history">
        ← Back to History
      </BackButton>

      <RunHeader>
        <RunTitle>{wing?.name || `Wing ${run.raidWingId}`}</RunTitle>
        <RunStatus $status={run.status}>
          {getStatusText(run.status)}
        </RunStatus>
        
        <RunTime>
          {run.totalTime ? formatTime(run.totalTime) : 'In Progress'}
        </RunTime>

        <RunInfo>
          <InfoItem>
            <span>Date</span>
            <span>{formatDate(new Date(run.startTime))}</span>
          </InfoItem>
          
          <InfoItem>
            <span>Duration</span>
            <span>
              {run.totalTime
                ? getDurationDescription(run.totalTime)
                : 'In Progress'}
            </span>
          </InfoItem>
          
          <InfoItem>
            <span>Team Members</span>
            <span>{run.teamMembers || 'Not specified'}</span>
          </InfoItem>
          
          <InfoItem>
            <span>Steps Completed</span>
            <span>{run.steps.length}</span>
          </InfoItem>
          
          <InfoItem>
            <span>Deaths</span>
            <span>{run.deaths.length}</span>
          </InfoItem>
        </RunInfo>
      </RunHeader>

      {steps.length > 0 && (
        <Section>
          <SectionTitle>Steps Progress</SectionTitle>
          <StepsList>
            {steps.map(step => {
              const stepData = run.steps.find(s => s.stepId === step.id);
              const isCompleted = !!stepData;
              
              return (
                <StepItem key={step.id} $completed={isCompleted}>
                  <StepInfo>
                    <StepName>{step.name}</StepName>
                    {step.description && (
                      <StepDescription>{step.description}</StepDescription>
                    )}
                  </StepInfo>
                  
                  {isCompleted && (
                    <StepTime>{formatTime(stepData.reachedAt)}</StepTime>
                  )}
                </StepItem>
              );
            })}
          </StepsList>
          
          {run.steps.length === 0 && (
            <EmptyState>
              No steps were completed during this run.
            </EmptyState>
          )}
        </Section>
      )}

      {run.deaths.length > 0 && (
        <Section>
          <SectionTitle>Deaths ({run.deaths.length})</SectionTitle>
          <DeathsList>
            {run.deaths.map((death, index) => (
              <DeathItem key={index}>
                <DeathInfo>
                  <DeathLocation>{death.location}</DeathLocation>
                  {death.notes && (
                    <DeathNotes>{death.notes}</DeathNotes>
                  )}
                </DeathInfo>
                <DeathTime>{formatTime(death.timestamp)}</DeathTime>
              </DeathItem>
            ))}
          </DeathsList>
        </Section>
      )}

      {run.notes && (
        <Section>
          <SectionTitle>Run Notes</SectionTitle>
          <NotesSection>{run.notes}</NotesSection>
        </Section>
      )}
    </DetailsContainer>
  );
};

export default RunDetails;