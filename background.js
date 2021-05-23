function getEmail(htmlContent) {
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

function getContactNumber(htmlContent) {
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

async function fetchProfile(profileTagArray) {
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
          email: getEmail(res),
          contactNo: getContactNumber(res),
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
        console.log('newProfileInfo', newProfileInfo)
        chrome.storage.local.set({profileInfo: newProfileInfo}, async () => {
            console.log('profileInfo successfully updated!')
            await setBadgeCount(newProfileInfo.count)
        })
    })
}
chrome.runtime.onMessage.addListener(
  async ({ profileTagArray }, sender, sendResponse) => {
      if(!profileTagArray) return;
      console.log('profileTagArray', profileTagArray)

    const profileInfoArray = await fetchProfile(profileTagArray);
    await saveInfo(profileInfoArray)
  }
);
