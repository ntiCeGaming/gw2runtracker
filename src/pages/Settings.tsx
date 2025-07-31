import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { raidWingService, raidStepService } from '../database/dbService';
import { RaidWing, RaidStep } from '../database/db';
import { useUser } from '../contexts/UserContext';

const SettingsContainer = styled.div`
  padding: 24px 0;
`;

const SettingsHeader = styled.div`
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

const SettingsCard = styled.div`
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

const FormGroup = styled.div`
  margin-bottom: 24px;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: var(--text-primary);
  }
  
  input, select, textarea {
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
    min-height: 100px;
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

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
  overflow-x: auto;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.$active ? 'var(--primary)' : 'var(--text-primary)'};
  font-weight: ${props => props.$active ? '500' : '400'};
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: ${props => props.$active ? 'var(--primary)' : 'var(--text-secondary)'};
  }
`;

const WingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 8px;
`;

const SuccessMessage = styled.div`
  color: #4CAF50;
  font-size: 0.9rem;
  margin-top: 8px;
`;

const AccountInfo = styled.div`
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 24px;
`;

const AccountDetail = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AccountLabel = styled.span`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const AccountValue = styled.span`
  color: var(--text-primary);
  font-weight: 500;
`;

const WingItem = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WingName = styled.div`
  font-weight: 500;
`;

const WingDescription = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const WingActions = styled.div`
  display: flex;
  gap: 8px;
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const StepItem = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const StepActions = styled.div`
  display: flex;
  gap: 8px;
