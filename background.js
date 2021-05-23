function getEmailLocal(htmlContent) {
  htmlContent = htmlContent.replace("&#064;", "@");
  // console.log('htmlContent', htmlContent)
  const re =
    /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gim;
  const match = Array.from(new Set(htmlContent.match(re) || []));
  console.log(match);
  return match;
}

function getContactNumberLocal(htmlContent) {
  const re =
    /(?:(?:Call ([\d\.\s]{1,15}))|(?:((\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})))/gim;
  const mt = Array.from(new Set(htmlContent.match(re) || [])).filter(
    (m) => m && m.length
  );
  return mt;
}

async function setBadgeCount(count) {
    await chrome.action.setBadgeText({text: (count || 0).toString()})
}
async function clearStorage() {
    chrome.storage.local.remove(['email', 'contact'])
}
async function saveInfo(emailArray, contactArray) {
    chrome.storage.local.get(['email', 'contact'], ({email, contact}) => {
        let newEmailArray, newContactArray;
        if(!email) {
            newEmailArray = emailArray;
        } else {
            newEmailArray = [
                ...email,
                ...emailArray
            ]
        }
        if(!contact) {
            newContactArray = contactArray;
        } else {
            newContactArray = [
                ...contact,
                ...contactArray
            ]
        

        }
        const newUserObject = {'email':newEmailArray, 'contact':newContactArray}
        setBadgeCount(Object.values(newUserObject).flat().length)
        chrome.storage.local.set(newUserObject, () => {
            console.log('email and contact saved succefully!')
        })
    })
}
chrome.runtime.onMessage.addListener(
  async ({ data }, sender, sendResponse) => {
    clearStorage()
    const emailArray = getEmailLocal(data);
    const contactArray = getContactNumberLocal(data);
    saveInfo(emailArray, contactArray)
  }
);
