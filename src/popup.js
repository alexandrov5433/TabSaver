const saveBtn = document.querySelector('#saveBtn');
const loadBtn = document.querySelector('#loadBtn');
const errorMsgElem = document.querySelector('#errorMsg');
const closeErrBtn = document.querySelector('#closeErrBtn');
const errorDisplayElems = Array.from(document.querySelectorAll('.errorDisplay'));
const redirectElem = document.querySelector('#redirect');
const tabsSavedMsgElem = document.querySelector('#tabsSavedMsg');

saveBtn.addEventListener('click', async () => {
    const { id } = await chrome.windows.getCurrent();
    const tabUrls = (await chrome.tabs.query({windowId: id}))
        .filter(t => t.url != 'chrome://newtab/' && t.pendingUrl != 'chrome://newtab/')
        .map(t => t.url);
    if (tabUrls.length === 0) {
        displayErrorMsg('All tabs in this window are empty new tabs. There is nothing to save.');
        return;
    }
    if (errorMsgElem.style.display === 'block') {
        hideErrElems();
    }
    await chrome.storage.local.set({ tabUrls }); 
    console.log(tabUrls);
    flashTabsSavedMsg();
});

loadBtn.addEventListener('click', async () => {
    const { tabUrls } = await chrome.storage.local.get('tabUrls');
    if (!tabUrls || tabUrls.length === 0) {
        displayErrorMsg('You haven\'t saved any tabs yet.');
        return;
    }
    if (errorMsgElem.style.display === 'block') {
        hideErrElems();
    }
    const { id: newWindowid} = await chrome.windows.create({
        url: tabUrls,
        state: 'maximized'
    });;
    const newWindowTabs = await chrome.tabs.query({windowId: newWindowid});
    await closeEmptyNewTabs(newWindowTabs);
});

closeErrBtn.addEventListener('click', () => {
    hideErrElems();
});

redirectElem.addEventListener('click', async () => {
    await chrome.tabs.create({url: 'https://github.com/alexandrov5433'});
});

async function closeEmptyNewTabs(tabs) {
    tabs.forEach(async t => {
        if (t.url == 'chrome://newtab/' || t.pendingUrl == 'chrome://newtab/') {
            await chrome.tabs.remove(t.id);
        }
    });
}

function displayErrorMsg(msg) {
    console.error(`TabSaver error: ${msg}`);
    errorMsgElem.textContent = msg;
    errorDisplayElems.forEach(e => e.style.display = 'block');
    return;
}

function hideErrElems() {
    errorMsgElem.textContent = '';
    errorDisplayElems.forEach(e => e.style.display = 'none');
}

function flashTabsSavedMsg() {
    tabsSavedMsgElem.style.display = 'block';
    setTimeout(() => {
        tabsSavedMsgElem.style.display = 'none';
    }, 4000);
    return;
}