import Dexie, { Table } from 'dexie';

// Define interfaces for our database tables
export interface User {
  id?: number;
  username: string;
  password: string; // In a real app, this would be hashed
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRun {
  id?: number;
  userId: number;
  runId: number;
  createdAt: Date;
}

export interface RaidWing {
  id?: number;
  name: string;
  description: string;
  bosses: string[];
  imageUrl?: string;
}

export interface RaidStep {
  id?: number;
  name: string;
  description?: string;
  order: number;
  raidWingId: number;
}

export interface DeathEvent {
  id?: number;
  timestamp: number; // milliseconds since run start
  location: string;
  notes?: string;
  runId: number;
}

export interface RaidRun {
  id?: number;
  raidWingId: number;
  startTime: Date;
  endTime?: Date;
  totalTime?: number; // in milliseconds
  status: 'in-progress' | 'completed' | 'failed' | 'paused';
  steps: Array<{
    stepId: number;
    reachedAt: number; // milliseconds since run start
  }>;
  deaths: number[];
  notes?: string;
  teamMembers?: string[];
  patch?: string; // Game patch version for organizing history
}

// Define the database class
class RaidTrackerDatabase extends Dexie {
  users!: Table<User, number>;
  userRuns!: Table<UserRun, number>;
  raidWings!: Table<RaidWing, number>;
  raidSteps!: Table<RaidStep, number>;
  deathEvents!: Table<DeathEvent, number>;
  raidRuns!: Table<RaidRun, number>;

  constructor() {
    super('RaidTrackerDatabase');
    this.version(2).stores({
      users: '++id, username',
      userRuns: '++id, userId, runId',
      raidWings: '++id, name',
      raidSteps: '++id, raidWingId, order',
      deathEvents: '++id, runId, timestamp',
      raidRuns: '++id, raidWingId, startTime, status'
    });
  }

