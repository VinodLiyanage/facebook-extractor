class WinowManager {
  constructor() {
    console.log("window manager window manager window manager");
  }
  init() {
    this.removeCard();
    this.updateWindow();
    this.editWindow();
  }
  getValues() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(["email", "contact"], ({ email, contact }) => {
          resolve({ email, contact });
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  addCard({ email, contact }) {
    if (!email?.length && !contact?.length) return;
    console.log(email, contact);
    const emailTab = document.querySelector(".email-tab");
    const contactTab = document.querySelector(".contact-tab");

    /**
     * <button type="button" class="list-group-item list-group-item-action" aria-current="true">
              The current button
            </button>
     */
    console.log("add card", email, contact);
    if (email?.length) {
      for (let em of email) {
        const btn = document.createElement("button");
        btn.setAttribute("type", "button");
        btn.classList.add(
          "info-btn",
          "list-group-item",
          "list-group-item-action"
        );
        btn.setAttribute("aria-current", "true");
        btn.setAttribute("data-val", em);
        btn.innerText = em || "";
        emailTab.appendChild(btn);
      }
    }
    if (contact?.length) {
      for (let ct of contact) {
        const btn = document.createElement("button");
        btn.setAttribute("type", "button");
        btn.classList.add(
          "info-btn",
          "list-group-item",
          "list-group-item-action"
        );
        btn.setAttribute("aria-current", "true");
        btn.setAttribute("data-val", ct);

        btn.innerText = ct || "";
        contactTab.appendChild(btn);
      }
    }
  }
  removeCard() {
    const emailTab = document.querySelector(".email-tab");
    const contactTab = document.querySelector(".contact-tab");
    emailTab.querySelectorAll("*").forEach((el) => el.remove());
    contactTab.querySelectorAll("*").forEach((el) => el.remove());
  }
  async updateWindow() {
    const { email, contact } = await this.getValues();
    console.log("in popup", email, contact);
    this.addCard({ email, contact });
  }
  downloader(text) {
    console.log("dtext", text);
    if (!text?.length) return;
    saveAs(
      new Blob([text]),
      `facebook-user-data-${new Date().toDateString()}.txt`
    );
  }
  copyContent(text) {
    console.log("ctext", text);
    if (!text?.length) return;

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
          alert("succefull!");
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
    console.log("edit window callded");
    const { email, contact } = await this.getValues();
    let text = "";
    if (email?.length) {
      text += email.join("\n");
    }
    if (contact?.length) {
      text += contact.join("\n");
    }
    console.log("text", text);
    const handleListBtn = (e) => {
      const text = e.target.dataset.val || "";
      this.copyContent(text);
    };
    const listCopyBtn = Array.from(document.querySelectorAll(".info-btn"));
    const copyBtn = document.getElementById("copy-btn");
    const downloadbtn = document.getElementById("download-btn");

    for (let btn of listCopyBtn) {
      btn.addEventListener("click", (e) => handleListBtn(e));
    }
    copyBtn.addEventListener("click", () => this.copyContent(text));
    downloadbtn.addEventListener("click", () => this.downloader(text));
  }
}

const windowManager = new WinowManager();
