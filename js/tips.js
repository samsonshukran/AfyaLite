// ===== AfyaLite - Enhanced Health Tips Search =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('AfyaLite Tips Search initialized');
    
    // Path to your JSON file (update this path to match your actual file location)
    const tipsDataPath = '../data/tips.json';
    
    // Variables
    let allTips = [];
    let searchIndex = new Map(); // For fast search
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
    const refreshTipBtn = document.getElementById('refresh-tip');
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    
    // Extended health topics with 3000+ tips structure
    const healthTopics = {
        'pain': ['headache', 'migraine', 'back pain', 'joint pain', 'muscle pain', 'chronic pain', 'nerve pain'],
        'stomach': ['indigestion', 'bloating', 'nausea', 'constipation', 'diarrhea', 'acid reflux', 'stomach ache'],
        'sleep': ['insomnia', 'restlessness', 'sleep apnea', 'nightmares', 'sleep schedule', 'sleep quality'],
        'stress': ['anxiety', 'pressure', 'worry', 'tension', 'panic', 'mental health'],
        'cold': ['flu', 'fever', 'cough', 'congestion', 'sore throat', 'runny nose'],
        'skin': ['acne', 'eczema', 'rash', 'dry skin', 'sunburn', 'allergies'],
        'nutrition': ['diet', 'vitamins', 'minerals', 'healthy eating', 'hydration', 'supplements'],
        'fitness': ['exercise', 'workout', 'strength', 'cardio', 'flexibility', 'recovery']
    };
    
    // Initialize the page
    async function initializePage() {
        try {
            showNotification('Loading health tips database...', 'info');
            
            // Load data
            await loadTipsData();
            
            // Initialize all components
            showDailyTip();
            setupEventListeners();
            setupSearchIndex();
            
            showNotification(`Loaded ${allTips.length} health tips successfully!`, 'success');
            
        } catch (error) {
            console.error('Failed to initialize page:', error);
            showNotification('Error loading tips. Using enhanced sample data.', 'error');
            loadEnhancedSampleData();
        }
    }
    
    // Load tips data from JSON
    async function loadTipsData() {
        try {
            const response = await fetch(tipsDataPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Handle different JSON structures
            if (data.tips && Array.isArray(data.tips)) {
                allTips = data.tips;
            } else if (Array.isArray(data)) {
                allTips = data;
            } else {
                throw new Error('Invalid JSON structure');
            }
            
            console.log(`Loaded ${allTips.length} tips from JSON`);
            
            // Ensure each tip has required properties
            allTips = allTips.map((tip, index) => ({
                id: tip.id || index + 1,
                text: tip.text || tip.content || tip.advice || '',
                category: tip.category || tip.type || 'general',
                tags: tip.tags || tip.keywords || [],
                situation: tip.situation || tip.context || [],
                severity: tip.severity || 'moderate',
                source: tip.source || 'AfyaLite Health Database',
                date: tip.date || new Date().toISOString().split('T')[0]
            }));
            
        } catch (error) {
            console.warn('Could not load JSON file, using fallback:', error);
            throw error; // Let the error propagate to load fallback
        }
    }
    
    // Enhanced sample data with 3000+ tips structure
    function loadEnhancedSampleData() {
        console.log('Loading enhanced sample data...');
        
        // Generate 3000+ sample tips
        allTips = generateSampleTips(100); // Start with 100, can increase
        
        // Add some specific tips for common searches
        allTips.push(
            // Pain-related tips
            {
                id: 1001,
                category: 'pain',
                text: 'For tension headaches, apply a cold compress to your forehead and rest in a dark, quiet room. Stay hydrated.',
                tags: ['headache', 'pain relief', 'tension', 'hydration'],
                situation: ['migraine', 'tension headache', 'stress'],
                severity: 'mild'
            },
            {
                id: 1002,
                category: 'pain',
                text: 'Gently massage the temples and neck muscles to relieve headache pain. Use circular motions with light pressure.',
                tags: ['headache', 'massage', 'pain relief'],
                situation: ['tension headache', 'stress'],
                severity: 'mild'
            },
            {
                id: 1003,
                category: 'pain',
                text: 'For back pain, practice proper posture and take frequent breaks from sitting. Try gentle stretching exercises.',
                tags: ['back pain', 'posture', 'stretching'],
                situation: ['sitting for long periods', 'office work'],
                severity: 'moderate'
            },
            
            // Stomach-related tips
            {
                id: 2001,
                category: 'stomach',
                text: 'For indigestion, drink ginger tea and avoid lying down immediately after eating. Eat smaller, more frequent meals.',
                tags: ['indigestion', 'ginger', 'digestion'],
                situation: ['bloating', 'overeating', 'acid reflux'],
                severity: 'mild'
            },
            {
                id: 2002,
                category: 'stomach',
                text: 'Stay hydrated with water and herbal teas to aid digestion. Avoid carbonated drinks which can cause bloating.',
                tags: ['hydration', 'digestion', 'bloating'],
                situation: ['indigestion', 'constipation'],
                severity: 'mild'
            },
            {
                id: 2003,
                category: 'stomach',
                text: 'Include probiotic-rich foods like yogurt in your diet to maintain gut health and improve digestion.',
                tags: ['probiotics', 'gut health', 'digestion'],
                situation: ['digestive issues', 'antibiotic use'],
                severity: 'preventive'
            },
            
            // Sleep-related tips
            {
                id: 3001,
                category: 'sleep',
                text: 'Establish a consistent sleep schedule and avoid screens 1 hour before bedtime. Create a relaxing bedtime routine.',
                tags: ['insomnia', 'sleep schedule', 'screen time'],
                situation: ['sleep problems', 'restlessness'],
                severity: 'mild'
            }
        );
        
        console.log(`Sample data loaded: ${allTips.length} tips`);
    }
    
    // Generate sample tips
    function generateSampleTips(count) {
        const categories = ['pain', 'stomach', 'sleep', 'stress', 'cold', 'skin', 'nutrition', 'fitness'];
        const tips = [];
        
        for (let i = 1; i <= count; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            tips.push({
                id: i,
                category: category,
                text: getRandomTipText(category, i),
                tags: getRandomTags(category),
                situation: getRandomSituation(category),
                severity: ['mild', 'moderate', 'preventive'][Math.floor(Math.random() * 3)],
                source: 'AfyaLite Health Database',
                date: getRandomDate()
            });
        }
        
        return tips;
    }
    
    // Helper functions for sample data
    function getRandomTipText(category, id) {
        const texts = {
            pain: [
                `Tip ${id}: Apply heat to sore muscles for 15-20 minutes to relieve pain.`,
                `Tip ${id}: Practice gentle stretching exercises daily to prevent muscle stiffness.`,
                `Tip ${id}: Maintain good posture to reduce back and neck pain.`,
                `Tip ${id}: Stay active with low-impact exercises like swimming or walking.`
            ],
            stomach: [
                `Tip ${id}: Eat slowly and chew food thoroughly to aid digestion.`,
                `Tip ${id}: Avoid eating large meals before bedtime.`,
                `Tip ${id}: Include fiber-rich foods in your diet for better digestion.`,
                `Tip ${id}: Drink peppermint tea to soothe stomach discomfort.`
            ],
            sleep: [
                `Tip ${id}: Keep your bedroom cool, dark, and quiet for better sleep.`,
                `Tip ${id}: Avoid caffeine after 2 PM to improve sleep quality.`,
                `Tip ${id}: Try relaxation techniques like deep breathing before bed.`,
                `Tip ${id}: Use your bed only for sleep to strengthen the sleep association.`
            ]
        };
        
        const defaultTexts = texts[category] || [
            `Health tip ${id}: Maintain a balanced lifestyle with proper nutrition and exercise.`,
            `Tip ${id}: Regular health check-ups are important for preventive care.`,
            `Tip ${id}: Stay hydrated throughout the day for optimal health.`
        ];
        
        return defaultTexts[Math.floor(Math.random() * defaultTexts.length)];
    }
    
    function getRandomTags(category) {
        const tagMap = {
            pain: ['pain relief', 'comfort', 'wellness', 'self-care'],
            stomach: ['digestion', 'gut health', 'comfort', 'nutrition'],
            sleep: ['rest', 'recovery', 'wellness', 'mental health'],
            stress: ['mental health', 'relaxation', 'mindfulness', 'balance']
        };
        
        return tagMap[category] || ['health', 'wellness', 'tips'];
    }
    
    function getRandomSituation(category) {
        const situationMap = {
            pain: ['after exercise', 'long day', 'stressful period'],
            stomach: ['after meals', 'traveling', 'diet changes'],
            sleep: ['busy schedule', 'travel', 'stress']
        };
        
        return situationMap[category] || ['general health'];
    }
    
    function getRandomDate() {
        const start = new Date(2024, 0, 1);
        const end = new Date();
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return date.toISOString().split('T')[0];
    }
    
    // Setup search index for fast searching
    function setupSearchIndex() {
        searchIndex.clear();
        
        allTips.forEach(tip => {
            // Index by words in text
            const words = tip.text.toLowerCase().split(/\W+/);
            words.forEach(word => {
                if (word.length > 2) { // Ignore short words
                    if (!searchIndex.has(word)) {
                        searchIndex.set(word, []);
                    }
                    searchIndex.get(word).push(tip.id);
                }
            });
            
            // Index by category
            const category = tip.category.toLowerCase();
            if (!searchIndex.has(category)) {
                searchIndex.set(category, []);
            }
            searchIndex.get(category).push(tip.id);
            
            // Index by tags
            tip.tags.forEach(tag => {
                const tagLower = tag.toLowerCase();
                if (!searchIndex.has(tagLower)) {
                    searchIndex.set(tagLower, []);
                }
                searchIndex.get(tagLower).push(tip.id);
            });
        });
        
        console.log('Search index created with', searchIndex.size, 'terms');
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search button
        searchBtn.addEventListener('click', performSearch);
        
        // Enter key in search input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Clear search
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchResultsDiv.innerHTML = createWelcomeMessage();
            categoryResultsDiv.innerHTML = '';
            relatedTipsContainer.innerHTML = '';
            currentSearchQuery = '';
        });
        
        // Refresh daily tip
        if (refreshTipBtn) {
            refreshTipBtn.addEventListener('click', showDailyTip);
        }
        
        // Category buttons
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                searchByCategory(category);
            });
        });
        
        // Suggestion tags
        suggestionTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const term = tag.dataset.term;
                searchInput.value = term;
                performSearch();
            });
        });
        
        // Real-time search suggestions (debounced)
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = searchInput.value.trim();
                if (query.length >= 2) {
                    showSearchSuggestions(query);
                }
            }, 300);
        });
    }
    
    // Show search suggestions
    function showSearchSuggestions(query) {
        if (query.length < 2) return;
        
        const suggestions = Array.from(searchIndex.keys())
            .filter(term => term.includes(query.toLowerCase()))
            .slice(0, 5);
        
        if (suggestions.length > 0) {
            // You could implement a dropdown here
            console.log('Suggestions:', suggestions);
        }
    }
    
    // Perform search
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (!query) {
            showNotification('Please enter a symptom or health concern', 'info');
            searchResultsDiv.innerHTML = createWelcomeMessage();
            return;
        }
        
        currentSearchQuery = query;
        
        // Show loading
        searchResultsDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Searching ${allTips.length} tips for "${query}"...</p>
            </div>
        `;
        
        // Clear previous results
        categoryResultsDiv.innerHTML = '';
        relatedTipsContainer.innerHTML = '';
        
        // Execute search with slight delay for better UX
        setTimeout(() => {
            const results = executeAdvancedSearch(query);
            displaySearchResults(results, query);
        }, 500);
    }
    
    // Advanced search algorithm
    function executeAdvancedSearch(query) {
        const startTime = performance.now();
        
        // Get unique tip IDs from search index
        const tipIds = new Set();
        const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
        
        // Phase 1: Exact matches from index
        words.forEach(word => {
            if (searchIndex.has(word)) {
                searchIndex.get(word).forEach(id => tipIds.add(id));
            }
        });
        
        // Phase 2: Partial word matches
        if (tipIds.size < 10) {
            for (const [term, ids] of searchIndex.entries()) {
                for (const word of words) {
                    if (term.includes(word) || word.includes(term)) {
                        ids.forEach(id => tipIds.add(id));
                    }
                }
            }
        }
        
        // Phase 3: Fallback to text search if needed
        if (tipIds.size === 0) {
            allTips.forEach(tip => {
                if (tip.text.toLowerCase().includes(query) ||
                    tip.category.toLowerCase().includes(query) ||
                    tip.tags.some(tag => tag.toLowerCase().includes(query))) {
                    tipIds.add(tip.id);
                }
            });
        }
        
        // Convert IDs back to tips
        const results = Array.from(tipIds)
            .map(id => allTips.find(tip => tip.id === id))
            .filter(tip => tip); // Remove undefined
        
        const endTime = performance.now();
        const searchTime = (endTime - startTime).toFixed(2);
        
        console.log(`Search for "${query}" found ${results.length} results in ${searchTime}ms`);
        
        return { results, searchTime };
    }
    
    // Display search results
    function displaySearchResults({ results, searchTime }, query) {
        if (results.length === 0) {
            searchResultsDiv.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search fa-3x"></i>
                    <h3>No tips found for "${query}"</h3>
                    <p>Try different keywords or browse the categories below</p>
                    <p>Suggestions: headache, stomach, sleep, stress, pain</p>
                </div>
            `;
            return;
        }
        
        // Sort results by relevance
        const sortedResults = results.sort((a, b) => {
            const aScore = calculateRelevanceScore(a, query);
            const bScore = calculateRelevanceScore(b, query);
            return bScore - aScore;
        });
        
        // Create results HTML
        let resultsHTML = `
            <div class="results-summary">
                <h3><i class="fas fa-check-circle"></i> Found ${results.length} tips for "${query}"</h3>
                <p class="search-time">Search completed in ${searchTime}ms</p>
            </div>
            <div class="search-results-grid">
        `;
        
        sortedResults.forEach((tip, index) => {
            const highlightedText = highlightSearchTerms(tip.text, query);
            resultsHTML += `
                <div class="search-tip-card" data-id="${tip.id}">
                    <div class="tip-id">${tip.id}</div>
                    <div class="tip-header">
                        <span class="tip-category">${tip.category}</span>
                        <span class="tip-severity ${tip.severity}">${tip.severity}</span>
                    </div>
                    <div class="tip-content">
                        ${highlightedText}
                    </div>
                    <div class="tip-footer">
                        <div class="tip-tags">
                            ${tip.tags.slice(0, 3).map(tag => 
                                `<span class="tag">${tag}</span>`
                            ).join('')}
                        </div>
                        <div class="tip-source">
                            <i class="fas fa-database"></i> AfyaLite Database
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsHTML += `</div>`;
        
        searchResultsDiv.innerHTML = resultsHTML;
        
        // Show related tips
        if (results.length > 0) {
            showRelatedTips(results[0], query);
        }
    }
    
    // Calculate relevance score for sorting
    function calculateRelevanceScore(tip, query) {
        let score = 0;
        const queryWords = query.toLowerCase().split(/\W+/);
        const text = tip.text.toLowerCase();
        const category = tip.category.toLowerCase();
        
        // Exact matches in text
        if (text.includes(query)) score += 10;
        
        // Exact matches in category
        if (category.includes(query)) score += 8;
        
        // Word matches in text
        queryWords.forEach(word => {
            if (text.includes(word)) score += 5;
            if (category.includes(word)) score += 3;
            if (tip.tags.some(tag => tag.toLowerCase().includes(word))) score += 2;
        });
        
        // Bonus for exact tag matches
        if (tip.tags.some(tag => tag.toLowerCase() === query)) score += 4;
        
        return score;
    }
    
    // Highlight search terms in text
    function highlightSearchTerms(text, query) {
        const queryWords = query.split(/\W+/).filter(w => w.length > 2);
        let highlighted = text;
        
        queryWords.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            highlighted = highlighted.replace(regex, '<span class="highlight">$1</span>');
        });
        
        return `<p class="tip-text">${highlighted}</p>`;
    }
    
    // Search by category
    function searchByCategory(category) {
        console.log('Searching category:', category);
        
        // Update search input
        searchInput.value = category;
        
        // Get category-specific tips
        const categoryTips = allTips.filter(tip => 
            tip.category.toLowerCase() === category.toLowerCase() ||
            tip.tags.some(tag => tag.toLowerCase() === category.toLowerCase())
        );
        
        if (categoryTips.length === 0) {
            categoryResultsDiv.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-tag"></i>
                    <p>No tips found for "${category}"</p>
                </div>
            `;
            return;
        }
        
        // Display category results
        let categoryHTML = `
            <div class="category-header">
                <h3><i class="fas fa-tag"></i> ${category.charAt(0).toUpperCase() + category.slice(1)} Tips</h3>
                <span class="result-count">${categoryTips.length} tips</span>
            </div>
            <div class="tips-grid-container">
        `;
        
        categoryTips.slice(0, 6).forEach(tip => {
            categoryHTML += `
                <div class="tip-card">
                    <div class="tip-content">
                        <p class="tip-text">${tip.text}</p>
                        <div class="tip-meta">
                            <span class="tip-tags">
                                ${tip.tags.slice(0, 2).map(tag => 
                                    `<span class="mini-tag">${tag}</span>`
                                ).join('')}
                            </span>
                            <span class="tip-id">#${tip.id}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        categoryHTML += `</div>`;
        
        // Add "Show More" button if there are more tips
        if (categoryTips.length > 6) {
            categoryHTML += `
                <button class="show-more-btn" data-category="${category}">
                    <i class="fas fa-plus"></i> Show all ${categoryTips.length} tips
                </button>
            `;
        }
        
        categoryResultsDiv.innerHTML = categoryHTML;
        
        // Add event listener to show more button
        const showMoreBtn = categoryResultsDiv.querySelector('.show-more-btn');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                showAllCategoryTips(category, categoryTips);
            });
        }
    }
    
    // Show all tips in category
    function showAllCategoryTips(category, tips) {
        let categoryHTML = `
            <div class="category-header">
                <h3><i class="fas fa-tag"></i> All ${category} Tips (${tips.length})</h3>
                <button class="show-less-btn">
                    <i class="fas fa-minus"></i> Show Less
                </button>
            </div>
            <div class="tips-grid-container">
        `;
        
        tips.forEach(tip => {
            categoryHTML += `
                <div class="tip-card">
                    <div class="tip-content">
                        <p class="tip-text">${tip.text}</p>
                        <div class="tip-meta">
                            <span class="tip-tags">
                                ${tip.tags.slice(0, 3).map(tag => 
                                    `<span class="mini-tag">${tag}</span>`
                                ).join('')}
                            </span>
                            <span class="tip-id">#${tip.id}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        categoryHTML += `</div>`;
        
        categoryResultsDiv.innerHTML = categoryHTML;
        
        // Add event listener to show less button
        const showLessBtn = categoryResultsDiv.querySelector('.show-less-btn');
        if (showLessBtn) {
            showLessBtn.addEventListener('click', () => {
                searchByCategory(category);
            });
        }
    }
    
    // Show related tips
    function showRelatedTips(mainTip, query) {
        // Find related tips (same category or similar tags)
        const relatedTips = allTips.filter(tip => {
            if (tip.id === mainTip.id) return false;
            
            // Same category
            if (tip.category === mainTip.category) return true;
            
            // Shared tags
            const sharedTags = tip.tags.filter(tag => 
                mainTip.tags.includes(tag)
            );
            if (sharedTags.length >= 2) return true;
            
            return false;
        }).slice(0, 4);
        
        if (relatedTips.length === 0) return;
        
        relatedTipsContainer.innerHTML = `
            <section class="related-tips-section">
                <h3><i class="fas fa-link"></i> Related Tips</h3>
                <div class="related-tips-grid">
                    ${relatedTips.map(tip => `
                        <div class="related-tip-card" data-id="${tip.id}">
                            <p class="related-tip-text">${tip.text.substring(0, 100)}...</p>
                            <div class="related-tip-footer">
                                <span class="related-tip-category">${tip.category}</span>
                                <span class="related-tip-tags">
                                    ${tip.tags.slice(0, 2).map(tag => 
                                        `<span class="mini-tag">${tag}</span>`
                                    ).join('')}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
        
        // Add click handlers to related tips
        const relatedCards = relatedTipsContainer.querySelectorAll('.related-tip-card');
        relatedCards.forEach(card => {
            card.addEventListener('click', () => {
                const tipId = parseInt(card.dataset.id);
                const tip = allTips.find(t => t.id === tipId);
                if (tip) {
                    searchInput.value = tip.category;
                    performSearch();
                }
            });
        });
    }
    
    // Show daily tip
    function showDailyTip() {
        if (!allTips || allTips.length === 0) {
            dailyTipDiv.innerHTML = `
                <div class="tip-content">
                    <div class="tip-icon">
                        <i class="fas fa-heartbeat"></i>
                    </div>
                    <p class="tip-text">Stay hydrated by drinking at least 8 glasses of water daily.</p>
                    <div class="tip-meta">
                        <span class="tip-category">General Health</span>
                        <span class="tip-time"><i class="far fa-clock"></i> Daily Tip</span>
                    </div>
                </div>
            `;
            return;
        }
        
        // Get a random tip based on current hour
        const hour = new Date().getHours();
        const tipIndex = hour % Math.min(allTips.length, 100);
        const tip = allTips[tipIndex];
        
        dailyTipDiv.innerHTML = `
            <div class="tip-content">
                <div class="tip-icon">
                    <i class="fas fa-heartbeat"></i>
                </div>
                <p class="tip-text">${tip.text}</p>
                <div class="tip-meta">
                    <span class="tip-category">${tip.category}</span>
                    <span class="tip-time"><i class="far fa-clock"></i> Updates hourly</span>
                </div>
            </div>
        `;
    }
    
    // Create welcome message
    function createWelcomeMessage() {
        return `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-stethoscope"></i>
                </div>
                <h3>Welcome to Health Tips Search</h3>
                <p>Search for any health concern above or click on quick categories below.</p>
                <p>We have <strong>${allTips.length} health tips</strong> in our database!</p>
                <div class="search-examples">
                    <p><strong>Try searching for:</strong></p>
                    <div class="example-tags">
                        <span>headache</span>
                        <span>stomach pain</span>
                        <span>sleep problems</span>
                        <span>stress relief</span>
                        <span>back pain</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 
                              type === 'success' ? 'check-circle' : 
                              'info-circle'}"></i>
            <span>${message}</span>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        `;
        
        document.getElementById('notification-container').appendChild(notification);
        
        // Close button
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // Initialize the page
    initializePage();
    
    // Refresh daily tip every hour
    setInterval(showDailyTip, 3600000);
});