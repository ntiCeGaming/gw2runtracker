// Script to update Wing 8 in the IndexedDB database

function updateDatabase() {
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
      console.log('All raid wings:', wings);
      
      // Find Wing 8
      const wing8Index = wings.findIndex(wing => wing.name.includes('Wing 8'));
      
      if (wing8Index !== -1) {
        const wing8 = wings[wing8Index];
        console.log('Found Wing 8:', wing8);
        
        // Update Wing 8 with correct information
        const updatedWing8 = {
          ...wing8,
          name: 'Mount Balrior (Wing 8)',
          description: 'The eighth raid wing, featuring Greer, Decima, and Ura.',
          bosses: ['Greer', 'Decima', 'Ura']
        };
        
        // Update the wing in the database
        const updateRequest = store.put(updatedWing8);
        
        updateRequest.onsuccess = function() {
          console.log('Wing 8 updated successfully');
        };
        
        updateRequest.onerror = function(event) {
          console.error('Error updating Wing 8:', event.target.error);
        };
      } else {
        console.error('Wing 8 not found in the database');
        
        // Add Wing 8 if it doesn't exist
        const newWing8 = {
          name: 'Mount Balrior (Wing 8)',
          description: 'The eighth raid wing, featuring Greer, Decima, and Ura.',
          bosses: ['Greer', 'Decima', 'Ura'],
          imageUrl: 'https://wiki.guildwars2.com/images/thumb/5/5f/Dragonstorm_loading_screen.jpg/300px-Dragonstorm_loading_screen.jpg'
        };
        
        const addRequest = store.add(newWing8);
        
        addRequest.onsuccess = function() {
          console.log('Wing 8 added successfully');
        };
        
        addRequest.onerror = function(event) {
          console.error('Error adding Wing 8:', event.target.error);
        };
      }
    };
    
    getAllRequest.onerror = function(event) {
      console.error('Error getting raid wings:', event.target.error);
    };
    
    transaction.oncomplete = function() {
      console.log('Transaction completed');
    };
  };
}

// Execute the update
updateDatabase();