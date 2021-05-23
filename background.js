function getEmailLocal(htmlContent) {
  /**
   * @param {string} htmlContent - data (body.innerText)
   * @returns {string[]} - returning an Array of valid emails.
   */

  if (!htmlContent && !htmlContent.length) return;
  if (!(typeof htmlContent === "string" || htmlContent instanceof String)) {
    console.error("htmlContent is not a string!");
    return;
  }

  //replacing '@' symbol html entities.
  htmlContent = htmlContent.replace("&#064;", "@");

  //email validator regex
  const re =
    /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gim;

  return Array.from(new Set(htmlContent.match(re) || [])) || [];
}

function getContactNumberLocal(htmlContent) {
  /**
   * @param {string} htmlContent - data (body.innerText)
   * @returns {string[]} - returning an Array of valid Contact Numbers.
   */

  if (!htmlContent && !htmlContent.length) return;
  if (!(typeof htmlContent === "string" || htmlContent instanceof String)) {
    console.error("htmlContent is not a string!");
    return;
  }

  //phone number validator regex.
  const re =
    /(?:(?:Call ([\d\.\s]{1,15}))|(?:((\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})))/gim;

  return Array.from(new Set(htmlContent.match(re) || [])) || [];
}

async function setBadgeCount(count) {
  await chrome.action.setBadgeText({ text: (count || 0).toString() });
}

async function clearStorage() {
  chrome.storage.local.remove(["email", "contact"]);
}

async function saveInfo(emailArray, contactArray) {
  /**
   * @param {string[]} emailArray - Array of valid emails.
   * @param {string[]} contactArray - Array of valid numbers.
   */

  if (
    !(emailArray || emailArray.length) &&
    !(contactArray || contactArray.length)
  ) {
    console.error("emailArray and Contact Array have zero length!");
    return;
  }
  if(!Array.isArray(emailArray)) {
    emailArray = [];
  }
  if(!Array.isArray(contactArray)) {
    contactArray = [];
  }

  chrome.storage.local.get(["email", "contact"], ({ email, contact }) => {
    let newEmailArray, newContactArray;
    if (!email) {
      newEmailArray = emailArray;
    } else {
      newEmailArray = [...email, ...emailArray];
    }
    if (!contact) {
      newContactArray = contactArray;
    } else {
      newContactArray = [...contact, ...contactArray];
    }
    const newUserObject = { email: newEmailArray, contact: newContactArray };
    
    setBadgeCount(Object.values(newUserObject).flat().length);
    chrome.storage.local.set(newUserObject, () => {
      console.log("email and contact saved succefully!");
    });
  });
}

chrome.runtime.onMessage.addListener(async ({ data }, sender, sendResponse) => {
  clearStorage();
  const emailArray = getEmailLocal(data);
  const contactArray = getContactNumberLocal(data);
  saveInfo(emailArray, contactArray);
});


