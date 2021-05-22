//https://mbasic.facebook.com/buddhi.tharuka99/about

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function execute() {
    const tabId = getCurrentTab()
    chrome.scripting.executeScript(
        {
          target: {tabId: tabId},
          files: ['script.js'],
        },
        (result) => { 
            console.log('result, result')
        });
}
const btn = document.getElementById("btn");
btn.addEventListener("click", async () => {
  fetch("https://mbasic.facebook.com/buddhi.tharuka99/about")
    .then((res) => res.text())
    .then((res) => console.log(res));
});

chrome.s;
