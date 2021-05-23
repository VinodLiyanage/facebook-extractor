function getEmailFetch(htmlContent) {
  htmlContent = htmlContent.replace("&#064;", "@");
  // console.log('htmlContent', htmlContent)
  const re =
    /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gim;
  const match = re.exec(htmlContent);
  if (match && match.length) {
    console.log(String(match[0]).toLowerCase());
    return String(match[0]).toLowerCase();
  } else return null;
}

function getContactNumberFetch(htmlContent) {
  const re =
    /(?:(?:Call ([\d\.\s]{1,15}))|(?:>((\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})<))/gim;
  const mt = Array.from(re.exec(htmlContent) || []).filter(
    (m) => m && m.length
  );
  if (mt && mt.length > 1) {
    console.log(mt[1]);
    return mt[1];
  } else {
    return null;
  }
}

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

async function profileData(bodyText) {
  const emailArray = getEmailLocal(bodyText);
  const contactNoArray = getContactNumberLocal(bodyText);

  let profileInfoArray = [];
  for (let email of emailArray) {
    profileInfoArray = [
      ...profileInfoArray,
         {
            email,
            contactNo: null,
            tag: null,
         }
        ]
      
  }
  for (let contactNo of contactNoArray) {
    profileInfoArray = [
      ...profileInfoArray,
      {
        email:null,
        contactNo,
        tag: null,
     }
    ]
  }
  console.log('pageObserverLocal', profileInfoArray)
  return profileInfoArray;
}
async function fetchProfileData(profileTagArray) {
  console.log("in fetch");
  const profileInfoArray = [];
  if (!profileTagArray) return;

  for (let tag of profileTagArray) {
    // console.log('tag', tag)
    const url = `https://mbasic.facebook.com/${tag}/`;
    await fetch(url)
      .then((res) => res.text())
      .then((res) => {
        console.log("res-length", res.length);
        profileInfoArray.push({
          tag,
          email: getEmailFetch(res),
          contactNo: getContactNumberFetch(res),
        });
        console.log("profileInfoArray1", profileInfoArray);
      })
      .catch((e) => {
        console.error(e);
      });
      return profileInfoArray;
  }
}

async function setBadgeCount(count) {
    await chrome.action.setBadgeText({text: (count || 0).toString()})
}

async function saveInfo(profileInfoArray) {
    if(!profileInfoArray) return;
    const newInfoArray = profileInfoArray.filter(item => {
        return (item.email || item.contactNo) 
    })
    console.log('newInfoArray', newInfoArray)

    const count = newInfoArray.length;
    chrome.storage.local.get(['massObject'], ({massObject}) => {
      if(!massObject) {
        
      }
    })
    chrome.storage.local.get(['profileInfo'], async ({profileInfo}) => {
        console.log('prevProfileInfo', profileInfo)
        let newProfileInfo = {
            
        }
        if(Object.keys(profileInfo || {}).length) {
            const prevCount = parseInt(profileInfo?.count || 0);
            const newCount = prevCount + count;
            const prevValues = profileInfo?.values || [];
            newProfileInfo = {
                count: newCount,
                values: [
                    ...prevValues,
                    ...newInfoArray,
                ]
            }
        } else {
            newProfileInfo = {
                count,
                values: [
                    ...newInfoArray
                ]
            }
        }
        // newProfileInfo.values = Array.from(new Set(newProfileInfo.values))

        console.log('newProfileInfo', newProfileInfo)
        chrome.storage.local.set({profileInfo: newProfileInfo}, async () => {
            console.log('profileInfo successfully updated!')
            await setBadgeCount(newProfileInfo.count)
        })
    })
}
chrome.runtime.onMessage.addListener(
  async ({ data, isFetch }, sender, sendResponse) => {
    if(isFetch) {
      if(!data) return;
      console.log('data', data)

      const profileInfoArray = await fetchProfileData(data);
      await saveInfo(profileInfoArray)

    } else {
      
      const profileInfoArray = await profileData(data);
      await saveInfo(profileInfoArray)
    }
  }
);
