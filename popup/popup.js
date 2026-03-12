/**
 * Mon Mega Hub - Popup Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Actions rapides
    document.getElementById('btn-watchlist').addEventListener('click', () => openHubTab('/watchlist'));
    document.getElementById('btn-compare').addEventListener('click', () => openHubTab('/compare'));
    document.getElementById('btn-finder').addEventListener('click', () => openHubTab('/finder'));
    document.getElementById('btn-agenda').addEventListener('click', () => openHubTab('/agenda'));

    document.getElementById('btn-open-hub').addEventListener('click', () => openHubTab('/'));

    // Charger les notifications (via background script)
    loadNotifications();
});

function openHubTab(path) {
    const hubBaseUrl = "http://localhost:3000"; // À adapter en production
    chrome.tabs.create({ url: `${hubBaseUrl}${path}` });
}

function loadNotifications() {
    const list = document.getElementById('notification-list');

    // Simuler le chargement depuis Supabase / Background
    const dummyNotifications = [
        { title: "Sortie du jour", body: "Nouvel épisode de Hunter x Hunter", time: "10:30" },
        { title: "Agenda", body: "Rappel : Film 'Les Évadés' ce soir", time: "Hier" }
    ];

    if (dummyNotifications.length > 0) {
        list.innerHTML = '';
        list.classList.remove('empty-state');

        dummyNotifications.forEach(notif => {
            const item = document.createElement('div');
            item.className = 'ios-notification';
            item.innerHTML = `
                <div class="notif-header">
                    <span class="notif-app-name">MEGA HUB</span>
                    <span class="notif-time">${notif.time}</span>
                </div>
                <div class="notif-body">
                    <strong>${notif.title}</strong>
                    <p>${notif.body}</p>
                </div>
            `;
            list.appendChild(item);
        });
    }
}
