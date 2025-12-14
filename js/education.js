document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('eduSearch');
    const clearSearchBtn = document.getElementById('clearSearch');
    const tags = document.querySelectorAll('.tag');
    const eduCards = document.querySelectorAll('.edu-card');
    
    // Clear search button
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        filterCards();
        clearActiveTags();
    });
    
    // Search input filter
    searchInput.addEventListener('input', function() {
        filterCards();
        clearActiveTags();
    });
    
    // Tag filter functionality
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Toggle active state
            tags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Clear search input
            searchInput.value = '';
            
            // Filter cards
            filterCards(filter);
        });
    });
    
    function filterCards(filter = '') {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        eduCards.forEach(card => {
            let showCard = true;
            const cardContent = card.textContent.toLowerCase();
            const cardCategory = card.dataset.category;
            
            // Apply search filter
            if (searchTerm) {
                showCard = cardContent.includes(searchTerm);
            }
            
            // Apply category filter
            if (filter && filter !== 'all') {
                showCard = cardCategory === filter;
            }
            
            // Show/hide card with animation
            if (showCard) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
    
    function clearActiveTags() {
        tags.forEach(tag => tag.classList.remove('active'));
    }
    
    // Add click animations to cards
    eduCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.tag') && !e.target.closest('button')) {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            }
        });
    });
    
    // Add random stagger animation to cards
    eduCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Print button functionality
    document.querySelector('.print-btn')?.addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Printing...';
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-print"></i> Print Guide';
        }, 1500);
    });
    
    // Add smooth scroll to top when clicking back link
    document.querySelector('.back-home-btn')?.addEventListener('click', function(e) {
        if (window.location.pathname.includes('education.html')) {
            e.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = this.getAttribute('href');
            }, 300);
        }
    });
    
    // Add fade out animation
    const style = document.createElement('style');
    style.textContent = `
        .fade-out {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize with all cards visible
    filterCards();
});