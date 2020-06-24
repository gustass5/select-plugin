let disableButton;
let enabled;

document.addEventListener(
  "DOMContentLoaded",
  () => {
    disableButton = document.getElementById("disablePlugin");

    if (!disableButton) {
      console.error("No disable button found");
      return;
    }

    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
      chrome.tabs.sendMessage(
        tabs[0].id,
        { name: "requestStatus" },
        (response) => {
          enabled = response.value;
          disableButton.innerHTML = enabled ? "Disable" : "Enable";
        }
      )
    );

    disableButton.addEventListener("click", () => {
      enabled = !enabled;
      disableButton.innerHTML = enabled ? "Disable" : "Enable";
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        chrome.tabs.sendMessage(tabs[0].id, {
          name: "disableClick",
          value: enabled,
        })
      );
    });
  },
  false
);
