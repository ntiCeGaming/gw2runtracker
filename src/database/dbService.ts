import db, { RaidWing, RaidStep, RaidRun, DeathEvent } from './db';

// RaidWing operations
export const raidWingService = {
  getAll: async (): Promise<RaidWing[]> => {
    return await db.raidWings.toArray();
  },
  
  getById: async (id: number): Promise<RaidWing | undefined> => {
    return await db.raidWings.get(id);
  },
  
  add: async (raidWing: RaidWing): Promise<number> => {
    return await db.raidWings.add(raidWing);
  },
  
  update: async (id: number, changes: Partial<RaidWing>): Promise<number> => {
    return await db.raidWings.update(id, changes);
  },
  
  delete: async (id: number): Promise<void> => {
    // First delete all related steps
    await db.raidSteps.where('raidWingId').equals(id).delete();
    // Then delete the wing
    await db.raidWings.delete(id);
  }
};

// RaidStep operations
export const raidStepService = {
  getAllForWing: async (wingId: number): Promise<RaidStep[]> => {
    return await db.raidSteps
      .where('raidWingId')
      .equals(wingId)
      .sortBy('order');
  },
  
  getById: async (id: number): Promise<RaidStep | undefined> => {
    return await db.raidSteps.get(id);
  },
  
  add: async (raidStep: RaidStep): Promise<number> => {
    return await db.raidSteps.add(raidStep);
  },
  
  update: async (id: number, changes: Partial<RaidStep>): Promise<number> => {
    return await db.raidSteps.update(id, changes);
  },
  
  delete: async (id: number): Promise<void> => {
    await db.raidSteps.delete(id);
  },
  
  reorderSteps: async (wingId: number, newOrder: number[]): Promise<void> => {
    await db.transaction('rw', db.raidSteps, async () => {
      const steps = await db.raidSteps
        .where('raidWingId')
        .equals(wingId)
        .toArray();
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const newPosition = newOrder.indexOf(step.id as number);
        if (newPosition !== -1 && newPosition !== step.order) {
          await db.raidSteps.update(step.id as number, { order: newPosition });
        }
      }
    });
  }
};

// RaidRun operations
export const raidRunService = {
  getAll: async (): Promise<RaidRun[]> => {
    return await db.raidRuns.toArray();
  },
  
  getAllForWing: async (wingId: number): Promise<RaidRun[]> => {
    return await db.raidRuns
      .where('raidWingId')
      .equals(wingId)
      .reverse() // Most recent first
      .toArray();
  },
  
  getById: async (id: number): Promise<RaidRun | undefined> => {
    return await db.raidRuns.get(id);
  },
  
  getActiveRun: async (): Promise<RaidRun | undefined> => {
    return await db.raidRuns
      .where('status')
      .equals('in-progress')
      .or('status')
      .equals('paused')
      .first();
  },
  
  startRun: async (wingId: number, teamMembers?: string[], patch?: string): Promise<number> => {
    const newRun: RaidRun = {
      raidWingId: wingId,
      startTime: new Date(),
      status: 'in-progress',
      steps: [],
      deaths: [],
      teamMembers,
      patch
    };
    
    return await db.raidRuns.add(newRun);
  },
  
  pauseRun: async (id: number): Promise<void> => {
    await db.raidRuns.update(id, { status: 'paused' });
  },
  
  resumeRun: async (id: number): Promise<void> => {
    await db.raidRuns.update(id, { status: 'in-progress' });
  },
  
  completeRun: async (id: number): Promise<void> => {
    const run = await db.raidRuns.get(id);
    if (run) {
      const endTime = new Date();
      const totalTime = endTime.getTime() - run.startTime.getTime();
      
      await db.raidRuns.update(id, {
        status: 'completed',
        endTime,
        totalTime
      });
    }
  },
  
  failRun: async (id: number): Promise<void> => {
    const run = await db.raidRuns.get(id);
    if (run) {
      const endTime = new Date();
      const totalTime = endTime.getTime() - run.startTime.getTime();
      
      await db.raidRuns.update(id, {
        status: 'failed',
        endTime,
        totalTime
      });
    }
  },
  
  recordStep: async (runId: number, stepId: number): Promise<void> => {
    const run = await db.raidRuns.get(runId);
    if (run) {
      const now = new Date();
      const reachedAt = now.getTime() - run.startTime.getTime();
      
      // Add the step to the run's steps array
      const updatedSteps = [...run.steps, { stepId, reachedAt }];
      
      await db.raidRuns.update(runId, { steps: updatedSteps });
    }
  },
  
  recordDeath: async (runId: number, location: string, notes?: string): Promise<number> => {
    const run = await db.raidRuns.get(runId);
    if (!run) throw new Error('Run not found');
    
    const now = new Date();
    const timestamp = now.getTime() - run.startTime.getTime();
    
    const deathId = await db.deathEvents.add({
      runId,
      timestamp,
      location,
      notes
    });
    
    // Update the run's deaths array
    const updatedDeaths = [...run.deaths, deathId];
    await db.raidRuns.update(runId, { deaths: updatedDeaths });
    
    return deathId;
  },
  
  updateNotes: async (runId: number, notes: string): Promise<void> => {
    await db.raidRuns.update(runId, { notes });
  },
  
  getAllPatches: async (): Promise<string[]> => {
    const runs = await db.raidRuns.toArray();
    const patches = [...new Set(runs.map(run => run.patch).filter(Boolean))] as string[];
    return patches.sort().reverse(); // Most recent patches first
  },
  
  getAllByPatch: async (patch: string): Promise<RaidRun[]> => {
    return await db.raidRuns
      .where('patch')
      .equals(patch)
      .reverse() // Most recent first
      .toArray();
  },
  
  updatePatch: async (runId: number, patch: string): Promise<void> => {
    await db.raidRuns.update(runId, { patch });
  },
  
  delete: async (id: number): Promise<void> => {
    // First delete all related death events
    await db.deathEvents.where('runId').equals(id).delete();
    // Then delete the run
    await db.raidRuns.delete(id);
  }
};

