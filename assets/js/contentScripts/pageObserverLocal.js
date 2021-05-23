function connectBackground(data) {
  console.log("background Called!");
  try {
    chrome.runtime.sendMessage({ data }, (response) => {});
  } catch (e) {
    console.error(e);
  }
}

class PageObserver {
  constructor(targetNode) {
    this.targetNode = targetNode;
    this.config = { attributes: false, childList: true, subtree: true };
    this.observer = new MutationObserver((m, o) => this.callback(m, o));
    console.log("im page Observer");
    this.observe();
  }

  setDesabled() {
    this.observer.disconnect();
  }
  observe() {
    this.observer.observe(this.targetNode, this.config);
  }

  async callback(mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        for (let node of mutation.addedNodes) {
          if (node && node.nodeType === Node.ELEMENT_NODE) {
                const bodyText = document.body.innerText;
                connectBackground(bodyText);
          }
        }
      }
    }
  }
}

(() => {
  console.log("content script loaded!");
  const targetNode = document.body;
  //!
  chrome.storage.local.clear();
  //!
  console.log("targetNode", targetNode);
  new PageObserver(targetNode);
})();
