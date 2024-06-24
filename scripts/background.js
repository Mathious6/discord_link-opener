chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "speak") {
        console.info(`Speaking: ${request.message}`);
        chrome.tts.speak(request.message);
    }
});
