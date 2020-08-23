let disableButton,
  matchExactButton,
  matchCaseButton,
  toggleColor,
  toggleBorder,
  colorPicker,
  borderColorPicker,
  borderStyle;

let enabled = true,
  matchExact,
  matchCase,
  colorEnabled,
  borderEnabled;

const setButtons = () => {
  setButtonToggle(disableButton, enabled);
  setButtonToggle(matchExactButton, enabled && matchExact);
  setButtonToggle(matchCaseButton, enabled && matchCase);
  setButtonToggle(toggleColor, enabled && colorEnabled);
  setButtonToggle(toggleBorder, enabled && borderEnabled);
};

const setButtonToggle = (element, condition) => {
  if (condition) {
    toggleButton(element);
  }
};

const toggleButton = (element) => {
  if (element.classList.contains("toggled")) {
    element.classList.remove("toggled");
  } else {
    element.classList.add("toggled");
  }
};
document.addEventListener(
  "DOMContentLoaded",
  () => {
    disableButton = document.getElementById("disablePlugin");
    matchExactButton = document.getElementById("matchExact");
    matchCaseButton = document.getElementById("matchCase");
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
          if (response === undefined) {
            return;
          }
          enabled = response.enabled;
          matchExact = response.matchExact;
          matchCase = response.matchCase;
          colorEnabled = response.styles.currentColor !== "";
          borderEnabled = response.styles.borderSize !== "0px";
          toggleColor.value = colorEnabled ? "1" : "0";
          toggleBorder.value = borderEnabled ? "1" : "0";
          colorPicker.value = response.styles.color;
          borderColorPicker.value = response.styles.borderColor;
          borderStyle.value = response.styles.borderStyle;
          disableButton.innerHTML = enabled ? "Disable" : "Enable";
          setButtons();
        }
      )
    );

    disableButton.addEventListener("click", () => {
      enabled = !enabled;
      disableButton.innerHTML = enabled ? "Disable" : "Enable";
      toggleButton(disableButton);
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        chrome.tabs.sendMessage(tabs[0].id, {
          name: "togglePlugin",
          value: enabled,
        })
      );
    });

    matchExactButton.addEventListener("click", () => {
      matchExact = !matchExact;
      toggleButton(matchExactButton);
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        chrome.tabs.sendMessage(tabs[0].id, {
          name: "toggleMatchExact",
          value: matchExact,
        })
      );
    });

    matchCaseButton.addEventListener("click", () => {
      matchCase = !matchCase;
      toggleButton(matchCaseButton);
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        chrome.tabs.sendMessage(tabs[0].id, {
          name: "toggleMatchCase",
          value: matchCase,
        })
      );
    });

    toggleColor.addEventListener("click", (event) => {
      colorEnabled = !colorEnabled;
      toggleButton(toggleColor);
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        chrome.tabs.sendMessage(tabs[0].id, {
          name: "toggleColor",
          value: colorEnabled,
        })
      );
    });

    toggleBorder.addEventListener("click", (event) => {
      borderEnabled = !borderEnabled;
      toggleButton(toggleBorder);
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

    borderStyle.addEventListener("change", (event) => {
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        chrome.tabs.sendMessage(tabs[0].id, {
          name: "borderStyle",
          value: event.target.value,
        })
      );
    });
  },
  false
);