  // Initialize with default raid wings and steps
  async initializeDefaultData() {
    const raidWingsCount = await this.raidWings.count();
    
    if (raidWingsCount === 0) {
      // Add default raid wings
      const defaultRaidWings: RaidWing[] = [
        {
          name: 'Spirit Vale (Wing 1)',
          description: 'The first raid wing in Guild Wars 2, featuring Vale Guardian, Gorseval, and Sabetha.',
          bosses: ['Vale Guardian', 'Gorseval the Multifarious', 'Sabetha the Saboteur'],
          imageUrl: 'https://wiki.guildwars2.com/images/thumb/5/54/Spirit_Vale_loading_screen.jpg/300px-Spirit_Vale_loading_screen.jpg'
        },
        {
          name: 'Salvation Pass (Wing 2)',
          description: 'The second raid wing, featuring Slothasor, Bandit Trio, and Matthias Gabrel.',
          bosses: ['Slothasor', 'Bandit Trio', 'Matthias Gabrel'],
          imageUrl: 'https://wiki.guildwars2.com/images/thumb/5/5a/Salvation_Pass_loading_screen.jpg/300px-Salvation_Pass_loading_screen.jpg'
        },
        {
          name: 'Stronghold of the Faithful (Wing 3)',
          description: 'The third raid wing, featuring Escort, Keep Construct, Twisted Castle, and Xera.',
          bosses: ['Escort', 'Keep Construct', 'Xera'],
          imageUrl: 'https://wiki.guildwars2.com/images/thumb/b/b8/Stronghold_of_the_Faithful_loading_screen.jpg/300px-Stronghold_of_the_Faithful_loading_screen.jpg'
        },
        {
          name: 'Bastion of the Penitent (Wing 4)',
          description: 'The fourth raid wing, featuring Cairn, Mursaat Overseer, Samarog, and Deimos.',
          bosses: ['Cairn the Indomitable', 'Mursaat Overseer', 'Samarog', 'Deimos'],
          imageUrl: 'https://wiki.guildwars2.com/images/thumb/0/04/Bastion_of_the_Penitent_loading_screen.jpg/300px-Bastion_of_the_Penitent_loading_screen.jpg'
        },
        {
          name: 'Hall of Chains (Wing 5)',
          description: 'The fifth raid wing, featuring Soulless Horror, River of Souls, Statues of Grenth, and Dhuum.',
          bosses: ['Soulless Horror', 'River of Souls', 'Statues of Grenth', 'Dhuum'],
          imageUrl: 'https://wiki.guildwars2.com/images/thumb/4/4f/Hall_of_Chains_loading_screen.jpg/300px-Hall_of_Chains_loading_screen.jpg'
        },
        {
          name: 'Mythwright Gambit (Wing 6)',
          description: 'The sixth raid wing, featuring Conjured Amalgamate, Twin Largos, and Qadim.',
          bosses: ['Conjured Amalgamate', 'Twin Largos', 'Qadim'],
          imageUrl: 'https://wiki.guildwars2.com/images/thumb/f/f2/Mythwright_Gambit_loading_screen.jpg/300px-Mythwright_Gambit_loading_screen.jpg'
        },
        {
          name: 'The Key of Ahdashim (Wing 7)',
          description: 'The seventh raid wing, featuring Cardinal Adina, Cardinal Sabir, and Qadim the Peerless.',
          bosses: ['Cardinal Adina', 'Cardinal Sabir', 'Qadim the Peerless'],
          imageUrl: 'https://wiki.guildwars2.com/images/thumb/8/8d/The_Key_of_Ahdashim_loading_screen.jpg/300px-The_Key_of_Ahdashim_loading_screen.jpg'
        },
        {
          name: 'Mount Balrior (Wing 8)',
          description: 'The eighth raid wing, featuring Greer, Decima, and Ura.',
          bosses: ['Greer', 'Decima', 'Ura'],
          imageUrl: 'https://wiki.guildwars2.com/images/thumb/5/5f/Dragonstorm_loading_screen.jpg/300px-Dragonstorm_loading_screen.jpg'
        }
      ];

      // Add raid wings to database
      for (const wing of defaultRaidWings) {
        const wingId = await this.raidWings.add(wing);
        
        // Add steps for each wing
        if (wing.name === 'Spirit Vale (Wing 1)') {
          await this.raidSteps.bulkAdd([
            { name: 'Start', description: 'Beginning of the raid', order: 0, raidWingId: wingId },
            { name: 'Vale Guardian', description: 'First boss', order: 1, raidWingId: wingId },
            { name: 'Spirit Woods', description: 'Traverse the spirit woods', order: 2, raidWingId: wingId },
            { name: 'Gorseval', description: 'Second boss', order: 3, raidWingId: wingId },
            { name: 'Sabetha', description: 'Final boss', order: 4, raidWingId: wingId }
          ]);
        } else if (wing.name === 'Salvation Pass (Wing 2)') {
          await this.raidSteps.bulkAdd([
            { name: 'Start', description: 'Beginning of the raid', order: 0, raidWingId: wingId },
            { name: 'Slothasor', description: 'First boss', order: 1, raidWingId: wingId },
            { name: 'Bandit Trio', description: 'Second encounter', order: 2, raidWingId: wingId },
            { name: 'Matthias Gabrel', description: 'Final boss', order: 3, raidWingId: wingId }
          ]);
        } else if (wing.name === 'Stronghold of the Faithful (Wing 3)') {
          await this.raidSteps.bulkAdd([
            { name: 'Start', description: 'Beginning of the raid', order: 0, raidWingId: wingId },
            { name: 'Escort', description: 'Escort encounter', order: 1, raidWingId: wingId },
            { name: 'Keep Construct', description: 'Second boss', order: 2, raidWingId: wingId },
            { name: 'Xera', description: 'Final boss', order: 3, raidWingId: wingId }
          ]);
        } else if (wing.name === 'Bastion of the Penitent (Wing 4)') {
          await this.raidSteps.bulkAdd([
            { name: 'Start', description: 'Beginning of the raid', order: 0, raidWingId: wingId },
            { name: 'Cairn the Indomitable', description: 'First boss', order: 1, raidWingId: wingId },
            { name: 'Mursaat Overseer', description: 'Second boss', order: 2, raidWingId: wingId },
            { name: 'Samarog', description: 'Third boss', order: 3, raidWingId: wingId },
            { name: 'Deimos', description: 'Final boss', order: 4, raidWingId: wingId }
          ]);
        } else if (wing.name === 'Hall of Chains (Wing 5)') {
          await this.raidSteps.bulkAdd([
            { name: 'Start', description: 'Beginning of the raid', order: 0, raidWingId: wingId },
            { name: 'Soulless Horror', description: 'First boss', order: 1, raidWingId: wingId },
            { name: 'River of Souls', description: 'Second encounter', order: 2, raidWingId: wingId },
            { name: 'Statues of Grenth', description: 'Third encounter', order: 3, raidWingId: wingId },
            { name: 'Dhuum', description: 'Final boss', order: 4, raidWingId: wingId }
          ]);
        } else if (wing.name === 'Mythwright Gambit (Wing 6)') {
          await this.raidSteps.bulkAdd([
            { name: 'Start', description: 'Beginning of the raid', order: 0, raidWingId: wingId },
            { name: 'Conjured Amalgamate', description: 'First boss', order: 1, raidWingId: wingId },
            { name: 'Twin Largos', description: 'Second boss', order: 2, raidWingId: wingId },
            { name: 'Qadim', description: 'Final boss', order: 3, raidWingId: wingId }
          ]);
        } else if (wing.name === 'The Key of Ahdashim (Wing 7)') {
          await this.raidSteps.bulkAdd([
            { name: 'Start', description: 'Beginning of the raid', order: 0, raidWingId: wingId },
            { name: 'Cardinal Adina', description: 'First boss', order: 1, raidWingId: wingId },
            { name: 'Cardinal Sabir', description: 'Second boss', order: 2, raidWingId: wingId },
            { name: 'Qadim the Peerless', description: 'Final boss', order: 3, raidWingId: wingId }
          ]);
        } else if (wing.name === 'Mount Balrior (Wing 8)') {
          await this.raidSteps.bulkAdd([
            { name: 'Start', description: 'Beginning of the raid', order: 0, raidWingId: wingId },
            { name: 'Greer', description: 'First boss', order: 1, raidWingId: wingId },
            { name: 'Decima', description: 'Second boss', order: 2, raidWingId: wingId },
            { name: 'Ura', description: 'Final boss', order: 3, raidWingId: wingId }
          ]);
        }
      }
    }
  }
}

// Create a singleton instance
const db = new RaidTrackerDatabase();

// Function to initialize the database
export async function initializeDatabase() {
  try {
    await db.open();
    await db.initializeDefaultData();
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Export the database instance
export default db;