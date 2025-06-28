// Main JavaScript file for The Burden of Seeing Clearly

// State management
const state = {
    theme: localStorage.getItem('theme') || 'light',
    fontSize: localStorage.getItem('fontSize') || 'normal',
    lineHeight: localStorage.getItem('lineHeight') || 'normal',
    readingProgress: JSON.parse(localStorage.getItem('readingProgress')) || {},
    bookmarks: JSON.parse(localStorage.getItem('bookmarks')) || []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeNavigation();
    initializeReadingProgress();
    initializeTableOfContents();
});

// Theme management
function initializeTheme() {
    // Get saved theme or use system preference
    let currentTheme = localStorage.getItem('theme');
    
    if (!currentTheme) {
        // Default to system preference for new users
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        currentTheme = prefersDark ? 'dark' : 'light';
    }
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            currentTheme = toggleTheme(currentTheme);
            updateThemeIcon(currentTheme);
        });
        updateThemeIcon(currentTheme);
    }
}

function toggleTheme(currentTheme) {
    // Simple toggle: light ↔ dark
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
    
    return newTheme;
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (!themeIcon) return;
    
    const icons = {
        'light': '☀️',
        'dark': '🌙'
    };
    
    themeIcon.textContent = icons[theme] || '🌙';
    themeIcon.setAttribute('title', `Theme: ${theme}`);
}

// Navigation
function initializeNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navWrapper = document.querySelector('.nav-wrapper');
    
    if (menuToggle && navWrapper) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navWrapper.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navWrapper.contains(e.target)) {
                menuToggle.setAttribute('aria-expanded', 'false');
                navWrapper.classList.remove('active');
            }
        });
    }
}

// Reading Progress
function initializeReadingProgress() {
    if (document.querySelector('.chapter-content')) {
        updateReadingProgressBar();
        window.addEventListener('scroll', throttle(updateReadingProgressBar, 100));
    }
}

function updateReadingProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    
    progressBar.style.width = scrollPercent + '%';
    
    // Save progress for chapters
    const chapterContent = document.querySelector('.chapter-content');
    if (chapterContent) {
        const chapterId = chapterContent.getAttribute('data-chapter');
        if (chapterId) {
            state.readingProgress[chapterId] = {
                scrollPercent: scrollPercent,
                lastRead: new Date().toISOString()
            };
            localStorage.setItem('readingProgress', JSON.stringify(state.readingProgress));
        }
    }
}

// Table of Contents
function initializeTableOfContents() {
    const tocLinks = document.querySelectorAll('.chapter-list a');
    
    tocLinks.forEach(link => {
        const href = link.getAttribute('href');
        const chapterMatch = href && href.match(/chapter-(\d+)\.html/);
        
        if (chapterMatch) {
            const chapterId = chapterMatch[1];
            const progress = state.readingProgress[chapterId];
            
            if (progress && progress.scrollPercent > 10) {
                const progressIndicator = document.createElement('span');
                progressIndicator.className = 'chapter-progress';
                progressIndicator.style.cssText = `
                    display: inline-block;
                    width: 40px;
                    height: 4px;
                    background-color: var(--bg-accent);
                    border-radius: 2px;
                    margin-left: 0.5rem;
                    position: relative;
                    overflow: hidden;
                `;
                
                const progressFill = document.createElement('span');
                progressFill.style.cssText = `
                    display: block;
                    height: 100%;
                    background-color: var(--link-color);
                    width: ${progress.scrollPercent}%;
                    transition: width 0.3s ease;
                `;
                
                progressIndicator.appendChild(progressFill);
                link.parentNode.appendChild(progressIndicator);
                
                if (progress.scrollPercent === 100) {
                    link.parentNode.classList.add('completed');
                }
            }
        }
    });
}

// Utility functions
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Reading time calculator
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
}

// Share functionality
function initializeSharing() {
    const shareButtons = document.querySelectorAll('.btn-share');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const pageTitle = document.title;
            const pageUrl = window.location.href;
            
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: pageTitle,
                        text: 'Check out this chapter from The Burden of Seeing Clearly',
                        url: pageUrl
                    });
                } catch (err) {
                    console.log('Share cancelled or failed', err);
                }
            } else {
                // Fallback to copying URL
                copyToClipboard(pageUrl);
                showNotification('Link copied to clipboard!');
            }
        });
    });
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function showNotification(message) {
    const indicator = document.querySelector('.bookmark-indicator');
    if (indicator) {
        indicator.textContent = message;
        indicator.classList.add('show');
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }
}

// Feedback system
function initializeFeedback() {
    const feedbackButtons = document.querySelectorAll('.btn-feedback');
    
    feedbackButtons.forEach(button => {
        button.addEventListener('click', () => {
            const helpful = button.getAttribute('data-helpful') === 'yes';
            const chapterContent = document.querySelector('.chapter-content');
            const chapterId = chapterContent ? chapterContent.getAttribute('data-chapter') : 'unknown';
            
            // Store feedback locally (in real app, would send to server)
            const feedback = JSON.parse(localStorage.getItem('chapterFeedback')) || {};
            feedback[chapterId] = {
                helpful: helpful,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('chapterFeedback', JSON.stringify(feedback));
            
            showNotification('Thank you for your feedback!');
            button.disabled = true;
            button.textContent = 'Thanks!';
        });
    });
}

// Initialize sharing and feedback when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeSharing();
    initializeFeedback();
});

// Export functions for use in other modules
window.BookApp = {
    state,
    showNotification,
    calculateReadingTime,
    updateReadingProgressBar
};