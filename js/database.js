let db = null;

export function setupDatabase() {
  const databaseConnection = window.indexedDB.open("cmdManager", 1);

  let database;
  databaseConnection.onupgradeneeded = (event) => {
    database = event.target.result;
    if (event.target.result.version == 1) {
      createCommandStore(database);
      createTagStore(database);
    }
  };
  return databaseConnection;
}

function createCommandStore(database) {
  const commandManagerObjectStore = database.createObjectStore("CommandStore", {
    autoIncrement: true,
  });
  commandManagerObjectStore.createIndex("command", "command", {
    unique: true,
  });
  commandManagerObjectStore.createIndex("tagValue", "tagValue", {
    unique: false,
  });
}
function createTagStore(database) {
  const tagStore = database.createObjectStore("TagStore", {
    autoIncrement: true,
  });
  tagStore.createIndex("tag", "tag", {
    unique: true,
  });
}
