function getEmail(htmlContent) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi;
    const match = re.exec(htmlContent);
    if (match && match.length) {
      console.log(String(match[0]).toLowerCase());
      return String(match[0]).toLowerCase();
    } else return null;
}

function getContactNumber(htmlContent) {
    const re = />(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}</gmi;
    const mt = re.exec(htmlContent)
    if(mt && mt.length > 1) {
        console.log(mt[1])
        return mt[1]
    } else {
        return null;
    }
}

async function fetchProfile(profileTagArray) {
    console.log('in fetch')
    const profileInfoArray = []
    if(!profileTagArray) return;

    for(let tag of profileTagArray) {
        const url =  `https://mbasic.facebook.com/${tag}/about`
        await fetch(url)
        .then((res) => res.text())
        .then((res) => {
            console.log('tag', tag, 'res', res)
            profileInfoArray.push({
                tag,
                email: getEmail(res),
                contactNo: getContactNumber(res)
            })
            console.log('profileInfoArray1', profileInfoArray)
        });
        console.log('profileInfoArray2', profileInfoArray)
    }
}

chrome.runtime.onMessage.addListener(async ({ profileTagArray }, sender, sendResponse) => {
    console.log('in backg', profileTagArray)
    await fetchProfile(profileTagArray)

});
