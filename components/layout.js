// components/layout.js
// Synchronous component loader to avoid races with page scripts.
(function () {
    function loadSync(url) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);
        if (xhr.status >= 200 && xhr.status < 300) return xhr.responseText;
        return '';
    }

    function renderButtons(container, buttons) {
        if (!container || !Array.isArray(buttons)) return;
        container.innerHTML = '';
        buttons.forEach((btn) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'bot';
            const button = document.createElement('button');
            button.id = btn.id;
            if (btn.onclick) button.setAttribute('onclick', btn.onclick);
            const emoji = document.createElement('span');
            emoji.className = 'emoji';
            emoji.textContent = btn.emoji || '';
            const label = document.createElement('span');
            label.textContent = btn.label || '';
            button.appendChild(emoji);
            button.appendChild(label);
            wrapper.appendChild(button);
            container.appendChild(wrapper);
        });
    }

    const headerTarget = document.getElementById('app-header');
    const sidebarTarget = document.getElementById('app-sidebar');

    if (headerTarget) {
        headerTarget.innerHTML = loadSync('components/header.html');
        const title = document.getElementById('page-title');
        if (title && window.PAGE_TITLE) title.textContent = window.PAGE_TITLE;
    }

    if (sidebarTarget) {
        sidebarTarget.innerHTML = loadSync('components/sidebar.html');
        const buttonsContainer = document.getElementById('botones');
        renderButtons(buttonsContainer, window.PAGE_BUTTONS || []);
    }

    window.dispatchEvent(new Event('app:ready'));
})();
