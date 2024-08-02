import { setupDatabase } from "./database.js";
import {
  setupRequiredEventListeners,
  setupTagAssignContainer,
} from "./utilityOperation.js";
import { setupTagAdditionContainer } from "./tag.js";

console.log("Hello world");

document.addEventListener("DOMContentLoaded", () => {
  console.log("as");
  const databaseConnection = setupDatabase();

  databaseConnection.onsuccess = (event) => {
    console.log("success");
    const db = event.target.result;
    setupTagAdditionContainer(db);
    setupTagAssignContainer();
    setupRequiredEventListeners(db);
  };
});
