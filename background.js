function getEmailLocal(htmlContent) {
  /**
   * @param {string} htmlContent - data (body.innerText)
   * @returns {string[]} - returning an Array of valid emails.
   */

  if (!(htmlContent && htmlContent.length)) return;
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

  if (!(htmlContent && htmlContent.length)) return;
  if (!(typeof htmlContent === "string" || htmlContent instanceof String)) {
    console.error("htmlContent is not a string!");
    return;
  }

  //phone number validator regex.
  const re =
    /((?:((\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}))|(?:\+?(\d{1,3}))[-. (](\d{3,4})[-. (](\d{3,4}))/gim;

  //new regex
  // const re = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/gmi;
  // const re = /\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?/gmi;
  // const re =
  //   /((?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?)|(?:\+?(\d{1,3}))?[-. (](\d{3,4})[-. (](\d{3,4})/gm;

  return Array.from(new Set((htmlContent.match(re) || []).map(num => {
     return num.replace(/\D/gmi, '')
  }))) || [];
}

async function setBadgeCount(count) {
  let text;
  try {
    text = (count || 0).toString();
  } catch (e) {
    text = "0";
  }
  await chrome.action.setBadgeText({ text });
}

async function saveInfo(emailArray, contactArray) {
  /**
   * @param {string[]} emailArray - Array of valid emails.
   * @param {string[]} contactArray - Array of valid numbers.
   */

  if (
    !(emailArray && emailArray.length) &&
    !(contactArray && contactArray.length)
  ) {
    return;
  }
  if (!Array.isArray(emailArray)) {
    emailArray = [];
  }
  if (!Array.isArray(contactArray)) {
    contactArray = [];
  }

  chrome.storage.local.get(["email", "contact"], ({ email, contact }) => {
    let newEmailArray, newContactArray;
    if (!email) {
      newEmailArray = emailArray;
    } else {
      newEmailArray = Array.from(new Set([...email, ...emailArray]));
    }
    if (!contact) {
      newContactArray = contactArray;
    } else {
      newContactArray = Array.from(new Set([...contact, ...contactArray]));
    }
    const newUserObject = { email: newEmailArray, contact: newContactArray };

    const count = (Object.values(newUserObject || {}) || []).flat().length;
    setBadgeCount(count);
    chrome.storage.local.set(newUserObject, () => {
      console.log("email and contact saved succefully!");
    });
  });
}

chrome.runtime.onMessage.addListener(async ({ data }, sender, sendResponse) => {
  //?this will remove the chrome.runtime.lasterror
  sendResponse({ status: true });

  const emailArray = getEmailLocal(data);
  const contactArray = getContactNumberLocal(data);
  await saveInfo(emailArray, contactArray);
  return true;
});
