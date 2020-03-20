document.addEventListener("selectionchange", () => {
  getSelectionText();
});
var highlightedElements = [];
function getSelectionText() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  }

  if (text !== "") {
    walk(document.body, new RegExp(text));
  } else {
    highlightedElements.forEach(element => {
      let parent = element.parentNode;
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    });
    highlightedElements = [];
  }
  console.log("Elements: ", highlightedElements);
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
    console.log("===========");
    // Split at the beginning of the match
    targetNode = node.splitText(match.index);
    console.log("targetNode: ", targetNode);
    // Split at the end of the match.
    // match[0] is the full text that was matched.
    followingNode = targetNode.splitText(match[0].length);
    console.log("followingNode: ", followingNode);
    // Wrap the target in an `span` element with an `arabic` class.
    // First we create the wrapper and insert it in front
    // of the target text. We use the first capture group
    // as the `href`.
    wrapper = document.createElement("span");
    console.log("wrapper: ", wrapper);
    wrapper.style.backgroundColor = "#ade6e6";
    targetNode.parentNode.insertBefore(wrapper, targetNode);
    console.log("TargetNode after insertion: ", targetNode);
    // Now we move the target text inside it
    wrapper.appendChild(targetNode);
    console.log("wrapper append child: ", wrapper);
    highlightedElements.push(wrapper);

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
