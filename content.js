/**
 * States if plugin is enabled
 */
let enabled = true;
/**
 * States if only exact words should be matched
 */
let matchExact = false;
/**
 * States if words should be matched by character casing
 */
let matchCase = false;
/**
 * All highlighted elements
 */
let highlightedElements = [];
/**
 * Invalid characters that will not trigger select matching
 * For example, ' '
 */
let invalidChars = /\s/;
/**
 * Default styles
 */
let styles = {
  currentColor: "#ade6e6",
  color: "#ade6e6",
  borderSize: "2px",
  borderColor: "black",
  borderStyle: "solid",
};
/**
 * Gets existing styling and select options from storage
 */
chrome.storage.sync.get(
  ["styles", "enabled", "matchExact", "matchCase"],
  (data) => {
    styles = data.styles;
    enabled = data.enabled;
    matchExact = data.matchExact;
    matchCase = data.matchCase;
  }
);

/**
 * Listens for events
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.name) {
    case "togglePlugin":
      enabled = request.value;
      if (!enabled) {
        clearSelection();
        clearHighlightedElements();
      }
      break;
    case "toggleMatchExact":
      matchExact = request.value;
      break;
    case "toggleMatchCase":
      matchCase = request.value;
      break;
    case "requestStatus":
      sendResponse({
        name: "sendStatus",
        enabled,
        matchExact,
        matchCase,
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

  /**
   * Saves styling and select options in storage
   */
  chrome.storage.sync.set({ styles, enabled, matchExact, matchCase });
});

/**
 * Starts matching on double click select
 */
document.addEventListener("dblclick", () => {
  if (enabled) {
    getSelectionText();
  }
});

/**
 * Resets highlighted elements after deselect
 */
document.addEventListener("selectionchange", () => {
  if (highlightedElements.length !== 0) {
    clearHighlightedElements();
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
    /**
     * Select options are applied
     */
    if (!invalidChars.test(text)) {
      const caseFlag = matchCase ? "" : "i";

      const regExp = matchExact
        ? new RegExp(`\\b${text}\\b`, caseFlag)
        : new RegExp(text, caseFlag);

      walk(document.body, regExp);
    }
  } else {
    clearHighlightedElements();
  }
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
  /**
   * Check if match was found
   */
  match = targetRe.exec(node.nodeValue);
  if (match) {
    /**
     * Split at the beginning of the match
     */
    targetNode = node.splitText(match.index);
    /**
     * Split at the end of the match.
     * match[0] is the full text that was matched.
     */
    followingNode = targetNode.splitText(match[0].length);
    /**
     * Check if target node already is highlighted
     */
    if (!targetNode.parentNode.classList.contains("$select-matched")) {
      /**
       * Wrap the target in an `span` element and apply styling
       * First we create the wrapper and insert it in front
       * of the target text. We use the first capture group as the `href`.
       */
      wrapper = document.createElement("span");
      applyStyles(wrapper);
      wrapper.classList.add("$select-matched");
      targetNode.parentNode.insertBefore(wrapper, targetNode);

      /**
       * Now we move the target text inside it
       */
      wrapper.appendChild(targetNode);
      highlightedElements.push(wrapper);
    }

    /**
     * Clean up any empty nodes (in case the target text
     * was at the beginning or end of a text node)
     */
    if (node.nodeValue.length == 0) {
      node.parentNode.removeChild(node);
    }
    if (followingNode.nodeValue.length == 0) {
      followingNode.parentNode.removeChild(followingNode);
    }

    /**
     * Continue with the next match in the node, if any
     */
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

function clearHighlightedElements() {
  highlightedElements.forEach((element) => {
    element.outerHTML = element.innerHTML;
  });
  highlightedElements = [];
}

function applyStyles(element) {
  element.style.backgroundColor = styles.currentColor;
  element.style.outlineWidth = styles.borderSize;
  element.style.outlineColor = styles.borderColor;
  element.style.outlineStyle = styles.borderStyle;
}
