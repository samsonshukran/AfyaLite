document.addEventListener('DOMContentLoaded', () => {
    // Path to your JSON file
    const tipsDataPath = '../data/tips.json';
    
    // Variables
    let allTips = [];
    let dailyTips = [];
    let currentSearchQuery = '';
    let isSearchCollapsed = false;
    
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const clearSearchBtn = document.getElementById('clear-search');
    const searchResultsDiv = document.getElementById('search-results');
    const dailyTipDiv = document.getElementById('daily-tip');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const categoryResultsDiv = document.getElementById('category-results');
    const relatedTipsContainer = document.getElementById('related-tips-container');
    const searchHeader = document.getElementById('search-header');
    const searchContent = document.getElementById('search-content');
    const collapseBtn = document.getElementById('collapse-search-btn');
    
    // Quick search suggestions
    const commonSearchTerms = [
        "headache", "stomach ache", "insomnia", "anxiety", "stress",
        "fatigue", "cough", "fever", "back pain", "joint pain",
        "indigestion", "constipation", "diarrhea", "nausea", "dizziness",
        "high blood pressure", "diabetes", "cholesterol", "allergy", "asthma"
    ];
    
    // Initialize the page
    async function initializePage() {
        try {
            // Show loading state
            showLoading(true);
            
            // Load data
            await loadTipsData();
            
            // Initialize all components
            showDailyTip();
            setupCategories();
            setupSearch();
            setupCollapsible();
            
            // Show initial search suggestions
            showQuickSearchTips();
            
            // Hide loading
            showLoading(false);
            
        } catch (error) {
            console.error('Failed to initialize page:', error);
            showNotification('Error loading health tips. Using sample data.', 'error');
            loadFallbackData();
        }
    }
    
    // Load tips data
    async function loadTipsData() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Data loading timeout'));
            }, 5000);
            
            fetch(tipsDataPath)
                .then(res => {
                    clearTimeout(timeout);
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    console.log('Data loaded successfully:', data);
                    allTips = data.tips || [];
                    dailyTips = data.dailyTips || [];
                    
                    // Preprocess tips for faster search
                    preprocessTips();
                    resolve();
                })
                .catch(err => {
                    clearTimeout(timeout);
                    reject(err);
                });
        });
    }
    
    // Preprocess tips for faster searching
    function preprocessTips() {
        allTips.forEach((tip, index) => {
            // Add searchable text
            tip.searchableText = [
                tip.text || '',
                tip.category || '',
                ...(tip.situation || []),
                ...(tip.keywords || [])
            ].join(' ').toLowerCase();
            
            // Ensure id exists
            if (!tip.id) {
                tip.id = index + 1;
            }
        });
    }
    
    // Setup collapsible search
    function setupCollapsible() {
        collapseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSearchCollapse();
        });
        
        searchHeader.addEventListener('click', (e) => {
            if (e.target !== collapseBtn) {
                toggleSearchCollapse();
            }
        });
    }
    
    function toggleSearchCollapse() {
        isSearchCollapsed = !isSearchCollapsed;
        searchContent.classList.toggle('collapsed', isSearchCollapsed);
        collapseBtn.innerHTML = isSearchCollapsed ? 
            '<i class="fas fa-chevron-up"></i>' : 
            '<i class="fas fa-chevron-down"></i>';
    }
    
    // Setup search functionality
    function setupSearch() {
        searchBtn.addEventListener('click', performSearch);
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchResultsDiv.innerHTML = '';
            currentSearchQuery = '';
            categoryResultsDiv.innerHTML = '';
            relatedTipsContainer.innerHTML = '';
            showQuickSearchTips();
        });
        
        // Initial quick search tips
        showQuickSearchTips();
    }
    
    // Show quick search tips
    function showQuickSearchTips() {
        searchResultsDiv.innerHTML = '';
        
        const quickTipsDiv = document.createElement('div');
        quickTipsDiv.className = 'quick-search-tips';
        quickTipsDiv.innerHTML = `
            <p><strong>💡 Quick Search Suggestions:</strong></p>
            <p>Type a symptom or health concern above, or try one of these:</p>
            <div class="quick-tags-container">
                ${commonSearchTerms.slice(0, 8).map(term => 
                    `<span class="quick-tag">${term}</span>`
                ).join('')}
            </div>
        `;
        
        // Add click handlers to quick tags
        const quickTags = quickTipsDiv.querySelectorAll('.quick-tag');
        quickTags.forEach(tag => {
            tag.addEventListener('click', () => {
                searchInput.value = tag.textContent;
                performSearch();
            });
        });
        
        searchResultsDiv.appendChild(quickTipsDiv);
    }
    
    // Perform search
    let searchTimeout;
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            showNotification('Please enter a symptom or health concern', 'info');
            showQuickSearchTips();
            return;
        }
        
        currentSearchQuery = query;
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Show loading
        searchResultsDiv.innerHTML = `
            <div class="search-loading">
                <div class="spinner"></div>
                <p>Finding tips for "${query}"...</p>
            </div>
        `;
        
        // Clear category results
        categoryResultsDiv.innerHTML = '';
        
        // Delay search to show loading state
        searchTimeout = setTimeout(() => {
            executeSearch(query);
        }, 300);
    }
    
    // Actual search execution
    function executeSearch(query) {
        const startTime = performance.now();
        
        // First, find exact matches
        const exactMatches = allTips.filter(tip => {
            return tip.searchableText.includes(query);
        });
        
        // Then find related matches (partial matches, synonyms, etc.)
        const relatedMatches = allTips.filter(tip => {
            if (exactMatches.includes(tip)) return false; // Don't duplicate
            
            // Check for partial matches
            const words = query.split(' ');
            for (let word of words) {
                if (word.length > 3 && tip.searchableText.includes(word)) {
                    return true;
                }
            }
            
            // Check related keywords
            const relatedKeywords = getRelatedKeywords(query);
            for (let keyword of relatedKeywords) {
                if (tip.searchableText.includes(keyword)) {
                    return true;
                }
            }
            
            return false;
        });
        
        const endTime = performance.now();
        const searchTime = (endTime - startTime).toFixed(2);
        
        displaySearchResults(exactMatches, relatedMatches, query, searchTime);
        
        // Show related tips if we found results
        if (exactMatches.length > 0 || relatedMatches.length > 0) {
            showRelatedTips(exactMatches[0] || relatedMatches[0], query);
        }
    }
    
    // Get related keywords for a query
    function getRelatedKeywords(query) {
        const keywordMap = {
            'headache': ['migraine', 'pain', 'tension', 'stress'],
            'stomach': ['digestion', 'indigestion', 'nausea', 'bloating'],
            'sleep': ['insomnia', 'rest', 'tired', 'fatigue'],
            'stress': ['anxiety', 'worry', 'pressure', 'tension'],
            'pain': ['ache', 'sore', 'discomfort', 'inflammation'],
            'cold': ['flu', 'fever', 'cough', 'congestion'],
            'fatigue': ['tired', 'exhaustion', 'weakness', 'energy'],
            'anxiety': ['stress', 'worry', 'panic', 'nervous']
        };
        
        return keywordMap[query] || [];
    }
    
    // Display search results
    function displaySearchResults(exactMatches, relatedMatches, query, searchTime) {
        searchResultsDiv.innerHTML = '';
        
        const allMatches = [...exactMatches, ...relatedMatches];
        
        if (allMatches.length === 0) {
            searchResultsDiv.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No tips found for "${query}"</h3>
                    <p>Try different keywords or try one of the quick categories below</p>
                    <p>Search completed in ${searchTime}ms</p>
                </div>
            `;
            return;
        }
        
        // Show search summary
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'results-count';
        summaryDiv.innerHTML = `
            <p><i class="fas fa-check-circle"></i> Found <strong>${allMatches.length}</strong> 
            tip${allMatches.length !== 1 ? 's' : ''} related to "<strong>${query}</strong>" in ${searchTime}ms</p>
            ${exactMatches.length > 0 ? `<p class="match-type">${exactMatches.length} exact match${exactMatches.length !== 1 ? 'es' : ''}</p>` : ''}
        `;
        searchResultsDiv.appendChild(summaryDiv);
        
        // Create grid container for results
        const resultsGrid = document.createElement('div');
        resultsGrid.className = 'search-results-grid';
        
        // Display exact matches first
        exactMatches.forEach(tip => {
            const resultCard = createSearchResultCard(tip, query, true);
            resultsGrid.appendChild(resultCard);
        });
        
        // Then display related matches
        relatedMatches.forEach(tip => {
            const resultCard = createSearchResultCard(tip, query, false);
            resultsGrid.appendChild(resultCard);
        });
        
        searchResultsDiv.appendChild(resultsGrid);
        
        // Ensure search section is expanded
        if (isSearchCollapsed) {
            toggleSearchCollapse();
        }
    }
    
    // Create search result card
    function createSearchResultCard(tip, query, isExactMatch = true) {
        const div = document.createElement('div');
        div.className = `search-tip-card tip-${tip.category || 'general'}`;
        
        if (isExactMatch) {
            div.style.borderLeft = '4px solid #27ae60';
        } else {
            div.style.borderLeft = '4px solid #3498db';
        }
        
        // Highlight search terms in text
        let displayText = tip.text || '';
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        displayText = displayText.replace(regex, '<span class="highlight">$1</span>');
        
        // Create situations tags
        const situationsHTML = (tip.situation || [])
            .map(s => `<span class="situation-tag">${s}</span>`)
            .join('');
        
        div.innerHTML = `
            <div class="tip-id">${tip.id}</div>
            ${isExactMatch ? '<div class="exact-match-badge" style="position: absolute; top: 10px; left: 10px; background: #27ae60; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: bold;">Exact Match</div>' : ''}
            <div class="tip-icon">${getCategoryEmoji(tip.category)}</div>
            <p class="tip-text">${displayText}</p>
            ${situationsHTML ? `<div class="tip-situations">${situationsHTML}</div>` : ''}
            <div class="tip-meta">
                <span class="tip-category">${tip.category || 'General'}</span>
                <span class="tip-time"><i class="fas fa-hashtag"></i> ${String(tip.id).padStart(3, '0')}</span>
            </div>
        `;
        
        return div;
    }
    
    // Show related tips based on current search
    function showRelatedTips(mainTip, query) {
        if (!mainTip) return;
        
        // Find related tips (same category or similar situations)
        const relatedTips = allTips.filter(tip => {
            if (tip.id === mainTip.id) return false; // Don't show the same tip
            
            // Check same category
            if (tip.category === mainTip.category) return true;
            
            // Check similar situations
            if (tip.situation && mainTip.situation) {
                for (let sit of tip.situation) {
                    if (mainTip.situation.includes(sit)) return true;
                }
            }
            
            return false;
        }).slice(0, 4); // Show max 4 related tips
        
        if (relatedTips.length === 0) return;
        
        relatedTipsContainer.innerHTML = `
            <section class="related-tips-section">
                <h3><i class="fas fa-link"></i> Related Tips for "${query}"</h3>
                <div class="related-tips-grid"></div>
            </section>
        `;
        
        const relatedGrid = relatedTipsContainer.querySelector('.related-tips-grid');
        
        relatedTips.forEach(tip => {
            const relatedCard = document.createElement('div');
            relatedCard.className = 'related-tip-card';
            relatedCard.innerHTML = `
                <p class="related-tip-text">${tip.text}</p>
                <span class="related-tip-category">${tip.category || 'General'}</span>
            `;
            
            relatedCard.addEventListener('click', () => {
                searchInput.value = tip.text.split(' ').slice(0, 3).join(' ');
                performSearch();
            });
            
            relatedGrid.appendChild(relatedCard);
        });
    }
    
    // Get category emoji
    function getCategoryEmoji(category) {
        const emojis = {
            headache: '🤕',
            stomach: '🤢',
            sleep: '😴',
            stress: '😫',
            fatigue: '😴',
            cold: '🤧',
            pain: '😣',
            anxiety: '😰',
            nutrition: '🍎',
            hydration: '💧',
            fitness: '🏃',
            immunity: '🛡️',
            digestion: '🫀',
            heart: '❤️',
            diabetes: '🩸',
            mental: '🧠',
            hygiene: '🧼'
        };
        return emojis[category] || '💡';
    }
    
    // SETUP CATEGORIES
    function setupCategories() {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Category clicked:', btn.dataset.category);
                // Remove active class from all buttons
                categoryBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                
                const category = btn.dataset.category;
                filterByCategory(category);
            });
        });
    }
    
    // FILTER BY CATEGORY
    function filterByCategory(category) {
        console.log('Filtering by category:', category);
        
        // Clear search input
        searchInput.value = '';
        
        const filteredTips = allTips.filter(tip => {
            // Check if tip belongs to this category or has matching situation
            if (tip.category === category) return true;
            if (tip.situation && tip.situation.includes(category)) return true;
            if (tip.keywords && tip.keywords.includes(category)) return true;
            return false;
        });
        
        console.log('Found tips for category', category, ':', filteredTips.length);
        
        if (filteredTips.length === 0) {
            categoryResultsDiv.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-tag"></i>
                    <p>No tips found for "${category}"</p>
                    <p>Try searching instead</p>
                </div>
            `;
            return;
        }
        
        displayCategoryResults(filteredTips, category);
    }
    
    // DISPLAY CATEGORY RESULTS
    function displayCategoryResults(tips, category) {
        categoryResultsDiv.innerHTML = '';
        
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `<h3>${category.charAt(0).toUpperCase() + category.slice(1)} Tips (${tips.length})</h3>`;
        categoryResultsDiv.appendChild(header);
        
        const grid = document.createElement('div');
        grid.className = 'tips-grid-container';
        
        // Show first 4 tips
        const tipsToShow = tips.length > 4 ? tips.slice(0, 4) : tips;
        
        tipsToShow.forEach(tip => {
            const tipCard = createCategoryTipCard(tip);
            grid.appendChild(tipCard);
        });
        
        categoryResultsDiv.appendChild(grid);
        
        // Add "Show More" button if there are more than 4 tips
        if (tips.length > 4) {
            const showMoreBtn = document.createElement('button');
            showMoreBtn.className = 'btn';
            showMoreBtn.innerHTML = `<i class="fas fa-plus"></i> Show All ${tips.length} Tips`;
            showMoreBtn.addEventListener('click', () => {
                showAllTipsInCategory(tips, category);
            });
            categoryResultsDiv.appendChild(showMoreBtn);
        }
    }
    
    // Create category tip card
    function createCategoryTipCard(tip) {
        const div = document.createElement('div');
        div.className = `tip-card ${tip.category || ''}`;
        
        const situationsHTML = (tip.situation || [])
            .map(s => `<span class="situation-tag">${s}</span>`)
            .join('');
        
        div.innerHTML = `
            <div class="tip-content">
                <div class="tip-icon">${getCategoryEmoji(tip.category)}</div>
                <p class="tip-text">${tip.text || ''}</p>
                ${situationsHTML ? `<div class="tip-situations">${situationsHTML}</div>` : ''}
                <div class="tip-meta">
                    <span class="tip-category">${tip.category || 'General'}</span>
                    <span class="tip-id">#${String(tip.id || '').padStart(3, '0')}</span>
                </div>
            </div>
        `;
        
        return div;
    }
    
    // SHOW ALL TIPS IN CATEGORY
    function showAllTipsInCategory(tips, category) {
        categoryResultsDiv.innerHTML = '';
        
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `<h3>All ${category} Tips (${tips.length})</h3>`;
        categoryResultsDiv.appendChild(header);
        
        const grid = document.createElement('div');
        grid.className = 'tips-grid-container';
        
        tips.forEach(tip => {
            const tipCard = createCategoryTipCard(tip);
            grid.appendChild(tipCard);
        });
        
        categoryResultsDiv.appendChild(grid);
        
        // Add "Show Less" button
        const showLessBtn = document.createElement('button');
        showLessBtn.className = 'btn';
        showLessBtn.innerHTML = `<i class="fas fa-minus"></i> Show Less`;
        showLessBtn.addEventListener('click', () => {
            filterByCategory(category);
        });
        categoryResultsDiv.appendChild(showLessBtn);
    }
    
    // TIP OF THE DAY
    function showDailyTip() {
        if (!dailyTips.length) {
            dailyTipDiv.textContent = "Drink a glass of water when you wake up!";
            return;
        }
        
        const hour = new Date().getHours();
        const tipIndex = hour % dailyTips.length;
        const tip = dailyTips[tipIndex];
        
        dailyTipDiv.innerHTML = `
            <div class="tip-content">
                <div class="tip-icon">${getEmojiFromTip(tip)}</div>
                <p class="tip-text">${tip}</p>
                <div class="tip-meta">
                    <span class="tip-time">🕐 Tip refreshes hourly</span>
                </div>
            </div>
        `;
    }
    
    function getEmojiFromTip(tip) {
        if (tip.includes('water') || tip.includes('💧')) return '💧';
        if (tip.includes('walk') || tip.includes('🏃')) return '🏃';
        if (tip.includes('sleep') || tip.includes('🛌')) return '🛌';
        if (tip.includes('fruit') || tip.includes('🍎')) return '🍎';
        if (tip.includes('vegetable') || tip.includes('🥬')) return '🥬';
        if (tip.includes('brush') || tip.includes('🦷')) return '🦷';
        return '💡';
    }
    
    // LOADING STATE
    function showLoading(show) {
        const container = document.querySelector('.container');
        if (show) {
            container.classList.add('loading');
        } else {
            container.classList.remove('loading');
        }
    }
    
    // FALLBACK DATA - More specific, symptom-based tips
    function loadFallbackData() {
        console.log('Loading fallback data...');
        
        allTips = [
            {
                id: 1,
                category: "headache",
                situation: ["migraine", "tension"],
                keywords: ["pain", "head", "migraine"],
                text: "For tension headaches, try applying a cold compress to your forehead and resting in a dark, quiet room."
            },
            {
                id: 2,
                category: "stomach",
                situation: ["indigestion", "bloating"],
                keywords: ["stomach ache", "digestion", "nausea"],
                text: "For indigestion, drink ginger tea and avoid lying down immediately after eating."
            },
            {
                id: 3,
                category: "sleep",
                situation: ["insomnia", "restlessness"],
                keywords: ["sleep", "insomnia", "tired"],
                text: "Establish a consistent sleep schedule and avoid screens 1 hour before bedtime."
            },
            {
                id: 4,
                category: "stress",
                situation: ["anxiety", "pressure"],
                keywords: ["stress", "anxiety", "worry"],
                text: "Practice deep breathing exercises for 5 minutes when feeling stressed."
            },
            {
                id: 5,
                category: "fatigue",
                situation: ["tiredness", "low energy"],
                keywords: ["fatigue", "tired", "energy"],
                text: "Stay hydrated and take short walks to boost energy levels naturally."
            },
            {
                id: 6,
                category: "cold",
                situation: ["flu", "congestion"],
                keywords: ["cold", "flu", "cough"],
                text: "Drink warm fluids and use a humidifier to relieve cold symptoms."
            },
            {
                id: 7,
                category: "pain",
                situation: ["back pain", "joint pain"],
                keywords: ["pain", "ache", "discomfort"],
                text: "Apply heat to sore muscles and practice gentle stretching exercises."
            },
            {
                id: 8,
                category: "anxiety",
                situation: ["panic", "worry"],
                keywords: ["anxiety", "panic", "nervous"],
                text: "Ground yourself by focusing on 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste."
            },
            {
                id: 9,
                category: "headache",
                situation: ["dehydration"],
                keywords: ["headache", "water"],
                text: "Drink 2 glasses of water - many headaches are caused by dehydration."
            },
            {
                id: 10,
                category: "stomach",
                situation: ["constipation"],
                keywords: ["stomach", "constipation"],
                text: "Increase fiber intake with fruits, vegetables, and whole grains."
            }
        ];
        
        dailyTips = [
            "💧 Start your day with a glass of water to hydrate your body.",
            "🧘 Take 5 deep breaths when feeling stressed or anxious.",
            "🚶 Go for a 10-minute walk to clear your mind and boost energy.",
            "🍎 Eat a piece of fruit as a healthy snack instead of processed foods.",
            "😴 Aim for 7-8 hours of sleep each night for optimal health."
        ];
        
        // Preprocess tips
        preprocessTips();
        
        // Reinitialize
        showDailyTip();
        showQuickSearchTips();
        
        console.log('Fallback data loaded successfully');
    }
    
    // SHOW NOTIFICATION
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const icon = type === 'error' ? 'fas fa-exclamation-circle' : 
                    type === 'success' ? 'fas fa-check-circle' : 
                    'fas fa-info-circle';
        
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Initialize the page
    initializePage();
    
    // Refresh daily tip every hour
    setInterval(showDailyTip, 3600000);
});