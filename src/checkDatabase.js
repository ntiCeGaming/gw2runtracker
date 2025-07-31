// Script to check the contents of the IndexedDB database

function checkDatabase() {
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
    
    // Start a transaction to read the raidWings data
    const transaction = db.transaction(['raidWings'], 'readonly');
    const store = transaction.objectStore('raidWings');
    
    // Get all raid wings
    const getAllRequest = store.getAll();
    
    getAllRequest.onsuccess = function() {
      const wings = getAllRequest.result;
      console.log('All raid wings:', wings);
      
      // Check if Wing 8 exists
      const wing8 = wings.find(wing => wing.name.includes('Wing 8'));
      if (wing8) {
        console.log('Wing 8 found:', wing8);
      } else {
        console.error('Wing 8 not found in the database');
      }
    };
    
    getAllRequest.onerror = function(event) {
      console.error('Error getting raid wings:', event.target.error);
    };
  };
}

// Execute the check
checkDatabase();