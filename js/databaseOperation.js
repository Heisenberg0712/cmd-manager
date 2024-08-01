import { getCopyToClipboardSvg } from "./svgutil.js";

let selectedTags = [];
export function setupCommandAdditionContainer(db) {
  const transaction = db.transaction(["CommandStore"], "readwrite");
  const commandStoreObject = transaction;
}

export function setupRequiredEventListeners(db) {
  let newCommandName = "";
  const addCommandInput = document.getElementById("addCommandInput");
  const addCommandBtn = document.getElementById("addCommandBtn");
  loadAllCommandForUi(db);
  addCommandInput.addEventListener("input", (e) => {
    newCommandName = e.target.value;
  });
  addCommandBtn.addEventListener("click", () => {
    if (newCommandName.length > 0) {
      addCommand(db, newCommandName);
    }
  });
}

function loadAllCommandForUi(db) {
  const commandData = getAllCommandsFromDb(db);
  commandData.onsuccess = (event) => {
    const commandDataArray = commandData.result;
    for (var i = 0; i < commandDataArray.length; i++) {
      createCommandEntry(commandDataArray[i].command, commandDataArray[i].tags);
    }
  };
}

function getAllCommandsFromDb(db) {
  const transaction = db.transaction(["CommandStore"], "readonly");
  const commandStoreObject = transaction.objectStore("CommandStore");
  const commandData = commandStoreObject.getAll();
  return commandData;
}

export function setupTagAssignContainer() {
  const tagButtonContainer = document.getElementById("tagButtonContainer");
  tagButtonContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("tag-btn")) {
      const tagButton = event.target;
      const tagText = tagButton.textContent.trim();
      if (tagButton.classList.contains("selected")) {
        tagButton.classList.remove("selected");
        const indexToRemove = selectedTags.findIndex(
          (element) => element.tagText === tagText
        );

        if (indexToRemove !== -1) {
          selectedTags.splice(indexToRemove, 1);
        }
        searchViaTags();
      } else {
        tagButton.classList.add("selected");
        selectedTags.push({
          tagText: tagText,
          color: tagButton.style.backgroundColor,
        });
        //console.log(event.target.style);
        searchViaTags();
      }
      console.log(selectedTags);
    }
  });
}

function searchViaTags() {}

function addCommand(db, commandName) {
  commandName = commandName.trim();
  const transaction = db.transaction(["CommandStore"], "readwrite");
  const commandStoreObject = transaction.objectStore("CommandStore");
  const hash = calculateTagValue();
  const request = commandStoreObject.add({
    command: commandName,
    tags: selectedTags,
    tagValue: hash,
  });
  request.onsuccess = (e) => {
    createCommandEntry(commandName, selectedTags);
    console.log("Command stored successfuly");
  };
  request.onerror = (e) => {
    console.log("Command could not be added");
  };
}

function createCommandEntry(commandName, relatedTags) {
  const commandList = document.getElementById("commandList");
  const listItem = document.createElement("li");
  listItem.className = "box-content flex w-4/5 m-auto justify-between my-3";
  const commandSpan = document.createElement("span");
  commandSpan.classList = "w-1/2";
  commandSpan.innerHTML = commandName;
  listItem.append(commandSpan);
  const tagFlairDiv = document.createElement("div");
  tagFlairDiv.className = "tag-flair flex h-fit flex-wrap w-1/3";
  for (var i = 0; i < relatedTags.length; i++) {
    const tagFlair = document.createElement("span");
    tagFlair.className = "rounded w-fit px-2 m-1";
    tagFlair.style.backgroundColor = relatedTags[i].color;
    tagFlair.innerHTML = relatedTags[i].tagText;
    tagFlairDiv.append(tagFlair);
  }
  listItem.append(tagFlairDiv);
  listItem.append(getCopyToClipboardSvg());
  commandList.append(listItem);
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
