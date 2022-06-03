(async () => {
    const src = chrome.extension.getURL("src/js/content.js");
    const contentScript = await import(src);
    contentScript.main(/* chrome: no need to pass it */);
})();
