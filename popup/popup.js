document.addEventListener('DOMContentLoaded', function () {
    loadSettings();

    document.getElementById('monitor').addEventListener('click', function () {
        saveSettings();
        openDiscordUrl();
    });
});

function saveSettings() {
    const channelUrl = document.getElementById('channelUrl').value;
    const regexFilter = document.getElementById('regexFilter').value;

    document.getElementById('channelUrl').style.backgroundColor = "";
    document.getElementById('regexFilter').style.backgroundColor = "";

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

    chrome.storage.local.set({
        channelUrl: channelUrl,
        regexFilter: regexFilter
    }, function () {
        window.close();
    });
}

function loadSettings() {
    chrome.storage.local.get(['channelUrl', 'regexFilter'], function (result) {
        if (result.channelUrl) {
            document.getElementById('channelUrl').value = result.channelUrl;
            document.getElementById('regexFilter').value = result.regexFilter || "";
        }
    });
}

function openDiscordUrl() {
    const channelUrl = document.getElementById('channelUrl').value;
    const regexFilter = document.getElementById('regexFilter').value;

    if (channelUrl) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const currentTab = tabs[0];
            if (currentTab.url.startsWith("https://discord.com/")) {
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