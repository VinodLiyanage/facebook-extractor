class Scrapper {
  constructor(urlArray) {
    this.urlArray = urlArray;
    this.profileDataArray  = []
    this.tagsArray = []
  }
  
  filterProfileTag() {
    /**
     * ? this method filder out non user profile urls.
     * @returns {string[]} filteredUserUrl
     */
    const prob = {
      media: true,
      stories: true,
      hashtag: true,
      photo: true,
      memories: true,
      "profile.php": true,
    };

    const profileTagArray = Array.from(
      new Set(
        this.urlArray
          .filter((el) => {
            return el?.href;
          })
          .map((el) => el.href)
          .filter((url) => {
            const re_cft = /__cft__\[0]=/gim;
            if (url && re_cft.test(url)) {
              return true;
            }
            return false;
          })
          .map((url) => {
            const re =
              /(?:https|http):\/\/(?:m|www|mbasic)\.facebook.com\/(.*?)[/?]/gim;
            const mt = re.exec(url);
            if (mt && mt.length > 1) {
              const tag = mt[1];
              return tag;
            }
          })
          .filter((tag) => {
            if (!prob[tag]) return true;
          })
      )
    );
    
    chrome.storage.local.get(['prevTagObject'], ({prevTagObject}) => {
        console.log('local storage', prevTagObject)
        if(!Object.keys(prevTagObject || {}).length) {
            console.log('prevTagObject not found!')
            const newTagObject = {}
            for(let key of profileTagArray) {
                newTagObject[key] = true;
            }
            chrome.storage.local.set({prevTagObject:newTagObject})
            console.log('profileTagArray', profileTagArray)
            this.getProfileData(profileTagArray)
        } else {
            console.log('prevTagObject found!')
            const cleanedTagsArray = []
            for(let tag of profileTagArray) {
                if(!prevTagObject[tag]) {
                    cleanedTagsArray.push(tag)
                    prevTagObject[tag] = true;
                } 
            }
            chrome.storage.local.set({prevTagObject})
            console.log('cleanTags', cleanedTagsArray)
            if(cleanedTagsArray.length) {
                this.getProfileData(cleanedTagsArray)
            }
        }
    })
  }
  getProfileData(profileTagArray) {
      console.log('background Called!')
      try {
          chrome.runtime.sendMessage({profileTagArray}, (response) => {});
      } catch (e) {
          console.error(e)
      }
  }
  
}

class PageObserver {
  constructor(targetNode) {
    this.targetNode = targetNode;
    this.config = { attributes: false, childList: true, subtree: false };
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
  validator(anchor) {
    chrome.storage.local.get(['anchorCount'], ({anchorCount}) => {
        const newCount = anchor ? anchor.length : 0;
        if(!anchorCount) {
            return true;
          } else {
              anchorCount = parseInt(anchorCount)
              if(anchorCount !== anchor.length) {
                  return true;
              }
          }
         chrome.storage.local.set({anchorCount: newCount})
         return false;
    })
  }
  callback(mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {

          const anchor = Array.from(document.querySelectorAll('a[href]'))
          const scapper = new Scrapper(anchor)

          const isValidate = this.validator()
        
      } 
    }
  }
}

(() => {
  const targetNode = document.body;

  console.log("targetNode", targetNode);
  new PageObserver(targetNode);
})();
