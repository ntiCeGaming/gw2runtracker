// Script to reset the IndexedDB database

function resetDatabase() {
  // Get all IndexedDB databases
  indexedDB.databases().then(databases => {
    // Find our database
    const ourDb = databases.find(db => db.name === 'RaidTrackerDatabase');
    
    if (ourDb) {
      console.log('Found RaidTrackerDatabase, deleting...');
      // Delete the database
      const deleteRequest = indexedDB.deleteDatabase('RaidTrackerDatabase');
      
      deleteRequest.onsuccess = function() {
        console.log('Database deleted successfully');
        // Reload the page to reinitialize the database
        window.location.reload();
      };
      
      deleteRequest.onerror = function() {
        console.error('Could not delete database');
      };
      
      deleteRequest.onblocked = function() {
        console.warn('Database deletion was blocked');
        alert('Please close all other tabs with this site open and try again.');
      };
    } else {
      console.log('RaidTrackerDatabase not found');
    }
  });
}

// Execute the reset
resetDatabase();