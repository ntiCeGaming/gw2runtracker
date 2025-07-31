// Script to force add Wing 8 to the database

function forceAddWing8() {
  console.log('Starting force add Wing 8 script...');
  
  // Open the database
  const request = indexedDB.open('RaidTrackerDatabase', 1);
  
  request.onerror = function(event) {
    console.error('Database error:', event.target.error);
  };
  
  request.onsuccess = function(event) {
    const db = event.target.result;
    console.log('Database opened successfully');
    
    // Check if the raidWings object store exists
    if (!db.objectStoreNames.contains('raidWings')) {
      console.error('raidWings object store not found');
      return;
    }
    
    // Start a transaction to read and update the raidWings data
    const transaction = db.transaction(['raidWings'], 'readwrite');
    const store = transaction.objectStore('raidWings');
    
    // Get all raid wings
    const getAllRequest = store.getAll();
    
    getAllRequest.onsuccess = function() {
      const wings = getAllRequest.result;
      console.log('Found ' + wings.length + ' raid wings');
      
      // Delete all wings (to reset the database)
      console.log('Deleting all wings...');
      store.clear().onsuccess = function() {
        console.log('All wings deleted');
        
        // Add all wings back including Wing 8
        const defaultRaidWings = [
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
        
        console.log('Adding wings back including Wing 8...');
        let addedCount = 0;
        
        for (const wing of defaultRaidWings) {
          const addRequest = store.add(wing);
          
          addRequest.onsuccess = function() {
            addedCount++;
            console.log(`Added wing: ${wing.name}`);
            
            if (addedCount === defaultRaidWings.length) {
              console.log('All wings added successfully');
              console.log('Please refresh the page to see the changes');
              
              // Reload the page after a short delay
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }
          };
          
          addRequest.onerror = function(event) {
            console.error(`Error adding wing ${wing.name}:`, event.target.error);
          };
        }
      };
    };
    
    getAllRequest.onerror = function(event) {
      console.error('Error getting raid wings:', event.target.error);
    };
    
    transaction.oncomplete = function() {
      console.log('Transaction completed');
    };
  };
}

// Execute the function
forceAddWing8();