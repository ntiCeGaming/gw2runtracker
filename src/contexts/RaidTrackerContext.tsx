import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { raidRunService, raidWingService, raidStepService } from '../database/dbService';
import { RaidRun, RaidWing, RaidStep } from '../database/db';
import authService from '../database/authService';

interface RaidTrackerContextType {
  // Current run state
  currentRun: RaidRun | null;
  isRunning: boolean;
  isPaused: boolean;
  elapsedTime: number;
  currentWing: RaidWing | null;
  currentSteps: RaidStep[];
  completedSteps: number[];
  
  // Available raid wings
  availableWings: RaidWing[];
  
  // Timer functions
  startRun: (wingId: number, teamMembers?: string[], patch?: string) => Promise<void>;
  pauseRun: () => Promise<void>;
  resumeRun: () => Promise<void>;
  completeRun: () => Promise<void>;
  failRun: () => Promise<void>;
  recordStep: (stepId: number) => Promise<void>;
  recordDeath: (location: string, notes?: string) => Promise<void>;
  updateNotes: (notes: string) => Promise<void>;
  addStep: (wingId: number, name: string, description?: string) => Promise<number | null>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const RaidTrackerContext = createContext<RaidTrackerContextType | undefined>(undefined);

export const useRaidTracker = () => {
  const context = useContext(RaidTrackerContext);
  if (context === undefined) {
    throw new Error('useRaidTracker must be used within a RaidTrackerProvider');
  }
  return context;
};

interface RaidTrackerProviderProps {
  children: ReactNode;
}

export const RaidTrackerProvider: React.FC<RaidTrackerProviderProps> = ({ children }) => {
  // State
  const [currentRun, setCurrentRun] = useState<RaidRun | null>(null);
  const [currentWing, setCurrentWing] = useState<RaidWing | null>(null);
  const [currentSteps, setCurrentSteps] = useState<RaidStep[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [availableWings, setAvailableWings] = useState<RaidWing[]>([]);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Derived state
  const isRunning = Boolean(currentRun && currentRun.status === 'in-progress');
  const isPaused = Boolean(currentRun && currentRun.status === 'paused');
  
  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && currentRun) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = now.getTime() - currentRun.startTime.getTime();
        setElapsedTime(elapsed);
      }, 100); // Update every 100ms for smoother display
    } else if (isPaused && currentRun) {
      // When paused, we still want to show the elapsed time
      const elapsed = new Date().getTime() - currentRun.startTime.getTime();
      setElapsedTime(elapsed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, currentRun]);
  
  // Load available raid wings on mount
  useEffect(() => {
    const loadWings = async () => {
      try {
        const wings = await raidWingService.getAll();
        setAvailableWings(wings);
      } catch (err) {
        setError('Failed to load raid wings');
        console.error(err);
      }
    };
    
    loadWings();
  }, []);
  
  // Check for active run on mount
  useEffect(() => {
    const checkActiveRun = async () => {
      setIsLoading(true);
      try {
        const activeRun = await raidRunService.getActiveRun();
        
        if (activeRun) {
          setCurrentRun(activeRun);
          
          // Load the wing data
          const wing = await raidWingService.getById(activeRun.raidWingId);
          setCurrentWing(wing || null);
          
          // Load the steps for this wing
          if (wing) {
            const steps = await raidStepService.getAllForWing(wing.id as number);
            setCurrentSteps(steps);
            
            // Set completed steps
            const completed = activeRun.steps.map(step => step.stepId);
            setCompletedSteps(completed);
          }
          
          // Set elapsed time
          const now = new Date();
          const elapsed = now.getTime() - activeRun.startTime.getTime();
          setElapsedTime(elapsed);
        }
      } catch (err) {
        setError('Failed to check for active runs');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkActiveRun();
  }, []);
  
  // Start a new raid run
  const startRun = async (wingId: number, teamMembers?: string[], patch?: string) => {
    setIsLoading(true);
    try {
      // Check if there's already an active run
      const activeRun = await raidRunService.getActiveRun();
      if (activeRun) {
        throw new Error('There is already an active run. Please complete or fail it before starting a new one.');
      }
      
      // Start a new run
      const runId = await raidRunService.startRun(wingId, teamMembers, patch);
      const newRun = await raidRunService.getById(runId);
      
      if (newRun) {
        setCurrentRun(newRun);
        
        // Load the wing data
        const wing = await raidWingService.getById(wingId);
        setCurrentWing(wing || null);
        
        // Load the steps for this wing
        if (wing) {
          const steps = await raidStepService.getAllForWing(wing.id as number);
          setCurrentSteps(steps);
          setCompletedSteps([]);
        }
        
        // Reset elapsed time
        setElapsedTime(0);
        
        // Link the run to the current user if logged in
        if (authService.isLoggedIn()) {
          await authService.linkUserToRun(runId);
        }
        
        // Link run to any team members that match usernames in the system
        if (teamMembers && teamMembers.length > 0) {
          for (const member of teamMembers) {
            const user = await authService.findUserByUsername(member);
            if (user) {
              await authService.linkUserToRun(runId, user.id);
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start run';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Pause the current run
  const pauseRun = async () => {
    if (!currentRun || !isRunning) return;
    
    try {
      await raidRunService.pauseRun(currentRun.id as number);
      setCurrentRun({ ...currentRun, status: 'paused' });
    } catch (err) {
      setError('Failed to pause run');
      console.error(err);
    }
  };
  
  // Resume the current run
  const resumeRun = async () => {
    if (!currentRun || !isPaused) return;
    
    try {
      await raidRunService.resumeRun(currentRun.id as number);
      setCurrentRun({ ...currentRun, status: 'in-progress' });
    } catch (err) {
      setError('Failed to resume run');
      console.error(err);
    }
  };
  
  // Complete the current run
  const completeRun = async () => {
    if (!currentRun) return;
    
    try {
      await raidRunService.completeRun(currentRun.id as number);
      
      // Update the local state
      const updatedRun = await raidRunService.getById(currentRun.id as number);
      if (updatedRun) {
        setCurrentRun(updatedRun);
        setElapsedTime(updatedRun.totalTime || 0);
      }
      
      // Reset the current run after a delay
      setTimeout(() => {
        setCurrentRun(null);
        setCurrentWing(null);
        setCurrentSteps([]);
        setCompletedSteps([]);
      }, 3000);
    } catch (err) {
      setError('Failed to complete run');
      console.error(err);
    }
  };
  
  // Fail the current run
  const failRun = async () => {
    if (!currentRun) return;
    
    try {
      await raidRunService.failRun(currentRun.id as number);
      
      // Update the local state
      const updatedRun = await raidRunService.getById(currentRun.id as number);
      if (updatedRun) {
        setCurrentRun(updatedRun);
        setElapsedTime(updatedRun.totalTime || 0);
      }
      
      // Reset the current run after a delay
      setTimeout(() => {
        setCurrentRun(null);
        setCurrentWing(null);
        setCurrentSteps([]);
        setCompletedSteps([]);
      }, 3000);
    } catch (err) {
      setError('Failed to mark run as failed');
      console.error(err);
    }
  };
  
  // Record reaching a step
  const recordStep = async (stepId: number) => {
    if (!currentRun || !isRunning) return;
    
    try {
      await raidRunService.recordStep(currentRun.id as number, stepId);
      
      // Update the local state
      setCompletedSteps(prev => [...prev, stepId]);
      
      // Refresh the current run data
      const updatedRun = await raidRunService.getById(currentRun.id as number);
      if (updatedRun) {
        setCurrentRun(updatedRun);
      }
    } catch (err) {
      setError('Failed to record step');
      console.error(err);
    }
  };
  
  // Record a death
  const recordDeath = async (location: string, notes?: string) => {
    if (!currentRun || !isRunning) return;
    
    try {
      await raidRunService.recordDeath(currentRun.id as number, location, notes);
      
      // Refresh the current run data
      const updatedRun = await raidRunService.getById(currentRun.id as number);
      if (updatedRun) {
        setCurrentRun(updatedRun);
      }
    } catch (err) {
      setError('Failed to record death');
      console.error(err);
    }
  };
  
  // Update run notes
  const updateNotes = async (notes: string) => {
    if (!currentRun) return;
    
    try {
      await raidRunService.updateNotes(currentRun.id as number, notes);
      
      // Update the local state
      setCurrentRun({ ...currentRun, notes });
    } catch (err) {
      setError('Failed to update notes');
      console.error(err);
    }
  };
  
  // Add a new step to the current wing
  const addStep = async (wingId: number, name: string, description?: string): Promise<number | null> => {
    try {
      const stepId = await raidStepService.create({
        wingId,
        name,
        description: description || '',
        order: currentSteps.length + 1
      });
      
      // Refresh the current steps
      if (currentWing && currentWing.id === wingId) {
        const updatedSteps = await raidStepService.getByWingId(wingId);
        setCurrentSteps(updatedSteps);
      }
      
      return stepId;
    } catch (err) {
      setError('Failed to add step');
      console.error(err);
      return null;
    }
  };
  
  const value = {
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
  };
  
  return (
    <RaidTrackerContext.Provider value={value}>
      {children}
    </RaidTrackerContext.Provider>
  );
};