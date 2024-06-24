document.addEventListener('DOMContentLoaded', function () {
    loadSettings();

    document.getElementById('monitor').addEventListener('click', openDiscordUrl);

    document.getElementById('channelUrl').addEventListener('blur', saveSettings);
    document.getElementById('regexFilter').addEventListener('blur', saveSettings);
    document.getElementById('openingDelay').addEventListener('blur', saveSettings);
});

function saveSettings() {
    const channelUrl = document.getElementById('channelUrl').value;
    const regexFilter = document.getElementById('regexFilter').value;
    const openingDelay = document.getElementById('openingDelay').value;

    document.getElementById('channelUrl').style.backgroundColor = "";
    document.getElementById('regexFilter').style.backgroundColor = "";
    document.getElementById('openingDelay').style.backgroundColor = "";

    if (!channelUrl) {
        document.getElementById('channelUrl').style.backgroundColor = "rgba(190,25,43,0.2)";
        return;
    }

    try {
        new RegExp(regexFilter);
    } catch (e) {
        document.getElementById('regexFilter').style.backgroundColor = "rgba(190,25,43,0.2)";
        return;
    }

    if (Number(openingDelay) < 0) {
        document.getElementById('openingDelay').style.backgroundColor = "rgba(190,25,43,0.2)";
        return;
    }

    chrome.storage.local.set({
        channelUrl: channelUrl,
        regexFilter: regexFilter || "",
        openingDelay: openingDelay || 0
    }, function () {
        console.log('Settings saved');
    });
}

function loadSettings() {
    chrome.storage.local.get(['channelUrl', 'regexFilter', 'openingDelay'], function (result) {
        if (result.channelUrl) {
            document.getElementById('channelUrl').value = result.channelUrl;
            document.getElementById('regexFilter').value = result.regexFilter || "";
            document.getElementById('openingDelay').value = result.openingDelay || 0;
        }
    });
}

function openDiscordUrl() {
    const channelUrl = document.getElementById('channelUrl').value;

    if (channelUrl) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentTab = tabs[0];
            if (currentTab.url.startsWith("https://discord.com/")) {
                window.close();
                chrome.tabs.sendMessage(currentTab.id, {
                    type: "openDiscord",
                    url: channelUrl
                }).then();
            } else {
                alert("Please navigate to a Discord page to use this feature.");
            }
        });
    }
}