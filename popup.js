class WinowManager {
  constructor() {
    console.log("window manager window manager window manager");
  }
  getValues() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(["profileInfo"], ({ profileInfo }) => {
          resolve(profileInfo);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  addCard(profileInfo) {
    if (!Object.keys(profileInfo || {}).length) return;
    const cardContainer = document.getElementById("card-container");
    const userInfoCard = document.querySelector(".user-info-card-main");
    const userEmail = document.querySelector(".user-email");
    const userTag = document.querySelector(".user-tag");
    const userContact = document.querySelector(".user-contact");
    
    /*
    const dummyVal = [
        {
            email:'1skfskjflksj@kjkf',
            tag: 'djfdkf',
            contactNo: '12323423423',
        },
        {
            email:'2skfskjflksj@kjkf',
            tag: 'djfdkf',
            contactNo: '12323423423',
        },
        {
            email:'3skfskjflksj@kjkf',
            tag: 'djfdkf',
            contactNo: '12323423423',
        }
    ]
    */
    if (!profileInfo?.values) return;
    for (let value of profileInfo.values) {
      const { contactNo, email, tag } = value;
      console.log(contactNo, email, tag);
      userEmail.value = email || "";
      userTag.value = tag || '';
      userContact.value = contactNo || "";
      userInfoCard.dataset.tag = tag || "";
      
      const cloneInfoCard = userInfoCard.cloneNode(true)
      cloneInfoCard.style.display = "unset";
      cardContainer.appendChild(cloneInfoCard);
    }
  }
  async updateWindow() {

    const profileInfo = await this.getValues();
    this.addCard(profileInfo);
    console.log("*****profileInfo from popup js", profileInfo);
  }
  editWindow() {
    null;
  }
}

const windowManager = new WinowManager();
windowManager.updateWindow();
