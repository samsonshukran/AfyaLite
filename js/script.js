// ===== AfyaLite - Enhanced Homepage Script =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('AfyaLite Homepage initialized');
    
    // Initialize all components
    initApp();
});

// ===== MAIN INITIALIZATION =====
function initApp() {
    // Initialize dynamic tagline
    initDynamicTagline();
    
    // Initialize card interactions
    initCardInteractions();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize theme detection
    initThemeDetection();
    
    // Initialize smooth scroll
    initSmoothScroll();
}

// ===== DYNAMIC TAGLINE =====
function initDynamicTagline() {
    const taglineElement = document.getElementById('tagline');
    if (!taglineElement) return;
    
    const taglines = [
        "Transform your health journey with smart nutrition",
        "East Africa's favorite health companion",
        "Simple tools for a healthier lifestyle",
        "Your personal guide to better eating habits",
        "Health made simple, affordable, and local",
        "Join thousands on their wellness journey",
        "Smart nutrition for smarter living"
    ];
    
    let currentIndex = 0;
    
    function typeTagline(tagline) {
        taglineElement.textContent = '';
        let charIndex = 0;
        
        function typeChar() {
            if (charIndex < tagline.length) {
                taglineElement.textContent += tagline.charAt(charIndex);
                charIndex++;
                setTimeout(typeChar, 50);
            } else {
                // Wait 3 seconds before changing tagline
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % taglines.length;
                    typeTagline(taglines[currentIndex]);
                }, 3000);
            }
        }
        
        typeChar();
    }
    
    // Start with first tagline
    typeTagline(taglines[currentIndex]);
}

// ===== CARD INTERACTIONS =====
function initCardInteractions() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        // Add animation delay
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Add click ripple effect
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) return;
            
            // Create ripple element
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(76, 175, 80, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${e.clientX - rect.left - size/2}px;
                top: ${e.clientY - rect.top - size/2}px;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add ripple animation to CSS
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Animate cards sequentially
                if (entry.target.querySelector('.cards-container')) {
                    const cards = entry.target.querySelectorAll('.card');
                    cards.forEach((card, index) => {
                        card.style.animationDelay = `${index * 0.1}s`;
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// ===== THEME DETECTION =====
function initThemeDetection() {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('afyalite-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    function applyTheme(isDark) {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
    
    // Apply saved theme or system preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDark.matches)) {
        applyTheme(true);
    }
    
    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('afyalite-theme')) {
            applyTheme(e.matches);
        }
    });
    
    // Add theme toggle button
    addThemeToggle();
}

function addThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        z-index: 1000;
        box-shadow: var(--shadow-md);
        transition: var(--transition);
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(themeToggle);
    
    // Set initial icon based on current theme
    const isDark = document.documentElement.hasAttribute('data-theme');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.toggleAttribute('data-theme');
        
        // Update icon
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeToggle.style.background = isDark ? '#333' : 'var(--primary)';
        
        // Save preference
        localStorage.setItem('afyalite-theme', isDark ? 'dark' : 'light');
        
        // Add animation
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    // Header scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', scrollToMain);
    }
    
    // Anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== SCROLL TO MAIN FUNCTION =====
function scrollToMain() {
    const main = document.querySelector('main');
    if (main) {
        main.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
    // Tab key navigation for cards
    if (e.key === 'Tab') {
        const focusedCard = document.activeElement.closest('.card');
        if (focusedCard) {
            focusedCard.style.outline = '2px solid var(--primary)';
        }
    }
});

// ===== PERFORMANCE OPTIMIZATION =====
// Debounce resize events
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Handle resize events efficiently
    }, 100);
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('AfyaLite Error:', e.error);
});

// ===== PAGE VISIBILITY =====
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Page became visible again
        console.log('Welcome back to AfyaLite!');
    }
});