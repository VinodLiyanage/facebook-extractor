function connectBackground(data) {
  /**
   * @param {string} data - document.body.innerText string.
   */
  if (!(data && data.length)) return;
  try {
    chrome.runtime.sendMessage({ data }, (res) => {});
  } catch (e) {
    null;
  }
}

class PageObserver {
  constructor(targetNode) {
    this.targetNode = targetNode;
    this.config = { attributes: false, childList: true, subtree: true };
    this.observer = new MutationObserver((m, o) => this.callback(m, o));
    this.observe();
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
            //sending innertext data to background js.
            connectBackground(bodyText);
          }
        }
      }
    }
  }
}

async function clearStorage() {
  try {
    chrome.storage.local.remove(["email", "contact"]);
  } catch (e) {
    chrome.storage.local.clear();
  }
}

(() => {
  const targetNode = document.body;
  if (!targetNode) {
    return;
  }
  clearStorage();
  new PageObserver(targetNode);
})();
