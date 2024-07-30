export function setupTagAdditionContainer() {
  let newTagName = "";
  const tagButtonContainer = document.getElementById("tagButtonContainer");
  const addTagInput = document.getElementById("addTagInput");
  const insertTagBtn = document.getElementById("insertTagBtn");
  const colorPicker = document.getElementById("colorPicker");
  addTagInput.addEventListener("input", (e) => {
    newTagName = e.target.value;
  });

  insertTagBtn.addEventListener("click", () => {
    if (newTagName.length > 0) {
      const buttonElement = createNewTag(newTagName, colorPicker.value);
      tagButtonContainer.append(buttonElement);
    }
  });
}

function createNewTag(name, color) {
  const buttonElement = document.createElement("button");
  buttonElement.className = "bg-blue-500 hover:bg-blue-600 rounded w-fit px-2";
  buttonElement.innerHTML = name;
  buttonElement.style.backgroundColor = color;
  return buttonElement;
}
