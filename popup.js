let disableButton,
  toggleColor,
  toggleBorder,
  colorPicker,
  borderColorPicker,
  borderStyle;

let enabled, colorEnabled, borderEnabled;

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
          colorEnabled = response.styles.currentColor !== "";
          borderEnabled = response.styles.borderSize !== "0px";
          toggleColor.value = colorEnabled ? "1" : "0";
          toggleBorder.value = borderEnabled ? "1" : "0";
          colorPicker.value = response.styles.color;
          borderColorPicker.value = response.styles.borderColor;
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

    toggleBorder.addEventListener("click", (event) => {
      event.target.value = event.target.value === "1" ? "0" : "1";
      borderEnabled = event.target.value === "1";

      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        chrome.tabs.sendMessage(tabs[0].id, {
          name: "toggleBorder",
          value: borderEnabled,
        })
      );
    });

    colorPicker.addEventListener("change", (event) => {
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        chrome.tabs.sendMessage(tabs[0].id, {
          name: "colorPicker",
          value: event.target.value,
        })
      );
    });
    borderColorPicker.addEventListener("change", (event) => {
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        chrome.tabs.sendMessage(tabs[0].id, {
          name: "borderColorPicker",
          value: event.target.value,
        })
      );
    });
  },
  false
);
