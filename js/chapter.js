// Chapter-specific JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initializeChapterFeatures();
});

function initializeChapterFeatures() {
    initializeReadingControls();
    initializeKeyboardNavigation();
    initializeBookmarks();
    updateReadingTime();
    restoreReadingPosition();
}

// Reading controls (font size, line height)
function initializeReadingControls() {
    const fontDecrease = document.querySelector('.font-decrease');
    const fontIncrease = document.querySelector('.font-increase');
    const lineHeightToggle = document.querySelector('.line-height-toggle');
    
    if (fontDecrease) {
        fontDecrease.addEventListener('click', () => adjustFontSize(-1));
    }
    
    if (fontIncrease) {
        fontIncrease.addEventListener('click', () => adjustFontSize(1));
    }
    
    if (lineHeightToggle) {
        lineHeightToggle.addEventListener('click', toggleLineHeight);
    }
    
    // Apply saved preferences
    applyReadingPreferences();
}

function adjustFontSize(direction) {
    const sizes = ['small', 'normal', 'large', 'xlarge'];
    const currentSize = window.BookApp.state.fontSize;
    const currentIndex = sizes.indexOf(currentSize);
    const newIndex = Math.max(0, Math.min(sizes.length - 1, currentIndex + direction));
    const newSize = sizes[newIndex];
    
    window.BookApp.state.fontSize = newSize;
    localStorage.setItem('fontSize', newSize);
    applyFontSize(newSize);
}

function applyFontSize(size) {
    document.body.classList.remove('font-size-small', 'font-size-large', 'font-size-xlarge');
    if (size !== 'normal') {
        document.body.classList.add(`font-size-${size}`);
    }
}

function toggleLineHeight() {
    const current = window.BookApp.state.lineHeight;
    const newHeight = current === 'normal' ? 'expanded' : 'normal';
    
    window.BookApp.state.lineHeight = newHeight;
    localStorage.setItem('lineHeight', newHeight);
    
    if (newHeight === 'expanded') {
        document.body.classList.add('line-height-expanded');
    } else {
        document.body.classList.remove('line-height-expanded');
    }
}

function applyReadingPreferences() {
    const fontSize = localStorage.getItem('fontSize') || 'normal';
    const lineHeight = localStorage.getItem('lineHeight') || 'normal';
    
    applyFontSize(fontSize);
    if (lineHeight === 'expanded') {
        document.body.classList.add('line-height-expanded');
    }
}

// Keyboard navigation
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Don't interfere with form inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key) {
            case 'ArrowLeft':
                navigateChapter('prev');
                break;
            case 'ArrowRight':
                navigateChapter('next');
                break;
            case 'b':
            case 'B':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    toggleBookmark();
                }
                break;
            case 'Escape':
                // Return to table of contents
                window.location.href = '../index.html#toc';
                break;
        }
    });
}

function navigateChapter(direction) {
    const navLink = document.querySelector(`.nav-${direction}`);
    if (navLink && navLink.href) {
        window.location.href = navLink.href;
    }
}

// Bookmarks
function initializeBookmarks() {
    // Check if current page is bookmarked
    updateBookmarkStatus();
    
    // Add bookmark toggle on double-click
    document.addEventListener('dblclick', (e) => {
        if (e.target.closest('.chapter-body')) {
            toggleBookmark();
        }
    });
}

function toggleBookmark() {
    const chapterContent = document.querySelector('.chapter-content');
    const chapterId = chapterContent ? chapterContent.getAttribute('data-chapter') : null;
    
    if (!chapterId) return;
    
    const bookmarks = window.BookApp.state.bookmarks;
    const bookmarkIndex = bookmarks.findIndex(b => b.chapterId === chapterId);
    
    if (bookmarkIndex > -1) {
        // Remove bookmark
        bookmarks.splice(bookmarkIndex, 1);
        window.BookApp.showNotification('Bookmark removed');
    } else {
        // Add bookmark
        bookmarks.push({
            chapterId: chapterId,
            title: document.querySelector('h1').textContent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            scrollPosition: window.pageYOffset
        });
        window.BookApp.showNotification('Bookmark added');
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateBookmarkStatus();
}

function updateBookmarkStatus() {
    const chapterContent = document.querySelector('.chapter-content');
    const chapterId = chapterContent ? chapterContent.getAttribute('data-chapter') : null;
    
    if (chapterId) {
        const isBookmarked = window.BookApp.state.bookmarks.some(b => b.chapterId === chapterId);
        document.body.classList.toggle('bookmarked', isBookmarked);
    }
}

// Reading time
function updateReadingTime() {
    const readingTimeElement = document.querySelector('.reading-time-text');
    const chapterBody = document.querySelector('.chapter-body');
    
    if (readingTimeElement && chapterBody) {
        const text = chapterBody.textContent || '';
        const minutes = window.BookApp.calculateReadingTime(text);
        readingTimeElement.textContent = `${minutes} min read`;
    }
}

// Reading position
function restoreReadingPosition() {
    const chapterContent = document.querySelector('.chapter-content');
    const chapterId = chapterContent ? chapterContent.getAttribute('data-chapter') : null;
    
    if (chapterId && window.BookApp.state.readingProgress[chapterId]) {
        const progress = window.BookApp.state.readingProgress[chapterId];
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPosition = (progress.scrollPercent / 100) * scrollHeight;
        
        // Restore position after a short delay to ensure page is fully loaded
        setTimeout(() => {
            window.scrollTo(0, scrollPosition);
        }, 100);
    }
}

// Auto-save reading position periodically
setInterval(() => {
    window.BookApp.updateReadingProgressBar();
}, 5000);

// Chapter-specific search highlighting
function highlightSearchTerms() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('highlight');
    
    if (searchTerm) {
        const chapterBody = document.querySelector('.chapter-body');
        if (chapterBody) {
            highlightText(chapterBody, searchTerm);
        }
    }
}

function highlightText(element, term) {
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        if (node.nodeValue.toLowerCase().includes(term.toLowerCase())) {
            textNodes.push(node);
        }
    }
    
    textNodes.forEach(textNode => {
        const span = document.createElement('span');
        span.className = 'search-highlight';
        span.style.backgroundColor = 'yellow';
        span.style.padding = '2px';
        
        const regex = new RegExp(`(${term})`, 'gi');
        const parts = textNode.nodeValue.split(regex);
        
        parts.forEach(part => {
            if (part.toLowerCase() === term.toLowerCase()) {
                const highlight = span.cloneNode();
                highlight.textContent = part;
                textNode.parentNode.insertBefore(highlight, textNode);
            } else {
                textNode.parentNode.insertBefore(document.createTextNode(part), textNode);
            }
        });
        
        textNode.remove();
    });
}

// Initialize search highlighting
document.addEventListener('DOMContentLoaded', highlightSearchTerms);