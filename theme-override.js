// Blackhaven Theme Override - Simplified for Dark Mode Only
// Handles dynamic class cleanup that CSS cannot do

(function () {
    if (window.bhThemeLoaded) return;
    window.bhThemeLoaded = true;

    // Force dark mode
    document.documentElement.classList.add('dark');

    let lastPath = '';

    function updateNavigation() {
        const currentPath = window.location.pathname;

        // Skip if path hasn't changed
        if (currentPath === lastPath) return;
        lastPath = currentPath;

        // Get all nav links
        document.querySelectorAll('nav a, aside a').forEach(el => {
            // Skip external links
            if (el.href && (el.href.includes('x.com') || el.href.includes('discord') || el.href.includes('blackhaven.io'))) {
                return;
            }

            try {
                const linkPath = new URL(el.href).pathname;
                const isActive = (currentPath === linkPath);

                // Reset all active states
                el.removeAttribute('data-active');
                el.classList.remove('active', 'text-primary', 'bg-primary/10');
                el.style.removeProperty('color');
                el.style.removeProperty('background-color');
                el.style.removeProperty('border-left');

                // Set active only on current page
                if (isActive) {
                    el.setAttribute('data-active', 'true');
                    el.classList.add('active');
                }
            } catch (e) {
                // Invalid URL, skip
            }
        });
    }

    function cleanupCards() {
        // Remove inline border-color from cards so CSS :hover works
        document.querySelectorAll('[class*="Card"], [class*="CardGroup"] a').forEach(card => {
            card.style.removeProperty('border-color');
        });
    }

    function init() {
        // Force dark mode on every init
        document.documentElement.classList.add('dark');

        updateNavigation();
        cleanupCards();
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Watch for URL changes (SPA navigation)
    let lastUrl = window.location.href;
    new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            lastPath = '';
            setTimeout(init, 50);
        }
    }).observe(document.body, { childList: true, subtree: true });

    // Back/forward navigation
    window.addEventListener('popstate', () => {
        lastPath = '';
        setTimeout(init, 50);
    });

    // Initial runs
    setTimeout(init, 100);
    setTimeout(init, 500);
    setTimeout(init, 1000);

    console.log('[Blackhaven] Theme override loaded (dark mode only)');
})();
