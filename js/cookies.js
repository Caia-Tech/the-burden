// Cookie Consent Management for The Burden

(function() {
    // Check if user has already consented
    function hasConsented() {
        return localStorage.getItem('cookieConsent') === 'true';
    }

    // Set consent
    function setConsent(value) {
        localStorage.setItem('cookieConsent', value);
        if (value === 'true') {
            // Initialize Google Analytics only after consent
            loadGoogleAnalytics();
        }
    }

    // Load Google Analytics
    function loadGoogleAnalytics() {
        if (window.gtag) return; // Already loaded
        
        // Load gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-PHPFEN8080';
        document.head.appendChild(script);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'G-PHPFEN8080');
    }

    // Create cookie banner
    function createCookieBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-content">
                <p>We use cookies for analytics and security purposes. By continuing to use this site, you consent to our use of cookies and monitoring for security purposes.</p>
                <div class="cookie-actions">
                    <button class="cookie-accept">Accept</button>
                    <button class="cookie-decline">Decline</button>
                    <a href="privacy.html" class="cookie-learn-more">Learn More</a>
                </div>
            </div>
        `;

        // Add event listeners
        banner.querySelector('.cookie-accept').addEventListener('click', function() {
            setConsent('true');
            banner.remove();
        });

        banner.querySelector('.cookie-decline').addEventListener('click', function() {
            setConsent('false');
            banner.remove();
        });

        return banner;
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        if (!hasConsented() && localStorage.getItem('cookieConsent') !== 'false') {
            document.body.appendChild(createCookieBanner());
        } else if (hasConsented()) {
            loadGoogleAnalytics();
        }
    });
})();