// DeathEvent operations
export const deathEventService = {
  getAllForRun: async (runId: number): Promise<DeathEvent[]> => {
    return await db.deathEvents
      .where('runId')
      .equals(runId)
      .sortBy('timestamp');
  },
  
  getById: async (id: number): Promise<DeathEvent | undefined> => {
    return await db.deathEvents.get(id);
  },
  
  update: async (id: number, changes: Partial<DeathEvent>): Promise<number> => {
    return await db.deathEvents.update(id, changes);
  },
  
  delete: async (id: number, runId: number): Promise<void> => {
    await db.deathEvents.delete(id);
    
    // Update the run's deaths array
    const run = await db.raidRuns.get(runId);
    if (run) {
      const updatedDeaths = run.deaths.filter(deathId => deathId !== id);
      await db.raidRuns.update(runId, { deaths: updatedDeaths });
    }
  }
};

// Analytics operations
export const analyticsService = {
  getAverageRunTime: async (wingId: number): Promise<number | null> => {
    const runs = await db.raidRuns
      .where('raidWingId')
      .equals(wingId)
      .and(run => run.status === 'completed')
      .toArray();
    
    if (runs.length === 0) return null;
    
    const totalTime = runs.reduce((sum, run) => sum + (run.totalTime || 0), 0);
    return totalTime / runs.length;
  },
  
  getSuccessRate: async (wingId: number): Promise<number | null> => {
    const totalRuns = await db.raidRuns
      .where('raidWingId')
      .equals(wingId)
      .and(run => run.status === 'completed' || run.status === 'failed')
      .count();
    
    if (totalRuns === 0) return null;
    
    const completedRuns = await db.raidRuns
      .where('raidWingId')
      .equals(wingId)
      .and(run => run.status === 'completed')
      .count();
    
    return (completedRuns / totalRuns) * 100;
  },
  
  getAverageDeathsPerRun: async (wingId: number): Promise<number | null> => {
    const runs = await db.raidRuns
      .where('raidWingId')
      .equals(wingId)
      .toArray();
    
    if (runs.length === 0) return null;
    
    const totalDeaths = runs.reduce((sum, run) => sum + run.deaths.length, 0);
    return totalDeaths / runs.length;
  },
  
  getStepTimings: async (runId: number): Promise<Array<{ stepId: number, time: number }>> => {
    const run = await db.raidRuns.get(runId);
    if (!run || run.steps.length === 0) return [];
    
    const result = [];
    for (let i = 0; i < run.steps.length; i++) {
      const currentStep = run.steps[i];
      const nextStep = run.steps[i + 1];
      
      const startTime = currentStep.reachedAt;
      const endTime = nextStep ? nextStep.reachedAt : (run.totalTime || 0);
      
      result.push({
        stepId: currentStep.stepId,
        time: endTime - startTime
      });
    }
    
    return result;
  },
  
  getDeathHotspots: async (wingId: number): Promise<Record<string, number>> => {
    const runs = await db.raidRuns
      .where('raidWingId')
      .equals(wingId)
      .toArray();
    
    const deathLocations: Record<string, number> = {};
    
    for (const run of runs) {
      const deaths = await db.deathEvents
        .where('runId')
        .equals(run.id as number)
        .toArray();
      
      for (const death of deaths) {
        deathLocations[death.location] = (deathLocations[death.location] || 0) + 1;
      }
    }
    
    return deathLocations;
  },
  
  getProgressOverTime: async (wingId: number): Promise<Array<{ date: string, time: number }>> => {
    const runs = await db.raidRuns
      .where('raidWingId')
      .equals(wingId)
      .and(run => run.status === 'completed')
      .sortBy('startTime');
    
    return runs.map(run => ({
      date: run.startTime.toISOString().split('T')[0],
      time: run.totalTime || 0
    }));
  }
};