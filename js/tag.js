export function setupTagAdditionContainer(db) {
  let newTagName = "";
  const tagButtonContainer = document.getElementById("tagButtonContainer");
  const addTagInput = document.getElementById("addTagInput");
  const insertTagBtn = document.getElementById("insertTagBtn");
  const colorPicker = document.getElementById("colorPicker");
  loadAllTagOnUi(db, tagButtonContainer);
  addTagInput.addEventListener("input", (e) => {
    newTagName = e.target.value;
  });

  insertTagBtn.addEventListener("click", () => {
    if (newTagName.length > 0) {
      const buttonElement = addTagToTagStore(
        db,
        newTagName,
        colorPicker.value,
        tagButtonContainer
      );
      // const buttonElement = createNewTag(newTagName, colorPicker.value);
    }
  });
}

function loadAllTagOnUi(db, tagButtonContainer) {
  const tagData = getAllTagsFromTagStore(db);
  tagData.onsuccess = (event) => {
    const tagArray = tagData.result;
    for (var i = 0; i < tagArray.length; i++) {
      const buttonElement = createNewTag(tagArray[i].tag, tagArray[i].color);
      tagButtonContainer.append(buttonElement);
    }
  };
}

function createNewTag(name, color) {
  const buttonElement = document.createElement("button");
  buttonElement.className =
    "tag-btn bg-blue-500 hover:bg-blue-600 rounded w-fit px-2";
  buttonElement.innerHTML = name;
  buttonElement.style.backgroundColor = color;
  return buttonElement;
}

export function addTagToTagStore(db, name, color, tagButtonContainer) {
  name = name.toLowerCase();
  const transaction = db.transaction(["TagStore"], "readwrite");
  const tagStoreObject = transaction.objectStore("TagStore");
  const request = tagStoreObject.add({
    tag: name,
    color: color,
  });
  request.onsuccess = (e) => {
    console.log("New tag successfully added");
  };
  request.onerror = (e) => {
    console.log(e);
  };
  transaction.oncomplete = (event) => {
    const buttonElement = createNewTag(name, color);
    tagButtonContainer.append(buttonElement);
    getAllTagsFromTagStore(db);
  };
  transaction.onerror = (error) => {
    console.log("New tag could not be added: transaction failed");
  };
}

export function getAllTagsFromTagStore(db) {
  const transaction = db.transaction(["TagStore"], "readonly");
  const tagStoreObject = transaction.objectStore("TagStore");
  const tagData = tagStoreObject.getAll();
  return tagData;
  tagData.onsuccess = (event) => {
    return tagData.result;
  };
  tagData.onerror = (event) => {
    console.log("Could not fetch tag list from db");
    return [];
  };
}
