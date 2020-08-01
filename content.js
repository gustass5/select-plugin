let enabled = true;
let highlightedElements = [];
let invalidChars = /\s/;
let styles = {
  currentColor: "#ade6e6",
  color: "#ade6e6",
  borderSize: "2px",
  borderColor: "black",
  borderStyle: "solid",
};

chrome.storage.sync.get(["styles"], (data) => {
  styles = data.styles;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.name) {
    case "togglePlugin":
      enabled = request.value;
      if (!enabled) {
        clearSelection();
        highlightedElements.forEach((element) => {
          element.outerHTML = element.innerHTML;
        });
        highlightedElements = [];
      }
      break;
    case "requestStatus":
      sendResponse({
        name: "sendStatus",
        enabled,
        styles,
      });
      break;
    case "toggleColor":
      styles = {
        ...styles,
        currentColor: request.value ? styles.color : "",
      };
      break;
    case "toggleBorder":
      styles = {
        ...styles,
        borderSize: request.value ? "2px" : "0px",
      };
      break;
    case "colorPicker":
      styles = {
        ...styles,
        currentColor: request.value,
        color: request.value,
      };
      break;
    case "borderColorPicker":
      styles = {
        ...styles,
        borderColor: request.value,
      };
      break;
    case "borderStyle":
      styles = {
        ...styles,
        borderStyle: request.value,
      };
      break;
  }

  chrome.storage.sync.set({ styles });
});

document.addEventListener("dblclick", () => {
  if (enabled) {
    getSelectionText();
  }
});

document.addEventListener("selectionchange", () => {
  if (highlightedElements.length !== 0) {
    highlightedElements.forEach((element) => {
      element.outerHTML = element.innerHTML;
    });
    highlightedElements = [];
  }
});
function getSelectionText() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  }
  if (text) {
    console.log({ text });
    if (!invalidChars.test(text)) {
      walk(document.body, new RegExp(text));
      console.log("Happening");
    }
  } else {
    highlightedElements.forEach((element) => {
      element.outerHTML = element.innerHTML;
    });
    highlightedElements = [];
  }
  // console.log("Elements: ", highlightedElements);
}

function walk(node, targetRe) {
  var child;
  switch (node.nodeType) {
    case 1: // Element
      for (child = node.firstChild; child; child = child.nextSibling) {
        walk(child, targetRe);
      }
      break;

    case 3: // Text node
      handleText(node, targetRe);
      break;
  }
}

function handleText(node, targetRe) {
  var match, targetNode, followingNode, wrapper;
  // Does the text contain our target string?
  match = targetRe.exec(node.nodeValue);
  if (match) {
    // console.log("===========");
    // console.log({ match });
    // Split at the beginning of the match
    targetNode = node.splitText(match.index);
    // console.log("targetNode: ", targetNode.parentNode);
    // console.log(targetNode);
    // Split at the end of the match.
    // match[0] is the full text that was matched.
    followingNode = targetNode.splitText(match[0].length);
    if (!targetNode.parentNode.classList.contains("$test")) {
      // console.log("followingNode: ", followingNode);
      // Wrap the target in an `span` element with an `arabic` class.
      // First we create the wrapper and insert it in front
      // of the target text. We use the first capture group
      // as the `href`.
      wrapper = document.createElement("span");
      applyStyles(wrapper);
      wrapper.classList.add("$test");
      targetNode.parentNode.insertBefore(wrapper, targetNode);
      // Now we move the target text inside it
      wrapper.appendChild(targetNode);
      highlightedElements.push(wrapper);
    }

    // Clean up any empty nodes (in case the target text
    // was at the beginning or end of a text node)
    if (node.nodeValue.length == 0) {
      node.parentNode.removeChild(node);
    }
    if (followingNode.nodeValue.length == 0) {
      followingNode.parentNode.removeChild(followingNode);
    }

    // Continue with the next match in the node, if any
    match = followingNode ? targetRe.exec(followingNode.nodeValue) : null;
  }
}
function clearSelection() {
  if (window.getSelection) {
    window.getSelection().removeAllRanges();
  } else if (document.selection) {
    document.selection.empty();
  }
}

function applyStyles(element) {
  element.style.backgroundColor = styles.currentColor;
  element.style.outlineWidth = styles.borderSize;
  element.style.outlineColor = styles.borderColor;
  element.style.outlineStyle = styles.borderStyle;
}
