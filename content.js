/**
 * Mon Mega Hub - Content Script
 * Injecte le bouton Hub dans les résultats de recherche Google
 */

const HUB_ICON = `
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
</svg>`;

function injectHubButton() {
  // Selector for the tab list container
  const tabList = document.querySelector('div[role="tablist"]');

  if (tabList && !document.getElementById('hub-extension-button')) {
    // We try to find a native tab to clone its structure
    const nativeTab = tabList.querySelector('a[role="tab"]');
    if (!nativeTab) return;

    console.log('Hub Extension: Native tab found, cloning...');

    // Clone the native tab to get exact styles and structure
    const hubTab = nativeTab.cloneNode(true);
    hubTab.id = 'hub-extension-button';
    hubTab.href = 'javascript:void(0)';
    hubTab.removeAttribute('jsaction');
    hubTab.removeAttribute('jsname');
    hubTab.setAttribute('aria-selected', 'false');
    hubTab.tabIndex = -1;

    // Remove active/selected classes if any (Google uses different classes)
    hubTab.classList.remove('NQyKp', 'Y8usp', 'Maj6Tc'); // Remove potential active classes
    hubTab.classList.add('NQyKp', 'Y8usp'); // Typical base classes

    // Find the text container and change it
    const textSpan = hubTab.querySelector('.b0Xfjd') || hubTab.querySelector('span');
    if (textSpan) {
      textSpan.innerHTML = `
        <span style="display: flex; align-items: center; gap: 6px; color: #8ab4f8;">
          ${HUB_ICON}
          <span>MEGA HUB</span>
        </span>
      `;
    }

    // Append it to the tab list
    tabList.appendChild(hubTab);

    // Create the Popup Menu (Attached to body to avoid overflow issues)
    const menu = document.createElement('div');
    menu.id = 'hub-floating-menu';
    menu.className = 'hub-mini-menu shadow-ios';
    menu.style.display = 'none';
    menu.innerHTML = `
      <div class="hub-menu-item" data-action="watchlist">Ajouter à la Watchlist</div>
      <div class="hub-menu-item" data-action="compare">Compare</div>
      <div class="hub-menu-item" data-action="finder">Contenu Similaire</div>
      <div class="hub-menu-arrow"></div>
    `;
    document.body.appendChild(menu);

    hubTab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isVisible = menu.style.display === 'block';

      if (isVisible) {
        menu.style.display = 'none';
      } else {
        // Position the menu relative to the button
        const rect = hubTab.getBoundingClientRect();
        menu.style.top = `${rect.bottom + window.scrollY + 8}px`;
        menu.style.left = `${rect.left + window.scrollX}px`;
        menu.style.display = 'block';
      }
    });

    document.addEventListener('click', (e) => {
      if (!hubTab.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = 'none';
      }
    });

    // Actions du menu
    menu.querySelectorAll('.hub-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = e.target.dataset.action;

        // Extraction de titre plus robuste
        let movieTitle =
          document.querySelector('h2[data-attrid="title"]')?.innerText ||
          document.querySelector('div[data-attrid="title"]')?.innerText ||
          document.querySelector('.PZP57B span')?.innerText || // Knowledge graph title
          document.title.split(' - ')[0];

        // Nettoyage basique (ex: "Les Évadés (1994)" -> "Les Évadés")
        movieTitle = movieTitle.replace(/\s\(\d{4}\)$/, '').trim();

        console.log(`Hub Extension: Action ${action} for ${movieTitle}`);

        chrome.runtime.sendMessage({
          action: action,
          title: movieTitle,
          url: window.location.href
        });

        menu.style.display = 'none';
      });
    });
  }
}

// Observer pour les changements dynamiques (Google charge souvent du contenu en deferred)
const observer = new MutationObserver((mutations) => {
  injectHubButton();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial call
injectHubButton();
