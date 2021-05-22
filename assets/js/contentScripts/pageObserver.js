class Scrapper {
  constructor(urlArray) {
    this.urlArray = urlArray;
    this.profileDataArray = [];
    this.tagsArray = [];
  }

  async filterProfileTag() {
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
      groups: true,
      watch: true,
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

    if (!profileTagArray.length) return;

    chrome.storage.local.get(["prevTagObject"], async ({ prevTagObject }) => {
      console.log("local storage", prevTagObject);
      if (!Object.keys(prevTagObject || {}).length) {
        console.log("prevTagObject not found!");
        const newTagObject = {};
        for (let key of profileTagArray) {
          newTagObject[key] = true;
        }
        await new Promise((resolve) => {
          chrome.storage.local.set({ prevTagObject: newTagObject }, () => {
            console.log("new tags saved in local storage 1");
            resolve(true);
          });
        });
        console.log("profileTagArray", profileTagArray);
        this.getProfileData(profileTagArray);
      } else {
        console.log("prevTagObject found!");
        const cleanedTagsArray = [];
        for (let tag of profileTagArray) {
          if (!prevTagObject[tag]) {
            cleanedTagsArray.push(tag);
            prevTagObject[tag] = true;
            await new Promise((resolve) => {
              chrome.storage.local.set({ prevTagObject }, () => {
                console.log("new tags saved in local storage 2");
                resolve(true);
              });
            });
          }
        }
        console.log("cleanTags", cleanedTagsArray);
        if (cleanedTagsArray.length) {
          this.getProfileData(cleanedTagsArray);
        }
      }
    });
  }
  getProfileData(profileTagArray) {
    console.log("background Called!");
    try {
      chrome.runtime.sendMessage({ profileTagArray }, (response) => {});
    } catch (e) {
      console.error(e);
    }
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
      // console.log("mutation", mutation);
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        // console.log("page mutation occured!");
        for (let node of mutation.addedNodes) {
          if(node) {
            const anchor = Array.from(new Set(node.querySelectorAll("a[href]")));
            // console.log("anchors", anchor.length);
            const scapper = new Scrapper(anchor);
            if (anchor.length) {
              await scapper.filterProfileTag();
            }
          }
        }
      }
    }
  }
}

(() => {
  const targetNode = document.body;
  //!
  chrome.storage.local.clear();
  //!
  console.log("targetNode", targetNode);
  new PageObserver(targetNode);
})();
