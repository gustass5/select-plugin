let disableButton,
  toggleColor,
  toggleBorder,
  colorPicker,
  borderColorPicker,
  borderStyle;

let enabled, colorEnabled;

document.addEventListener(
  "DOMContentLoaded",
  () => {
    disableButton = document.getElementById("disablePlugin");
    toggleColor = document.getElementById("toggleColor");
    toggleBorder = document.getElementById("toggleBorder");
    colorPicker = document.getElementById("changeColor");
    borderColorPicker = document.getElementById("changeBorderColor");
    borderStyle = document.getElementById("changeBorderType");

    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
      chrome.tabs.sendMessage(
        tabs[0].id,
        { name: "requestStatus" },
        (response) => {
          enabled = response.enabled;
          colorEnabled = response.color !== "";
          toggleColor.value = colorEnabled ? "1" : "0";
          disableButton.innerHTML = enabled ? "Disable" : "Enable";
        }
      )
    );

    disableButton.addEventListener("click", () => {
      enabled = !enabled;
      disableButton.innerHTML = enabled ? "Disable" : "Enable";
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        chrome.tabs.sendMessage(tabs[0].id, {
          name: "togglePlugin",
          value: enabled,
        })
      );
    });

    toggleColor.addEventListener("click", (event) => {
      event.target.value = event.target.value === "1" ? "0" : "1";
      colorEnabled = event.target.value === "1";

      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        chrome.tabs.sendMessage(tabs[0].id, {
          name: "toggleColor",
          value: colorEnabled,
        })
      );
    });
  },
  false
);