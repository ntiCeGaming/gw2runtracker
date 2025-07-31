import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useRaidTracker } from '../contexts/RaidTrackerContext';
import { useUser } from '../contexts/UserContext';
import { formatTime } from '../utils/timeUtils';

const TrackerContainer = styled.div`
  padding: 24px 0;
`;

const TrackerHeader = styled.div`
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

const TrackerCard = styled.div`
  background-color: var(--surface);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 16px;
  color: var(--text-primary);
`;

const WingSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const WingCard = styled.div<{ $selected: boolean }>`
  background-color: ${props => props.$selected ? 'rgba(192, 44, 56, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${props => props.$selected ? 'var(--primary)' : 'transparent'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: ${props => props.$selected ? 'rgba(192, 44, 56, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const WingTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 8px;
`;

const WingDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const WingBosses = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const TeamMembersInput = styled.div`
  margin-bottom: 24px;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-primary);
  }
  
  input {
    width: 100%;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #444;
    background-color: #2a2a2a;
    color: var(--text-primary);
    font-size: 1rem;
  }
  
  p {
    margin-top: 8px;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  background-color: ${props => {
    switch (props.$variant) {
      case 'secondary': return '#2c87c0';
      case 'danger': return '#d32f2f';
      default: return 'var(--primary)';
    }
  }};
  
  color: white;
  
  &:hover {
    background-color: ${props => {
    switch (props.$variant) {
      case 'secondary': return '#236d9b';
      case 'danger': return '#b71c1c';
      default: return '#a02530';
    }
  }};
  }
  
  &:disabled {
    background-color: #6c6c6c;
    cursor: not-allowed;
  }
`;

const ActiveRunCard = styled.div`
  background-color: var(--surface);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const TimerDisplay = styled.div`
  font-family: monospace;
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  color: var(--primary);
  margin: 24px 0;
`;

const RunControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const StepsTracker = styled.div`
  margin-bottom: 32px;
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
`;

const DeathTracker = styled.div`
  margin-bottom: 32px;
`;

const DeathForm = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-primary);
  }
  
  input, textarea {
    width: 100%;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #444;
    background-color: #2a2a2a;
    color: var(--text-primary);
    font-size: 1rem;
  }
  
  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const DeathsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DeathItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: rgba(207, 102, 121, 0.1);
  border-left: 4px solid var(--error);
  border-radius: 4px;
`;

const DeathInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  margin-bottom: 32px;
  
  textarea {
    width: 100%;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #444;
    background-color: #2a2a2a;
    color: var(--text-primary);
    font-size: 1rem;
    resize: vertical;
    min-height: 120px;
    margin-top: 16px;
  }
`;

