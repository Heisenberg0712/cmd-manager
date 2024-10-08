import { getCopyToClipboardSvg } from "./svgutil.js";

let selectedTags = [];
let commandsList = [];
let filteredCommandsListViaTag = [];
let filteredCommandsListViaText = [];
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
    searchViaText(newCommandName);
  });
  addCommandBtn.addEventListener("click", async () => {
    if (newCommandName.length > 0) {
      addCommand(db, newCommandName);
      addCommandInput.value = "";
      removeSelectedFromTags();
      await loadAllCommandForUi(db);
    }
  });
}

async function loadAllCommandForUi(db) {
  const commandData = await getAllCommandsFromDb(db);
  commandsList = commandData;
  showCommandsFromCommandList();
}

function showCommandsFromCommandList() {
  clearAllCommandEntry();
  let commandsToBeShown = getCommandsToBeShown();
  for (var i = 0; i < commandsToBeShown.length; i++) {
    createCommandEntry(commandsToBeShown[i].command, commandsToBeShown[i].tags);
  }
  attachCopyToClipboardEventListener();
}

function getCommandsToBeShown() {
  if (
    filteredCommandsListViaTag.length == 0 &&
    filteredCommandsListViaText.length == 0
  ) {
    return commandsList;
  }
  if (filteredCommandsListViaTag.length == 0) {
    return filteredCommandsListViaText;
  }
  if (filteredCommandsListViaText.length == 0) {
    return filteredCommandsListViaTag;
  }
  return commandsList.filter((commandInfo) => {
    return (
      filteredCommandsListViaText.some(
        (viaText) => viaText.command === commandInfo.command
      ) &&
      filteredCommandsListViaTag.some(
        (viaTag) => viaTag.command === commandInfo.command
      )
    );
  });
}

async function getAllCommandsFromDb(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["CommandStore"], "readonly");
    const commandStoreObject = transaction.objectStore("CommandStore");
    const commandData = commandStoreObject.getAll();
    commandData.onsuccess = function (event) {
      resolve(commandData.result);
    };
    commandData.onerror = function (event) {
      reject(commandData.result);
    };
  });
}
function removeSelectedFromTags() {
  const tagButtonContainer = document.getElementById("tagButtonContainer");
  const tagButtonList = tagButtonContainer.children;
  for (var i = 0; i < tagButtonList.length; i++) {
    let tagButton = tagButtonList[i];
    tagButton.classList.remove("selected");
  }
  selectedTags = [];
  filteredCommandsListViaTag = [];
  filteredCommandsListViaText = [];
  // const tagButtonList = tagButtonContainer.
}

export function attachCopyToClipboardEventListener() {
  const commandListUL = document.getElementById("commandList");
  const listItemsArray = commandListUL.children;
  for (var i = 0; i < listItemsArray.length; i++) {
    if (listItemsArray[i].nodeName === "LI") {
      const listItems = listItemsArray[i].children;
      for (var k = 0; k < listItems.length; k++) {
        if (listItems[k].nodeName === "svg") {
          const svgElement = listItems[k];
          svgElement.addEventListener("click", () => {
            let textToBeCopiedElement = listItems[0];

            navigator.clipboard.writeText(textToBeCopiedElement.textContent);
            alert("Text copied");
          });
        }
      }
    }
  }
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
        searchViaTags(selectedTags);
      } else {
        tagButton.classList.add("selected");
        selectedTags.push({
          tagText: tagText,
          color: tagButton.style.backgroundColor,
        });

        searchViaTags(selectedTags);
      }
    }
  });
}

function searchViaTags(selectedTagsIn) {
  if (selectedTagsIn.length == 0) {
    filteredCommandsListViaTag = [];
    showCommandsFromCommandList();
    return;
  }
  let relevantCommandsList = [];
  for (var i = 0; i < selectedTagsIn.length; i++) {
    const tagInfo = selectedTagsIn[i];
    const filteredCommands = commandsList.filter((commandInfo) => {
      var exist = false;
      for (var i = 0; i < commandInfo.tags.length; i++) {
        if (commandInfo.tags[i].tagText === tagInfo.tagText) {
          let index = relevantCommandsList.findIndex(
            (relevantCommandElement) =>
              relevantCommandElement.command === commandInfo.command
          );
          exist = index == -1 ? true : false;
          break;
        }
      }
      return exist;
    });
    relevantCommandsList = [...relevantCommandsList, ...filteredCommands];
  }
  filteredCommandsListViaTag = relevantCommandsList;
  showCommandsFromCommandList();
}

function searchViaText(inputValue) {
  if (inputValue.length == 0) {
    filteredCommandsListViaText = [];
    showCommandsFromCommandList();
    return;
  }
  filteredCommandsListViaText = commandsList.filter((commandInfo) => {
    return commandInfo.command.includes(inputValue);
  });

  showCommandsFromCommandList();
}

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
    loadAllCommandForUi(db);
    console.log("Command stored successfuly");
  };
  request.onerror = (e) => {
    console.log("Command could not be added");
  };
}

function createCommandEntry(commandName, relatedTags) {
  const commandListUL = document.getElementById("commandList");

  const listItem = document.createElement("li");
  listItem.className =
    "box-content flex w-4/5 m-auto justify-between my-3 px-2 border rounded border-neutral-700 hover:bg-neutral-700 hover:border-neutral-500";
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
  commandListUL.prepend(listItem);
}

function clearAllCommandEntry() {
  const commandListULTag = document.getElementById("commandList");
  while (commandListULTag.firstChild) {
    commandListULTag.removeChild(commandListULTag.firstChild);
  }
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
