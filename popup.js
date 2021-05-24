class WinowManager {
  constructor() {
    this.removeCard();
    this.updateWindow();
    this.editWindow();
  }
  getValues() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(["email", "contact"], ({ email, contact }) => {
          if (!(email && email.length)) {
            email = [];
          }
          if (!(contact && contact.length)) {
            contact = [];
          }
          resolve({ email, contact });
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  addCard({ email, contact }) {
    if (!(email && email.length) && !(contact && contact.length)) return;

    const emailTab = document.querySelector(".email-tab .simplebar-content");
    const contactTab = document.querySelector(".contact-tab .simplebar-content");

    if (!emailTab || !contactTab) return;

    if (email && email.length) {
      for (let em of email) {
        if (!(em && em.length)) continue;
        const btn = document.createElement("button");
        btn.setAttribute("type", "button");
        btn.classList.add(
          "info-btn",
          "list-group-item",
          "list-group-item-action"
        );
        btn.setAttribute("aria-current", "true");
        btn.setAttribute("data-val", em || "");
        btn.innerText = em || "";
        emailTab.appendChild(btn);
      }
    }
    if (contact && contact.length) {
      for (let ct of contact) {
        if (!(ct && ct.length)) continue;
        const btn = document.createElement("button");
        btn.setAttribute("type", "button");
        btn.classList.add(
          "info-btn",
          "list-group-item",
          "list-group-item-action"
        );
        btn.setAttribute("aria-current", "true");
        btn.setAttribute("data-val", ct || "");

        btn.innerText = ct || "";
        contactTab.appendChild(btn);
      }
    }
  }
  updateBadge({ email, contact }) {
    if (!(email && email.length) && !(contact && contact.length)) return;

    const emailCountBadge = document.getElementById("email-count-badge");
    const contactCountBadge = document.getElementById("contact-count-badge");

    if (!emailCountBadge || !contactCountBadge) return;

    if (email && email.length) {
      emailCountBadge.innerText = (email.length || 0).toString();
    }
    if (contact && contact.length) {
      contactCountBadge.innerText = (contact.length || 0).toString();
    }
  }
  removeCard() {
    const emailTab = document.querySelector(".email-tab");
    const contactTab = document.querySelector(".contact-tab");

    const emailCountBadge = document.getElementById("email-count-badge");
    const contactCountBadge = document.getElementById("contact-count-badge");

    if (!emailCountBadge || !contactCountBadge) return;

    if (!emailTab || !contactTab) return;

    try {
      emailTab.querySelectorAll("*").forEach((el) => el.remove());
      contactTab.querySelectorAll("*").forEach((el) => el.remove());
      emailCountBadge.innerText = "0";
      contactCountBadge.innerText = "0";
    } catch {
      null;
    }
  }
  async updateWindow() {
    const { email, contact } = await this.getValues();
    if (!(email && email.length) && !(contact && contact.length)) {
      console.error("email and Contact Array have zero length!");
      return;
    }
    if (!Array.isArray(email)) {
      email = [];
    }
    if (!Array.isArray(contact)) {
      contact = [];
    }

    this.addCard({ email, contact });
    this.updateBadge({ email, contact });
  }
  downloader(text) {
    if (!(text && text.length)) return;
    saveAs(
      new Blob([text]),
      `facebook-user-data-${new Date().toDateString()}.txt`
    );
    this.removeCard();
  }
  copyContent(text) {
    if (!(text && text.length)) return;

    function fallbackCopyTextToClipboard(text) {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        var successful = document.execCommand("copy");
        var msg = successful ? "successful" : "unsuccessful";
        console.log("Fallback: Copying text command was " + msg);
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }

      document.body.removeChild(textArea);
    }
    function copyTextToClipboard(text) {
      if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
      }
      navigator.clipboard.writeText(text).then(
        function () {
          //?
          const parent = document.getElementById("nav-field");
          const alert = document.createElement("div");
          alert.classList.add("alert", "alert-success");
          alert.setAttribute("role", "alert");
          alert.innerText = "Copied!";
          parent.appendChild(alert);
          setTimeout(() => {
            parent.removeChild(alert);
          }, 1500);
          //?
          console.log("Async: Copying to clipboard was successful!");
        },
        function (err) {
          console.error("Async: Could not copy text: ", err);
        }
      );
    }
    copyTextToClipboard(text);
  }
  async editWindow() {
    const { email, contact } = await this.getValues();
    if (!(email && email.length) && !(contact && contact.length)) {
      console.error("email and Contact Array have zero length!");
      return;
    }
    if (!Array.isArray(email)) {
      email = [];
    }
    if (!Array.isArray(contact)) {
      contact = [];
    }

    let text = "";
    if (email && email.length) {
      text += email.join("\n");
    }
    if (contact && contact.length) {
      text += contact.join("\n");
    }
    const handleListBtn = (e) => {
      let text;
      try {
        text = e.target.dataset.val || "";
      } catch {
        text = "";
      }
      if (text && text.length) {
        this.copyContent(text);
      } else {
        console.error("cannot copy the content. An Error Occured!");
      }
      return;
    };
    const listCopyBtn = Array.from(
      document.querySelectorAll(".info-btn") || []
    );
    const copyBtn = document.getElementById("copy-btn");
    const downloadbtn = document.getElementById("download-btn");

    if (!copyBtn || !downloadbtn) return;

    if (!(listCopyBtn && listCopyBtn.length)) return;

    for (let btn of listCopyBtn) {
      if (btn && btn.nodeType === Node.ELEMENT_NODE) {
        btn.addEventListener("click", (e) => handleListBtn(e));
      } else continue;
    }
    copyBtn.addEventListener("click", () => this.copyContent(text));
    downloadbtn.addEventListener("click", () => this.downloader(text));
  }
}

new WinowManager();