const RaidTracker: React.FC = () => {
  const {
    currentRun,
    isRunning,
    isPaused,
    elapsedTime,
    currentWing,
    currentSteps,
    completedSteps,
    availableWings,
    startRun,
    pauseRun,
    resumeRun,
    completeRun,
    failRun,
    recordStep,
    recordDeath,
    updateNotes,
    addStep,
    isLoading,
    error
  } = useRaidTracker();
  
  // Get user context
  const { user, isLoggedIn } = useUser();
  
  // State for new run setup
  const [selectedWingId, setSelectedWingId] = useState<number | null>(null);
  const [teamMembers, setTeamMembers] = useState<string>('');
  const [patch, setPatch] = useState<string>('');
  
  // State for death tracking
  const [deathLocation, setDeathLocation] = useState<string>('');
  const [deathNotes, setDeathNotes] = useState<string>('');
  
  // State for run notes
  const [notes, setNotes] = useState<string>('');
  
  // State for adding new steps
  const [showAddStep, setShowAddStep] = useState<boolean>(false);
  const [newStepName, setNewStepName] = useState<string>('');
  const [newStepDescription, setNewStepDescription] = useState<string>('');
  
  // Update notes in context when they change in the component
  useEffect(() => {
    if (currentRun && notes) {
      updateNotes(notes);
    }
  }, [notes, currentRun, updateNotes]);
  
  // Set notes from current run when it changes
  useEffect(() => {
    if (currentRun && currentRun.notes) {
      setNotes(currentRun.notes);
    } else {
      setNotes('');
    }
  }, [currentRun]);
  
  const handleStartRun = async () => {
    if (!selectedWingId) return;
    
    // Get team members from input
    let members = teamMembers.split(',').map(member => member.trim()).filter(Boolean);
    
    // Add logged-in user as a participant if they're not already included
    if (isLoggedIn && user?.username) {
      const username = user.username;
      if (!members.includes(username)) {
        members = [username, ...members];
      }
    }
    
    await startRun(selectedWingId, members.length > 0 ? members : undefined, patch || undefined);
    
    // Reset form
    setSelectedWingId(null);
    setTeamMembers('');
    setPatch('');
  };
  
  const handleRecordDeath = async () => {
    if (!deathLocation) return;
    
    await recordDeath(deathLocation, deathNotes || undefined);
    
    // Reset form
    setDeathLocation('');
    setDeathNotes('');
  };
  
  // Handle adding a new step
  const handleAddStep = async () => {
    if (!newStepName.trim() || !currentWing) return;
    
    try {
      const stepId = await addStep(currentWing.id as number, newStepName.trim(), newStepDescription.trim());
      if (stepId) {
        // Automatically mark the new step as reached
        await recordStep(stepId);
      }
      
      // Reset form
      setNewStepName('');
      setNewStepDescription('');
      setShowAddStep(false);
    } catch (err) {
      console.error('Failed to add step:', err);
    }
  };
  
  return (
    <TrackerContainer>
      <TrackerHeader>
        <Title>Raid Tracker</Title>
        <Subtitle>
          {isRunning
            ? 'Currently tracking your raid run'
            : isPaused
              ? 'Run is paused - resume when ready'
              : 'Start a new raid run to track your performance'}
        </Subtitle>
      </TrackerHeader>
      
      {error && (
        <div className="text-error mb-4">{error}</div>
      )}
      
      {!currentRun ? (
        <TrackerCard>
          <SectionTitle>Start a New Run</SectionTitle>
          
          <WingSelector>
            {availableWings.map(wing => (
              <WingCard
                key={wing.id}
                $selected={selectedWingId === wing.id}
                onClick={() => setSelectedWingId(wing.id || null)}
              >
                <WingTitle>{wing.name}</WingTitle>
                <WingDescription>{wing.description}</WingDescription>
                <WingBosses>
                  <strong>Bosses:</strong> {wing.bosses.join(', ')}
                </WingBosses>
              </WingCard>
            ))}
          </WingSelector>
          
          <TeamMembersInput>
            <label htmlFor="teamMembers">Team Members (Optional)</label>
            <input
              id="teamMembers"
              type="text"
              value={teamMembers}
              onChange={(e) => setTeamMembers(e.target.value)}
              placeholder="Player1, Player2, Player3..."
            />
            <p>Enter the names of your team members, separated by commas.</p>
          </TeamMembersInput>
          
          <TeamMembersInput>
            <label htmlFor="patch">Game Patch (Optional)</label>
            <input
              id="patch"
              type="text"
              value={patch}
              onChange={(e) => setPatch(e.target.value)}
              placeholder="e.g., 2024.12.10"
            />
            <p>Enter the game patch version for organizing raid history.</p>
          </TeamMembersInput>
          
          <ButtonGroup>
            <Button
              onClick={handleStartRun}
              disabled={!selectedWingId || isLoading}
            >
              Start Run
            </Button>
          </ButtonGroup>
        </TrackerCard>
      ) : (
        <>
          <ActiveRunCard>
            <SectionTitle>
              {currentWing?.name || 'Current Run'}
            </SectionTitle>
            
            <TimerDisplay>
              {formatTime(elapsedTime)}
            </TimerDisplay>
            
            <RunControls>
              {isRunning ? (
                <Button $variant="secondary" onClick={pauseRun}>
                  Pause Run
                </Button>
              ) : (
                <Button $variant="secondary" onClick={resumeRun}>
                  Resume Run
                </Button>
              )}
              
              <Button onClick={completeRun}>
                Complete Run
              </Button>
              
              <Button $variant="danger" onClick={failRun}>
                Fail Run
              </Button>
            </RunControls>
          </ActiveRunCard>
          
          <StepsTracker>
            <TrackerCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <SectionTitle>Steps Tracker</SectionTitle>
                <Button
                  $variant="secondary"
                  onClick={() => setShowAddStep(!showAddStep)}
                  disabled={!isRunning}
                >
                  {showAddStep ? 'Cancel' : 'Add Step'}
                </Button>
              </div>
              
              {showAddStep && (
                <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                  <FormGroup>
                    <label htmlFor="stepName">Step Name</label>
                    <input
                      id="stepName"
                      type="text"
                      value={newStepName}
                      onChange={(e) => setNewStepName(e.target.value)}
                      placeholder="Enter step name"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <label htmlFor="stepDescription">Description (optional)</label>
                    <input
                      id="stepDescription"
                      type="text"
                      value={newStepDescription}
                      onChange={(e) => setNewStepDescription(e.target.value)}
                      placeholder="Enter step description"
                    />
                  </FormGroup>
                  
                  <ButtonGroup>
                    <Button
                      onClick={handleAddStep}
                      disabled={!newStepName.trim()}
                    >
                      Add & Mark as Reached
                    </Button>
                  </ButtonGroup>
                </div>
              )}
              
              <StepsList>
                {currentSteps.map(step => {
                  const isCompleted = completedSteps.includes(step.id as number);
                  const stepData = currentRun.steps.find(s => s.stepId === step.id);
                  
                  return (
                    <StepItem key={step.id} $completed={isCompleted}>
                      <StepInfo>
                        <StepName>{step.name}</StepName>
                        {step.description && (
                          <StepDescription>{step.description}</StepDescription>
                        )}
                      </StepInfo>
                      
                      {isCompleted ? (
                        <StepTime>{formatTime(stepData?.reachedAt || 0)}</StepTime>
                      ) : (
                        <Button
                          onClick={() => recordStep(step.id as number)}
                          disabled={!isRunning}
                        >
                          Mark as Reached
                        </Button>
                      )}
                    </StepItem>
                  );
                })}
              </StepsList>
            </TrackerCard>
          </StepsTracker>
          
          <DeathTracker>
            <TrackerCard>
              <SectionTitle>Death Tracker</SectionTitle>
              
              <DeathForm>
                <FormGroup>
                  <label htmlFor="deathLocation">Death Location</label>
                  <input
                    id="deathLocation"
                    type="text"
                    value={deathLocation}
                    onChange={(e) => setDeathLocation(e.target.value)}
                    placeholder="Where did you die?"
                    disabled={!isRunning}
                  />
                </FormGroup>
                
                <FormGroup>
                  <label htmlFor="deathNotes">Notes (optional)</label>
                  <textarea
                    id="deathNotes"
                    value={deathNotes}
                    onChange={(e) => setDeathNotes(e.target.value)}
                    placeholder="What happened?"
                    disabled={!isRunning}
                  />
                </FormGroup>
                
                <Button
                  onClick={handleRecordDeath}
                  disabled={!isRunning || !deathLocation}
                >
                  Record Death
                </Button>
              </DeathForm>
              
              {currentRun.deaths.length > 0 ? (
                <DeathsList>
                  {/* Note: This would need to fetch actual death events from the database */}
                  {/* For now, we'll just show placeholder data */}
                  {currentRun.deaths.map((deathId, index) => (
                    <DeathItem key={deathId}>
                      <DeathInfo>
                        <DeathLocation>Death #{index + 1}</DeathLocation>
                        <DeathNotes>Location data would be shown here</DeathNotes>
                      </DeathInfo>
                      <DeathTime>+00:00.00</DeathTime>
                    </DeathItem>
                  ))}
                </DeathsList>
              ) : (
                <p className="text-center mt-4">No deaths recorded yet. Keep it up!</p>
              )}
            </TrackerCard>
          </DeathTracker>
          
          <NotesSection>
            <TrackerCard>
              <SectionTitle>Run Notes</SectionTitle>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this run..."
              />
            </TrackerCard>
          </NotesSection>
        </>
      )}
    </TrackerContainer>
  );
};

export default RaidTracker;