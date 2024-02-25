chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.type === "openDiscord") {
        window.location.href = request.url;
    }
});

main().catch(error => console.error('Error in main:', error));

async function removeDomElements() {
    overlay('Waiting for Discord to load...');

    const guildsNav = await waitForElement('.wrapper_a7e7a8');
    const sideBar = await waitForElement('.sidebar_ded4b5');
    const titleBar = await waitForElement('.title_b7d661');
    const formBar = await waitForElement('.form__13a2c');

    guildsNav.remove();
    sideBar.remove();
    titleBar.remove();
    formBar.remove();

    const membersBar = document.querySelector('.container_b2ce9c');
    if (membersBar) {
        membersBar.remove();
    }
}

async function monitor(regexFilter) {
    const regex = new RegExp(regexFilter, 'i');

    const observer = new MutationObserver(async mutations => {
        for (const mutation of mutations) {
            const addedNodes = Array.from(mutation.addedNodes).filter(node =>
                node.nodeType === 1 && node.matches('.messageListItem__6a4fb'));

            if (addedNodes.length > 0) {
                for (const node of addedNodes) {
                    const links = Array
                        .from(node.querySelectorAll('a'))
                        .map(a => a.href)
                        .filter(url => regex.test(url));

                    if (links.length > 0) {
                        overlay('Opening link...', "rgba(91,201,53,0.8)");
                        await sleep(500);
                        window.open(links[0], '_blank');
                        observer.disconnect();
                        break;
                    }
                }
            }
        }
    });

    overlay('Monitoring Discord...');
    observer.observe(document.body, {childList: true, subtree: true});
}

async function main() {
    try {
        const storage = await getStorage();
        console.log('Storage:', storage);
        const url = storage.channelUrl;
        const regex = storage.regexFilter;

        if (window.location.href === url) {
            overlay('Ready to monitor this channel...');
            await sleep(2000);
            await removeDomElements();
            await sleep(1000);
            await monitor(regex);
        }
    } catch (error) {
        console.error('Error in main:', error);
    }
}

//#region Utils

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitForElement(selector) {
    for (let i = 0; i < 200; i++) {
        const element = document.querySelector(selector);
        if (element) {
            return element;
        }
        await sleep(100);
    }
    document.location.reload();
}

async function getStorage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['channelUrl', 'regexFilter'], function (result) {
            if (result.channelUrl) {
                resolve(result);
            } else {
                reject('Channel URL or regex filter not found in storage.');
            }
        });
    });
}

function overlay(message, color = "rgba(0, 0, 0, 0.6)") {
    let overlay = document.getElementById("opener-overlay");
    if (overlay) {
        overlay.textContent = message;
        overlay.style.backgroundColor = color;
    } else {
        overlay = document.createElement("div");
        overlay.id = "opener-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.width = "100%";
        overlay.style.height = "50px";
        overlay.style.backgroundColor = color;
        overlay.style.color = "white";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "10000";
        overlay.style.fontSize = "24px";
        overlay.style.fontWeight = "bold";
        overlay.textContent = message;

        document.body.appendChild(overlay);
    }
}

//#endregion