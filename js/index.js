import { setupDatabase } from "./database.js";
import {
  setupRequiredEventListeners,
  setupTagAssignContainer,
} from "./utilityOperation.js";
import { setupTagAdditionContainer } from "./tag.js";

document.addEventListener("DOMContentLoaded", () => {
  const databaseConnection = setupDatabase();

  databaseConnection.onsuccess = (event) => {
    const db = event.target.result;
    setupTagAdditionContainer(db);
    setupTagAssignContainer();
    setupRequiredEventListeners(db);
  };
});
