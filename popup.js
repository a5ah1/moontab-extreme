document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('settingsLink').addEventListener('click', function(e) {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
        window.close();
    });
});