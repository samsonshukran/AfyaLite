document.addEventListener('DOMContentLoaded', async () => {
    console.log('Modern Meal Planner initialized');
    
    // State management
    let mealData = null;
    let currentWeek = 1;
    let selectedDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    let waterGlasses = 0;
    
    // DOM Elements
    const elements = {
        // Dashboard
        nutritionScore: document.getElementById('nutritionScore'),
        balancedCount: document.getElementById('balancedCount'),
        waterIntake: document.getElementById('waterIntake'),
        totalPrepTime: document.getElementById('totalPrepTime'),
        
        // Weekly Plan
        currentWeekDisplay: document.getElementById('currentWeek'),
        weekGrid: document.getElementById('weekGrid'),
        weeklyPrepTime: document.getElementById('weeklyPrepTime'),
        veggieDays: document.getElementById('veggieDays'),
        totalMeals: document.getElementById('totalMeals'),
        
        // Day Selector
        daySelector: document.getElementById('daySelector'),
        selectedDayTheme: document.getElementById('selectedDayTheme'),
        
        // Meal Inputs
        breakfastInput: document.getElementById('breakfastInput'),
        lunchInput: document.getElementById('lunchInput'),
        dinnerInput: document.getElementById('dinnerInput'),
        
        // Meal Suggestions
        breakfastSuggestion: document.getElementById('breakfastSuggestion'),
        lunchSuggestion: document.getElementById('lunchSuggestion'),
        dinnerSuggestion: document.getElementById('dinnerSuggestion'),
        
        // Analysis Results
        breakfastResult: document.getElementById('breakfastResult'),
        lunchResult: document.getElementById('lunchResult'),
        dinnerResult: document.getElementById('dinnerResult'),
        
        // Badges
        breakfastBadges: document.getElementById('breakfastBadges'),
        lunchBadges: document.getElementById('lunchBadges'),
        dinnerBadges: document.getElementById('dinnerBadges'),
        
        // Progress
        progressScore: document.getElementById('progressScore'),
        progressFill: document.getElementById('progressFill'),
        progressTip: document.getElementById('progressTip'),
        
        // Nutrition Guide
        categoryTitle: document.getElementById('categoryTitle'),
        categoryDesc: document.getElementById('categoryDesc'),
        foodExamples: document.getElementById('foodExamples'),
        tipsList: document.getElementById('tipsList'),
        prepTips: document.getElementById('prepTips'),
        dailyTip: document.getElementById('dailyTip'),
        
        // Modals
        shoppingModal: document.getElementById('shoppingModal'),
        tipsModal: document.getElementById('tipsModal')
    };
    
    // Food categories for analysis
    const foodCategories = {
        proteins: ["chicken", "fish", "beef", "eggs", "beans", "lentils", "tofu", "milk", "yogurt", "cheese", "pork", "goat"],
        carbs: ["rice", "ugali", "chapati", "matoke", "githeri", "potatoes", "pasta", "bread", "maize", "sweet potatoes", "cassava"],
        vegetables: ["sukuma", "spinach", "cabbage", "kachumbari", "carrots", "tomatoes", "onions", "peppers", "broccoli", "lettuce"],
        fruits: ["banana", "mango", "pawpaw", "orange", "apple", "pineapple", "watermelon", "avocado", "passion fruit", "guava"],
        dairy: ["milk", "yogurt", "cheese", "butter"],
        healthyFats: ["avocado", "nuts", "seeds", "olive oil"]
    };
    
    // Health Tips
    const healthTips = [
        "Drink a glass of water 30 minutes before meals",
        "Include protein in every meal for sustained energy",
        "Eat a variety of colored vegetables daily",
        "Don't skip breakfast - it kickstarts your metabolism",
        "Chew your food slowly and mindfully",
        "Include healthy fats like avocado or nuts",
        "Limit processed foods and added sugars",
        "Stay hydrated throughout the day",
        "Plan your meals ahead to avoid unhealthy choices",
        "Listen to your body's hunger and fullness cues"
    ];
    
    // Initialize the application
    await initApp();
    
    async function initApp() {
        try {
            // Load meal data from JSON
            const response = await fetch('../data/meal.json');
            if (response.ok) {
                mealData = await response.json();
                console.log('Meal data loaded successfully');
            } else {
                throw new Error('Failed to load meal data');
            }
        } catch (error) {
            console.error('Error loading meal data:', error);
            // Create fallback data
            mealData = createFallbackData();
            showNotification('Using local data. Check data/meal.json for full features.', 'info');
        }
        
        // Initialize all components
        initEventListeners();
        setupUI();
        loadWeeklyPlan();
        loadDayMeals(selectedDay);
        loadNutritionGuide('proteins');
        loadHealthTips();
        loadPreparationTips();
        updateDailyTip();
        updateWaterTracker();
        
        // Set current day
        elements.daySelector.value = selectedDay;
    }
    
    function initEventListeners() {
        // Quick Actions
        document.getElementById('quickPlanBtn').addEventListener('click', generateQuickPlan);
        document.getElementById('shoppingBtn').addEventListener('click', generateShoppingList);
        document.getElementById('tipsBtn').addEventListener('click', showTipsModal);
        document.getElementById('printBtn').addEventListener('click', printWeeklyPlan);
        document.getElementById('resetWaterBtn').addEventListener('click', resetWaterTracker);
        
        // Week Navigation
        document.getElementById('prevWeekBtn').addEventListener('click', () => navigateWeek(-1));
        document.getElementById('nextWeekBtn').addEventListener('click', () => navigateWeek(1));
        
        // Day Selector
        elements.daySelector.addEventListener('change', (e) => {
            selectedDay = e.target.value;
            loadDayMeals(selectedDay);
            updateActiveDayCard();
        });
        
        // Tab Navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                switchTab(tabId);
            });
        });
        
        // Use Suggestion Buttons
        document.querySelectorAll('.use-suggestion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mealType = e.target.dataset.meal;
                useSuggestion(mealType);
            });
        });
        
        // Quick Add Buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const food = e.target.dataset.food;
                addFoodToInput(food);
            });
        });
        
        // Meal Analysis
        document.getElementById('analyzeAllBtn').addEventListener('click', analyzeAllMeals);
        document.getElementById('clearAllBtn').addEventListener('click', clearAllMeals);
        document.getElementById('savePlanBtn').addEventListener('click', saveDailyPlan);
        
        // Nutrition Categories
        document.querySelectorAll('.category').forEach(cat => {
            cat.addEventListener('click', () => {
                const category = cat.dataset.category;
                loadNutritionGuide(category);
            });
        });
        
        // Water Tracker
        document.querySelectorAll('.glass').forEach(glass => {
            glass.addEventListener('click', () => {
                toggleWaterGlass(glass);
            });
        });
        
        // Real-time Analysis
        elements.breakfastInput.addEventListener('input', debounce(() => analyzeMeal('breakfast'), 500));
        elements.lunchInput.addEventListener('input', debounce(() => analyzeMeal('lunch'), 500));
        elements.dinnerInput.addEventListener('input', debounce(() => analyzeMeal('dinner'), 500));
        
        // Modal Close Buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                closeAllModals();
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeAllModals();
            }
        });
    }
    
    function setupUI() {
        // Set current week display
        updateWeekDisplay();
        
        // Set today's theme
        updateDailyTheme();
    }
    
    function loadWeeklyPlan() {
        if (!mealData?.weeklyMeals) return;
        
        elements.weekGrid.innerHTML = '';
        
        let totalPrepTime = 0;
        let veggieDayCount = 0;
        
        mealData.weeklyMeals.forEach(dayData => {
            // Create day card
            const dayCard = createDayCard(dayData);
            elements.weekGrid.appendChild(dayCard);
            
            // Calculate stats
            dayData.foods.forEach(meal => {
                totalPrepTime += meal.prepTime || 0;
            });
            
            if (dayData.theme?.toLowerCase().includes('veggie') || dayData.theme?.toLowerCase().includes('green')) {
                veggieDayCount++;
            }
        });
        
        // Update stats
        elements.weeklyPrepTime.textContent = `${totalPrepTime} mins`;
        elements.veggieDays.textContent = `${veggieDayCount} days`;
        elements.totalMeals.textContent = `${mealData.weeklyMeals.length * 3} meals`;
        
        // Set active day card
        updateActiveDayCard();
    }
    
    function createDayCard(dayData) {
        const isActive = dayData.day === selectedDay;
        const dayCard = document.createElement('div');
        dayCard.className = `day-card ${isActive ? 'active' : ''}`;
        dayCard.dataset.day = dayData.day;
        
        // Get meals for the day
        const breakfast = dayData.foods?.find(m => m.meal === 'breakfast') || {};
        const lunch = dayData.foods?.find(m => m.meal === 'lunch') || {};
        const dinner = dayData.foods?.find(m => m.meal === 'dinner') || {};
        
        dayCard.innerHTML = `
            <div class="day-header">
                <div class="day-name">${dayData.day}</div>
                <div class="day-theme">${dayData.theme || 'Healthy'}</div>
            </div>
            <div class="day-date">${dayData.date || ''}</div>
            <div class="day-meals">
                <div class="day-meal">
                    <div class="meal-time">
                        <i class="fas fa-sun"></i> Breakfast
                    </div>
                    <div class="meal-name">${breakfast.name || 'Not set'}</div>
                    <div class="meal-stats">
                        <span><i class="fas fa-clock"></i> ${breakfast.prepTime || 0}m</span>
                        <span><i class="fas fa-fire"></i> ${breakfast.calories || 0}cal</span>
                    </div>
                </div>
                <div class="day-meal">
                    <div class="meal-time">
                        <i class="fas fa-utensils"></i> Lunch
                    </div>
                    <div class="meal-name">${lunch.name || 'Not set'}</div>
                    <div class="meal-stats">
                        <span><i class="fas fa-clock"></i> ${lunch.prepTime || 0}m</span>
                        <span><i class="fas fa-fire"></i> ${lunch.calories || 0}cal</span>
                    </div>
                </div>
                <div class="day-meal">
                    <div class="meal-time">
                        <i class="fas fa-moon"></i> Dinner
                    </div>
                    <div class="meal-name">${dinner.name || 'Not set'}</div>
                    <div class="meal-stats">
                        <span><i class="fas fa-clock"></i> ${dinner.prepTime || 0}m</span>
                        <span><i class="fas fa-fire"></i> ${dinner.calories || 0}cal</span>
                    </div>
                </div>
            </div>
            ${dayData.snack ? `<div class="day-snack"><i class="fas fa-apple-alt"></i> ${dayData.snack}</div>` : ''}
        `;
        
        // Add click event
        dayCard.addEventListener('click', () => {
            selectedDay = dayData.day;
            elements.daySelector.value = selectedDay;
            loadDayMeals(selectedDay);
            updateActiveDayCard();
        });
        
        return dayCard;
    }
    
    function updateActiveDayCard() {
        document.querySelectorAll('.day-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const activeCard = document.querySelector(`.day-card[data-day="${selectedDay}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }
    }
    
    function loadDayMeals(day) {
        const dayData = mealData.weeklyMeals?.find(d => d.day === day);
        if (!dayData) return;
        
        // Update day theme
        updateDailyTheme();
        
        // Update meal suggestions and info
        const meals = {
            breakfast: dayData.foods?.find(m => m.meal === 'breakfast'),
            lunch: dayData.foods?.find(m => m.meal === 'lunch'),
            dinner: dayData.foods?.find(m => m.meal === 'dinner')
        };
        
        Object.entries(meals).forEach(([mealType, meal]) => {
            if (meal) {
                const suggestionEl = document.getElementById(`${mealType}Suggestion`);
                if (suggestionEl) suggestionEl.textContent = meal.name;
                
                // Update calories display
                const caloriesEl = document.getElementById(`${mealType}Calories`);
                if (caloriesEl) caloriesEl.textContent = meal.calories || 0;
            }
        });
        
        // Update water goal
        elements.waterIntake.textContent = `0/${dayData.waterGoal || '8'} glasses`;
        
        // Update prep time
        const totalDayPrep = dayData.foods?.reduce((sum, meal) => sum + (meal.prepTime || 0), 0) || 0;
        elements.totalPrepTime.textContent = `${totalDayPrep} mins`;
    }
    
    function updateDailyTheme() {
        const dayData = mealData.weeklyMeals?.find(d => d.day === selectedDay);
        if (dayData?.theme) {
            const themeSpan = elements.selectedDayTheme.querySelector('span');
            if (themeSpan) {
                themeSpan.textContent = `Theme: ${dayData.theme}`;
            }
        }
    }
    
    function switchTab(tabId) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabId) {
                tab.classList.add('active');
            }
        });
        
        // Show active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}Tab`) {
                content.classList.add('active');
            }
        });
    }
    
    function useSuggestion(mealType) {
        const suggestionEl = document.getElementById(`${mealType}Suggestion`);
        const inputEl = document.getElementById(`${mealType}Input`);
        
        if (suggestionEl && inputEl) {
            inputEl.value = suggestionEl.textContent;
            analyzeMeal(mealType);
            showNotification(`${mealType} suggestion applied!`, 'success');
        }
    }
    
    function addFoodToInput(food) {
        const activeInput = document.querySelector('.tab-content.active .meal-input');
        if (activeInput) {
            const currentValue = activeInput.value;
            activeInput.value = currentValue ? `${currentValue}, ${food}` : food;
            const mealType = activeInput.id.replace('Input', '');
            analyzeMeal(mealType);
        }
    }
    
    function analyzeMeal(mealType) {
        const inputEl = document.getElementById(`${mealType}Input`);
        const resultEl = document.getElementById(`${mealType}Result`);
        const badgesEl = document.getElementById(`${mealType}Badges`);
        
        if (!inputEl || !resultEl || !badgesEl) return;
        
        const mealText = inputEl.value.toLowerCase().trim();
        
        if (!mealText) {
            resultEl.textContent = 'Enter your meal to analyze';
            resultEl.style.color = '#666';
            badgesEl.innerHTML = '';
            return;
        }
        
        // Check food categories
        const categoriesFound = [];
        const analysis = {
            hasProtein: checkCategory(mealText, 'proteins'),
            hasCarb: checkCategory(mealText, 'carbs'),
            hasVegetable: checkCategory(mealText, 'vegetables'),
            hasFruit: checkCategory(mealText, 'fruits'),
            hasDairy: checkCategory(mealText, 'dairy'),
            hasHealthyFat: checkCategory(mealText, 'healthyFats')
        };
        
        // Create badges
        badgesEl.innerHTML = '';
        Object.entries(analysis).forEach(([category, has]) => {
            if (has && category !== 'hasHealthyFat') {
                const badge = createNutritionBadge(category.replace('has', '').toLowerCase());
                badgesEl.appendChild(badge);
                categoriesFound.push(category);
            }
        });
        
        // Determine meal quality
        const isBalanced = analysis.hasProtein && analysis.hasCarb && (analysis.hasVegetable || analysis.hasFruit);
        const score = categoriesFound.length;
        
        if (isBalanced && score >= 3) {
            resultEl.textContent = '✅ Excellent! This is a balanced meal!';
            resultEl.style.color = '#27ae60';
        } else if (score >= 2) {
            resultEl.textContent = '⚠️ Good! Could use more variety.';
            resultEl.style.color = '#f39c12';
        } else if (score >= 1) {
            resultEl.textContent = '📝 Basic. Add more food groups.';
            resultEl.style.color = '#3498db';
        } else {
            resultEl.textContent = '❌ Needs improvement. Add proteins, carbs, or veggies.';
            resultEl.style.color = '#e74c3c';
        }
        
        // Update dashboard
        updateDashboard();
    }
    
    function checkCategory(mealText, category) {
        return foodCategories[category]?.some(food => mealText.includes(food.toLowerCase())) || false;
    }
    
    function createNutritionBadge(category) {
        const badge = document.createElement('span');
        badge.className = `nutrition-badge badge-${category}`;
        
        const labels = {
            protein: 'Protein',
            carb: 'Carbs',
            vegetable: 'Veggies',
            fruit: 'Fruits',
            dairy: 'Dairy'
        };
        
        badge.textContent = labels[category] || category;
        return badge;
    }
    
    function analyzeAllMeals() {
        analyzeMeal('breakfast');
        analyzeMeal('lunch');
        analyzeMeal('dinner');
        
        // Calculate overall score
        updateDashboard();
        
        showNotification('All meals analyzed!', 'success');
    }
    
    function updateDashboard() {
        const meals = ['breakfast', 'lunch', 'dinner'];
        let balancedCount = 0;
        let totalScore = 0;
        
        meals.forEach(mealType => {
            const input = document.getElementById(`${mealType}Input`).value;
            if (input) {
                const analysis = {
                    hasProtein: checkCategory(input, 'proteins'),
                    hasCarb: checkCategory(input, 'carbs'),
                    hasVegetable: checkCategory(input, 'vegetables') || checkCategory(input, 'fruits')
                };
                
                if (analysis.hasProtein && analysis.hasCarb && analysis.hasVegetable) {
                    balancedCount++;
                    totalScore += 100;
                } else if (analysis.hasProtein || analysis.hasCarb) {
                    totalScore += 50;
                }
            }
        });
        
        const averageScore = Math.round(totalScore / 3);
        
        // Update dashboard
        elements.nutritionScore.textContent = `${averageScore}%`;
        elements.balancedCount.textContent = `${balancedCount}/3`;
        elements.progressScore.textContent = `${averageScore}%`;
        elements.progressFill.style.width = `${averageScore}%`;
        
        // Update progress tip
        if (averageScore >= 80) {
            elements.progressTip.textContent = 'Excellent! You\'re eating balanced meals today!';
            elements.progressFill.style.background = 'linear-gradient(135deg, #00E676 0%, #00C853 100%)';
        } else if (averageScore >= 50) {
            elements.progressTip.textContent = 'Good job! Your meals are getting balanced.';
            elements.progressFill.style.background = 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)';
        } else if (averageScore > 0) {
            elements.progressTip.textContent = 'Keep going! Try adding more variety to your meals.';
            elements.progressFill.style.background = 'linear-gradient(135deg, #FF9800 0%, #FF6B35 100%)';
        } else {
            elements.progressTip.textContent = 'Add your meals to see your nutrition score.';
            elements.progressFill.style.background = 'var(--gradient-primary)';
        }
    }
    
    function clearAllMeals() {
        // Clear inputs
        elements.breakfastInput.value = '';
        elements.lunchInput.value = '';
        elements.dinnerInput.value = '';
        
        // Clear results
        elements.breakfastResult.textContent = 'Enter your breakfast to analyze';
        elements.lunchResult.textContent = 'Enter your lunch to analyze';
        elements.dinnerResult.textContent = 'Enter your dinner to analyze';
        
        // Clear badges
        elements.breakfastBadges.innerHTML = '';
        elements.lunchBadges.innerHTML = '';
        elements.dinnerBadges.innerHTML = '';
        
        // Reset dashboard
        elements.nutritionScore.textContent = '0%';
        elements.balancedCount.textContent = '0/3';
        elements.progressScore.textContent = '0%';
        elements.progressFill.style.width = '0%';
        elements.progressTip.textContent = 'Add your meals to see your nutrition score.';
        
        showNotification('All meals cleared!', 'info');
    }
    
    function generateQuickPlan() {
        // Fill all meals with suggestions
        useSuggestion('breakfast');
        useSuggestion('lunch');
        useSuggestion('dinner');
        
        // Auto-analyze
        analyzeAllMeals();
        
        showNotification('Quick meal plan generated!', 'success');
    }
    
    function generateShoppingList() {
        if (!mealData?.shoppingListCategories) {
            showNotification('Shopping list data not available', 'error');
            return;
        }
        
        const modalContent = document.getElementById('shoppingListContent');
        if (!modalContent) return;
        
        let html = '';
        Object.entries(mealData.shoppingListCategories).forEach(([category, items]) => {
            html += `
                <div class="shopping-category">
                    <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    <div class="shopping-items">
                        ${items.map(item => `
                            <div class="shopping-item">
                                <input type="checkbox" id="${item.replace(/\s+/g, '-')}">
                                <label for="${item.replace(/\s+/g, '-')}">${item}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        modalContent.innerHTML = html;
        elements.shoppingModal.style.display = 'flex';
    }
    
    function showTipsModal() {
        const tipsContent = document.getElementById('tipsContent');
        if (!tipsContent) return;
        
        tipsContent.innerHTML = healthTips.map((tip, index) => `
            <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <span>${index + 1}. ${tip}</span>
            </div>
        `).join('');
        
        elements.tipsModal.style.display = 'flex';
    }
    
    function loadNutritionGuide(category) {
        // Update active category
        document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
            if (cat.dataset.category === category) {
                cat.classList.add('active');
            }
        });
        
        // Set category info
        const categoryInfo = {
            proteins: { title: 'Proteins', desc: 'Builds and repairs body tissues, supports immune function' },
            carbs: { title: 'Carbohydrates', desc: 'Primary energy source for the body' },
            vegetables: { title: 'Vegetables', desc: 'Rich in vitamins, minerals, and fiber' },
            fruits: { title: 'Fruits', desc: 'Natural sources of vitamins, antioxidants, and fiber' }
        };
        
        elements.categoryTitle.textContent = categoryInfo[category]?.title || category;
        elements.categoryDesc.textContent = categoryInfo[category]?.desc || '';
        
        // Load food examples
        const foods = foodCategories[category] || [];
        elements.foodExamples.innerHTML = foods.map(food => `
            <div class="food-example">${food}</div>
        `).join('');
    }
    
    function loadHealthTips() {
        elements.tipsList.innerHTML = healthTips.slice(0, 4).map(tip => `
            <div class="tip-item">
                <i class="fas fa-star"></i>
                <span>${tip}</span>
            </div>
        `).join('');
    }
    
    function loadPreparationTips() {
        const prepTips = [
            { tip: 'Prep veggies in advance', desc: 'Chop and store for 2-3 days', time: 'Saves 15-20 mins daily' },
            { tip: 'Cook grains in batches', desc: 'Make rice or beans for multiple meals', time: 'Saves 30 mins per batch' },
            { tip: 'Use slow cooker', desc: 'Perfect for stews and soups', time: 'Reduces active cooking by 70%' },
            { tip: 'Freeze portions', desc: 'Freeze individual meal portions', time: 'Instant meals ready' }
        ];
        
        elements.prepTips.innerHTML = prepTips.map(tip => `
            <div class="prep-tip">
                <h5>${tip.tip}</h5>
                <p>${tip.desc}</p>
                <span class="time">⏱️ ${tip.time}</span>
            </div>
        `).join('');
    }
    
    function updateDailyTip() {
        const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
        elements.dailyTip.textContent = randomTip;
    }
    
    function toggleWaterGlass(glass) {
        const isFilled = glass.classList.contains('filled');
        
        if (isFilled) {
            glass.classList.remove('filled');
            waterGlasses = Math.max(0, waterGlasses - 1);
        } else {
            glass.classList.add('filled');
            waterGlasses = Math.min(8, waterGlasses + 1);
        }
        
        elements.waterIntake.textContent = `${waterGlasses}/8 glasses`;
        
        // Show celebration if goal reached
        if (waterGlasses === 8) {
            showNotification('🎉 Congratulations! You reached your daily water goal!', 'success');
        }
    }
    
    function resetWaterTracker() {
        document.querySelectorAll('.glass').forEach(glass => {
            glass.classList.remove('filled');
        });
        waterGlasses = 0;
        elements.waterIntake.textContent = '0/8 glasses';
        showNotification('Water tracker reset', 'info');
    }
    
    function updateWaterTracker() {
        const dayData = mealData.weeklyMeals?.find(d => d.day === selectedDay);
        const waterGoal = parseInt(dayData?.waterGoal || '8');
        
        // Reset glasses
        document.querySelectorAll('.glass').forEach((glass, index) => {
            glass.classList.remove('filled');
            if (index < waterGlasses) {
                glass.classList.add('filled');
            }
        });
    }
    
    function navigateWeek(direction) {
        currentWeek += direction;
        if (currentWeek < 1) currentWeek = 1;
        updateWeekDisplay();
    }
    
    function updateWeekDisplay() {
        const now = new Date();
        const month = now.toLocaleDateString('en-US', { month: 'long' });
        const year = now.getFullYear();
        elements.currentWeekDisplay.textContent = `Week ${currentWeek}, ${month} ${year}`;
    }
    
    function saveDailyPlan() {
        const plan = {
            date: new Date().toLocaleDateString(),
            day: selectedDay,
            breakfast: elements.breakfastInput.value,
            lunch: elements.lunchInput.value,
            dinner: elements.dinnerInput.value,
            score: parseInt(elements.nutritionScore.textContent) || 0
        };
        
        // Save to localStorage
        const savedPlans = JSON.parse(localStorage.getItem('afyalite_meal_plans') || '[]');
        savedPlans.push(plan);
        localStorage.setItem('afyalite_meal_plans', JSON.stringify(savedPlans));
        
        showNotification('Daily plan saved successfully! 📝', 'success');
    }
    
    function printWeeklyPlan() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Weekly Meal Plan - AfyaLite</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #00C853; text-align: center; }
                        .day { margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                        .meal { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <h1>📅 Weekly Meal Plan</h1>
                    <div id="content"></div>
                    <button class="no-print" onclick="window.print()">Print</button>
                    <button class="no-print" onclick="window.close()">Close</button>
                </body>
            </html>
        `);
        
        const content = document.querySelector('.week-grid').cloneNode(true);
        printWindow.document.getElementById('content').appendChild(content);
        printWindow.document.close();
    }
    
    function closeAllModals() {
        elements.shoppingModal.style.display = 'none';
        elements.tipsModal.style.display = 'none';
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        const colors = {
            success: 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
            error: 'linear-gradient(135deg, #FF5252 0%, #FF1744 100%)',
            info: 'linear-gradient(135deg, #4285F4 0%, #1565C0 100%)',
            warning: 'linear-gradient(135deg, #FFD600 0%, #FFB300 100%)'
        };
        
        notification.innerHTML = `
            <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        // Add animation styles
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    function createFallbackData() {
        return {
            weeklyMeals: [
                {
                    day: "Monday",
                    theme: "Balanced Energy Start",
                    date: "Get your week started right!",
                    foods: [
                        { meal: "breakfast", name: "Porridge with Banana & Nuts", prepTime: 15, calories: 350 },
                        { meal: "lunch", name: "Githeri with Avocado", prepTime: 45, calories: 420 },
                        { meal: "dinner", name: "Grilled Tilapia with Sukuma & Ugali", prepTime: 35, calories: 380 }
                    ],
                    snack: "Fruit Salad",
                    waterGoal: "8 glasses"
                },
                {
                    day: "Tuesday",
                    theme: "Protein-Rich Day",
                    date: "Focus on Protein Power",
                    foods: [
                        { meal: "breakfast", name: "Boiled Eggs with Toast", prepTime: 10, calories: 280 },
                        { meal: "lunch", name: "Ugali with Spinach & Fish", prepTime: 40, calories: 450 },
                        { meal: "dinner", name: "Matoke with Beans Stew", prepTime: 50, calories: 320 }
                    ],
                    snack: "Greek Yogurt",
                    waterGoal: "8 glasses"
                }
            ],
            shoppingListCategories: {
                proteins: ["chicken breast", "fish fillets", "eggs", "beans"],
                carbohydrates: ["rice", "ugali flour", "potatoes"],
                vegetables: ["sukuma wiki", "tomatoes", "onions"],
                fruits: ["bananas", "mangoes", "oranges"]
            }
        };
    }
    
    // Utility function
    function debounce(func, wait) {
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
});