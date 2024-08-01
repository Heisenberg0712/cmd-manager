let selectedTags = [];
export function setupCommandAdditionContainer(db) {
  const transaction = db.transaction(["CommandStore"], "readwrite");
  const commandStoreObject = transaction;
}

export function setupRequiredEventListeners(db) {
  let newCommandName = "";
  const addCommandInput = document.getElementById("addCommandInput");
  const addCommandBtn = document.getElementById("addCommandBtn");
  addCommandInput.addEventListener("input", (e) => {
    newCommandName = e.target.value;
  });
  addCommandBtn.addEventListener("click", () => {
    if (newCommandName.length > 0) {
      addCommand(db, newCommandName);
    }
  });
}

export function setupTagAssignContainer() {
  const tagButtonContainer = document.getElementById("tagButtonContainer");
  tagButtonContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("tag-btn")) {
      const tagButton = event.target;
      const tagText = tagButton.textContent.trim();
      if (tagButton.classList.contains("selected")) {
        tagButton.classList.remove("selected");
        const indexToRemove = selectedTags.indexOf(tagText);
        if (indexToRemove !== -1) {
          selectedTags.splice(indexToRemove, 1);
        }
        searchViaTags();
      } else {
        tagButton.classList.add("selected");
        selectedTags.push(tagText);
        searchViaTags();
      }
      console.log(selectedTags);
    }
  });
}

function searchViaTags() {}

function addCommand(db, commandName) {
  const transaction = db.transaction(["CommandStore"], "readwrite");
  const commandStoreObject = transaction.objectStore("CommandStore");
  const hash = calculateTagValue();
  const request = commandStoreObject.add({
    command: commandName,
    tags: selectedTags,
    tagValue: hash,
  });
  request.onsuccess = (e) => {
    console.log("Command stored successfuly");
  };
  request.onerror = (e) => {
    console.log("Command could not be added");
  };
}

function calculateTagValue() {
  if (selectedTags.length == 0) {
    return 0;
  }
  const combinedTags = selectedTags.join("_");
  const hash = combinedTags
    .split("")
    .reduce((prev, currElement) => prev + currElement.charCodeAt(0), 0);
  return hash;
}