`;

const AlertSuccessMessage = styled.div`
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--success);
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const AlertErrorMessage = styled.div`
  background-color: rgba(244, 67, 54, 0.1);
  color: var(--error);
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const Settings: React.FC = () => {
  const { user, updateUsername, updatePassword, isLoggedIn } = useUser();
  const [activeTab, setActiveTab] = useState<'account' | 'wings' | 'steps' | 'team' | 'export'>('account');
  const [wings, setWings] = useState<RaidWing[]>([]);
  const [selectedWingId, setSelectedWingId] = useState<number | null>(null);
  const [steps, setSteps] = useState<RaidStep[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Account management states
  const [newUsername, setNewUsername] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [accountLoading, setAccountLoading] = useState<boolean>(false);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  
  // Form states
  const [newWingName, setNewWingName] = useState<string>('');
  const [newWingDescription, setNewWingDescription] = useState<string>('');
  const [newWingBosses, setNewWingBosses] = useState<string>('');
  const [newStepName, setNewStepName] = useState<string>('');
  const [newStepDescription, setNewStepDescription] = useState<string>('');
  
  // Edit states
  const [editingWingId, setEditingWingId] = useState<number | null>(null);
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  
  // Load wings on mount
  useEffect(() => {
    const loadWings = async () => {
      setLoading(true);
      try {
        const wingsData = await raidWingService.getAll();
        setWings(wingsData);
        
        if (wingsData.length > 0 && !selectedWingId) {
          setSelectedWingId(wingsData[0].id || null);
        }
      } catch (err) {
        setError('Failed to load raid wings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadWings();
  }, []);
  
  // Load steps when selected wing changes
  useEffect(() => {
    const loadSteps = async () => {
      if (!selectedWingId) return;
      
      setLoading(true);
      try {
        const stepsData = await raidStepService.getAllForWing(selectedWingId);
        setSteps(stepsData);
      } catch (err) {
        setError('Failed to load raid steps');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSteps();
  }, [selectedWingId]);
  
  // Handle adding a new wing
  const handleAddWing = async () => {
    if (!newWingName) return;
    
    setLoading(true);
    try {
      const bosses = newWingBosses.split(',').map(boss => boss.trim()).filter(Boolean);
      
      const newWing: RaidWing = {
        name: newWingName,
        description: newWingDescription,
        bosses: bosses,
      };
      
      const wingId = await raidWingService.add(newWing);
      
      // Add default steps
      await raidStepService.add({
        name: 'Start',
        description: 'Beginning of the raid',
        order: 0,
        raidWingId: wingId,
      });
      
      // Refresh wings
      const wingsData = await raidWingService.getAll();
      setWings(wingsData);
      
      // Select the new wing
      setSelectedWingId(wingId);
      
      // Reset form
      setNewWingName('');
      setNewWingDescription('');
      setNewWingBosses('');
      
      setSuccess('Raid wing added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to add raid wing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle updating a wing
  const handleUpdateWing = async () => {
    if (!editingWingId || !newWingName) return;
    
    setLoading(true);
    try {
      const bosses = newWingBosses.split(',').map(boss => boss.trim()).filter(Boolean);
      
      await raidWingService.update(editingWingId, {
        name: newWingName,
        description: newWingDescription,
        bosses: bosses,
      });
      
      // Refresh wings
      const wingsData = await raidWingService.getAll();
      setWings(wingsData);
      
      // Reset form
      setEditingWingId(null);
      setNewWingName('');
      setNewWingDescription('');
      setNewWingBosses('');
      
      setSuccess('Raid wing updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update raid wing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting a wing
  const handleDeleteWing = async (wingId: number) => {
    if (!confirm('Are you sure you want to delete this raid wing? This will also delete all associated steps and runs.')) {
      return;
    }
    
    setLoading(true);
    try {
      await raidWingService.delete(wingId);
      
      // Refresh wings
      const wingsData = await raidWingService.getAll();
      setWings(wingsData);
      
      // Update selected wing
      if (selectedWingId === wingId) {
        setSelectedWingId(wingsData.length > 0 ? wingsData[0].id || null : null);
      }
      
      setSuccess('Raid wing deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete raid wing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle editing a wing
  const handleEditWing = (wing: RaidWing) => {
    setEditingWingId(wing.id || null);
    setNewWingName(wing.name);
    setNewWingDescription(wing.description);
    setNewWingBosses(wing.bosses.join(', '));
  };
  
  // Handle adding a new step
  const handleAddStep = async () => {
    if (!selectedWingId || !newStepName) return;
    
    setLoading(true);
    try {
      const newStep: RaidStep = {
        name: newStepName,
        description: newStepDescription,
        order: steps.length,
        raidWingId: selectedWingId,
      };
      
      await raidStepService.add(newStep);
      
      // Refresh steps
      const stepsData = await raidStepService.getAllForWing(selectedWingId);
      setSteps(stepsData);
      
      // Reset form
      setNewStepName('');
      setNewStepDescription('');
      
      setSuccess('Raid step added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to add raid step');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle updating a step
  const handleUpdateStep = async () => {
    if (!editingStepId || !newStepName) return;
    
    setLoading(true);
    try {
      await raidStepService.update(editingStepId, {
        name: newStepName,
        description: newStepDescription,
      });
      
      // Refresh steps
      if (selectedWingId) {
        const stepsData = await raidStepService.getAllForWing(selectedWingId);
        setSteps(stepsData);
      }
      
      // Reset form
      setEditingStepId(null);
      setNewStepName('');
      setNewStepDescription('');
      
      setSuccess('Raid step updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update raid step');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting a step
  const handleDeleteStep = async (stepId: number) => {
    if (!confirm('Are you sure you want to delete this raid step?')) {
      return;
    }
    
    setLoading(true);
    try {
      await raidStepService.delete(stepId);
      
      // Refresh steps
      if (selectedWingId) {
        const stepsData = await raidStepService.getAllForWing(selectedWingId);
        setSteps(stepsData);
      }
      
      setSuccess('Raid step deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete raid step');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle editing a step
  const handleEditStep = (step: RaidStep) => {
    setEditingStepId(step.id || null);
    setNewStepName(step.name);
    setNewStepDescription(step.description || '');
  };
  
  // Handle updating username
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      setAccountError('Please enter a new username');
      return;
    }
    
    setAccountLoading(true);
    setAccountError(null);
    setAccountSuccess(null);
    
    try {
      const result = await updateUsername(newUsername.trim());
      if (result.success) {
        setAccountSuccess('Username updated successfully');
        setNewUsername('');
        setTimeout(() => setAccountSuccess(null), 3000);
      } else {
        setAccountError(result.error || 'Failed to update username');
      }
    } catch (err) {
      setAccountError('An unexpected error occurred');
    } finally {
      setAccountLoading(false);
    }
  };
  
  // Handle updating password
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      setAccountError('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setAccountError('New passwords do not match');
      return;
    }
    
    setAccountLoading(true);
    setAccountError(null);
    setAccountSuccess(null);
    
    try {
      const result = await updatePassword(currentPassword, newPassword);
      if (result.success) {
        setAccountSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setAccountSuccess(null), 3000);
      } else {
        setAccountError(result.error || 'Failed to update password');
      }
    } catch (err) {
      setAccountError('An unexpected error occurred');
    } finally {
      setAccountLoading(false);
    }
  };

  // Handle exporting data
  const handleExportData = () => {
    try {
      const exportData = {
        wings,
        steps,
        exportDate: new Date().toISOString(),
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `gw2-raid-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setSuccess('Data exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to export data');
      console.error(err);
    }
  };
  
  return (
    <SettingsContainer>
      <SettingsHeader>
        <Title>Settings</Title>
        <Subtitle>Configure your raid tracker settings</Subtitle>
      </SettingsHeader>
      
      {success && (
        <SuccessMessage>{success}</SuccessMessage>
      )}
      
      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
      
      <TabsContainer>
        {isLoggedIn && (
          <Tab
            $active={activeTab === 'account'}
            onClick={() => setActiveTab('account')}
          >
            Account
          </Tab>
        )}
        <Tab
          $active={activeTab === 'wings'}
          onClick={() => setActiveTab('wings')}
        >
          Raid Wings
        </Tab>
        <Tab
          $active={activeTab === 'steps'}
          onClick={() => setActiveTab('steps')}
        >
          Raid Steps
        </Tab>
        <Tab
          $active={activeTab === 'team'}
          onClick={() => setActiveTab('team')}
        >
          Team Members
        </Tab>
        <Tab
          $active={activeTab === 'export'}
          onClick={() => setActiveTab('export')}
        >
          Export/Import
        </Tab>
      </TabsContainer>
      
      {activeTab === 'account' && isLoggedIn && (
        <SettingsCard>
          <SectionTitle>Account Management</SectionTitle>
          
          {accountSuccess && (
            <AlertSuccessMessage>{accountSuccess}</AlertSuccessMessage>
          )}
          
          {accountError && (
            <AlertErrorMessage>{accountError}</AlertErrorMessage>
          )}
          
          <AccountInfo>
            <AccountDetail>
              <AccountLabel>Current Username:</AccountLabel>
              <AccountValue>{user?.username}</AccountValue>
            </AccountDetail>
            <AccountDetail>
              <AccountLabel>Account Created:</AccountLabel>
              <AccountValue>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </AccountValue>
            </AccountDetail>
          </AccountInfo>
          
          <SectionTitle>Change Username</SectionTitle>
          <FormGroup>
            <label htmlFor="newUsername">New Username</label>
            <input
              id="newUsername"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              disabled={accountLoading}
            />
          </FormGroup>
          
          <ButtonGroup>
            <Button
              onClick={handleUpdateUsername}
              disabled={accountLoading || !newUsername.trim()}
            >
              {accountLoading ? 'Updating...' : 'Update Username'}
            </Button>
          </ButtonGroup>
          
          <SectionTitle>Change Password</SectionTitle>
          <FormGroup>
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              disabled={accountLoading}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={accountLoading}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={accountLoading}
            />
          </FormGroup>
          
          <ButtonGroup>
            <Button
              onClick={handleUpdatePassword}
              disabled={accountLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              {accountLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </ButtonGroup>
        </SettingsCard>
      )}
      
      {activeTab === 'wings' && (
        <SettingsCard>
          <SectionTitle>
            {editingWingId ? 'Edit Raid Wing' : 'Add New Raid Wing'}
          </SectionTitle>
          
          <FormGroup>
            <label htmlFor="wingName">Wing Name</label>
            <input
              id="wingName"
              type="text"
              value={newWingName}
              onChange={(e) => setNewWingName(e.target.value)}
              placeholder="Enter wing name"
              disabled={loading}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="wingDescription">Description</label>
            <textarea
              id="wingDescription"
              value={newWingDescription}
              onChange={(e) => setNewWingDescription(e.target.value)}
              placeholder="Enter wing description"
              disabled={loading}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="wingBosses">Bosses</label>
            <input
              id="wingBosses"
              type="text"
              value={newWingBosses}
              onChange={(e) => setNewWingBosses(e.target.value)}
              placeholder="Enter boss names, separated by commas"
              disabled={loading}
            />
            <p>Enter the names of the bosses in this wing, separated by commas.</p>
          </FormGroup>
          
          <ButtonGroup>
            {editingWingId ? (
              <>
                <Button
                  onClick={handleUpdateWing}
                  disabled={loading || !newWingName}
                >
                  Update Wing
                </Button>
                <Button
                  $variant="secondary"
                  onClick={() => {
                    setEditingWingId(null);
                    setNewWingName('');
                    setNewWingDescription('');
                    setNewWingBosses('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAddWing}
                disabled={loading || !newWingName}
              >
                Add Wing
              </Button>
            )}
          </ButtonGroup>
          
          <WingsList>
            <h3 className="mt-4 mb-4">Existing Raid Wings</h3>
            
            {wings.length > 0 ? (
              wings.map(wing => (
                <WingItem key={wing.id}>
                  <WingInfo>
                    <WingName>{wing.name}</WingName>
                    <WingDescription>{wing.description}</WingDescription>
                  </WingInfo>
                  <WingActions>
                    <Button
                      $variant="secondary"
                      onClick={() => handleEditWing(wing)}
                      disabled={loading}
                    >
                      Edit
                    </Button>
                    <Button
                      $variant="danger"
                      onClick={() => handleDeleteWing(wing.id as number)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </WingActions>
                </WingItem>
              ))
            ) : (
              <p>No raid wings found. Add your first wing above.</p>
            )}
          </WingsList>
        </SettingsCard>
      )}
      
      {activeTab === 'steps' && (
        <SettingsCard>
          <SectionTitle>
            {editingStepId ? 'Edit Raid Step' : 'Add New Raid Step'}
          </SectionTitle>
          
          <FormGroup>
            <label htmlFor="wingSelector">Select Raid Wing</label>
            <select
              id="wingSelector"
              value={selectedWingId?.toString() || ''}
              onChange={(e) => setSelectedWingId(parseInt(e.target.value))}
              disabled={loading || wings.length === 0 || editingStepId !== null}
            >
              {wings.map(wing => (
                <option key={wing.id} value={wing.id?.toString()}>
                  {wing.name}
                </option>
              ))}
            </select>
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="stepName">Step Name</label>
            <input
              id="stepName"
              type="text"
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              placeholder="Enter step name"
              disabled={loading || !selectedWingId}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="stepDescription">Description</label>
            <textarea
              id="stepDescription"
              value={newStepDescription}
              onChange={(e) => setNewStepDescription(e.target.value)}
              placeholder="Enter step description"
              disabled={loading || !selectedWingId}
            />
          </FormGroup>
          
          <ButtonGroup>
            {editingStepId ? (
              <>
                <Button
                  onClick={handleUpdateStep}
                  disabled={loading || !newStepName}
                >
                  Update Step
                </Button>
                <Button
                  $variant="secondary"
                  onClick={() => {
                    setEditingStepId(null);
                    setNewStepName('');
                    setNewStepDescription('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAddStep}
                disabled={loading || !selectedWingId || !newStepName}
              >
                Add Step
              </Button>
            )}
          </ButtonGroup>
          
          {selectedWingId && (
            <StepsList>
              <h3 className="mt-4 mb-4">Existing Steps for {wings.find(w => w.id === selectedWingId)?.name}</h3>
              
              {steps.length > 0 ? (
                steps.map(step => (
                  <StepItem key={step.id}>
                    <StepInfo>
                      <StepName>{step.name}</StepName>
                      <StepDescription>{step.description}</StepDescription>
                    </StepInfo>
                    <StepActions>
                      <Button
                        $variant="secondary"
                        onClick={() => handleEditStep(step)}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        $variant="danger"
                        onClick={() => handleDeleteStep(step.id as number)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </StepActions>
                  </StepItem>
                ))
              ) : (
                <p>No steps found for this wing. Add your first step above.</p>
              )}
            </StepsList>
          )}
        </SettingsCard>
      )}
      
      {activeTab === 'team' && (
        <SettingsCard>
          <SectionTitle>Team Members</SectionTitle>
          
          <p className="mb-4">
            Team members can be added when starting a new raid run. This feature allows you to track which team members participated in each run.
          </p>
          
          <p>
            In a future update, you'll be able to save and manage team presets here.
          </p>
        </SettingsCard>
      )}
      
      {activeTab === 'export' && (
        <SettingsCard>
          <SectionTitle>Export/Import Data</SectionTitle>
          
          <p className="mb-4">
            Export your raid data to back it up or transfer it to another device.
          </p>
          
          <ButtonGroup>
            <Button
              onClick={handleExportData}
              disabled={loading}
            >
              Export Data
            </Button>
          </ButtonGroup>
          
          <p className="mt-4 mb-4">
            Import data from a previously exported file.
          </p>
          
          <p className="mb-4">
            Import functionality will be available in a future update.
          </p>
          
          <SectionTitle className="mt-6">Database Management</SectionTitle>
          
          <p className="mb-4">
            Reset your database and add predefined steps for all raid wings (1-8).
            <strong> Warning: This will delete all your existing data!</strong>
          </p>
          
          <ButtonGroup>
            <Button
              onClick={() => window.open('./resetDatabaseWithSteps.html', '_blank')}
              style={{ backgroundColor: '#d32f2f' }}
            >
              Reset Database & Add Preset Steps
            </Button>
          </ButtonGroup>
          
          <p className="mt-4 mb-4">
            Add predefined steps for raid wings 3-8 without resetting your database.
            This is useful if you're missing steps for certain wings.
          </p>
          
          <ButtonGroup>
            <Button
              onClick={() => window.open('./addStepsForWings.html', '_blank')}
              style={{ backgroundColor: '#1976d2' }}
            >
              Add Preset Steps Only
            </Button>
          </ButtonGroup>
        </SettingsCard>
      )}
    </SettingsContainer>
  );
};

export default Settings;