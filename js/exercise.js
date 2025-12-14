document.addEventListener("DOMContentLoaded", () => {
    console.log("Exercise app initialized");
    
    // Debug: Log current page location
    console.log("Current URL:", window.location.href);
    console.log("Current pathname:", window.location.pathname);
    
    // Update debug panel
    if (document.getElementById('baseURL')) {
        document.getElementById('baseURL').textContent = window.location.origin;
        document.getElementById('currentPath').textContent = window.location.pathname;
    }

    // Test different path bases
    const basePaths = [
        '../assets/videos/',
        './assets/videos/',
        'assets/videos/',
        '/assets/videos/',
        'videos/',
        '../videos/'
    ];

    // Try to detect correct base path
    const testImage = new Image();
    testImage.onload = function() {
        console.log("Test image loaded, using base path:", basePaths[0]);
    };
    testImage.onerror = function() {
        console.log("Test image failed, trying different base paths...");
        // Try other paths here if needed
    };
    testImage.src = basePaths[0] + 'jogging.mp4';

    // Exercise data with corrected paths
    const exercises = [
        {name: "Jogging", video: "jogging.mp4", description: "Boost heart rate and endurance. Great for cardiovascular health and stamina building.", recommended: 10, category: "cardio", difficulty: "easy"},
        {name: "Jumping Jacks", video: "jumping.mp4", description: "Full body warm-up exercise that improves coordination and burns calories quickly.", recommended: 5, category: "cardio", difficulty: "easy"},
        {name: "Push-ups", video: "pushups.mp4", description: "Strengthen chest, shoulders, triceps, and core muscles. Builds upper body strength.", recommended: 5, category: "strength", difficulty: "medium"},
        {name: "Squats", video: "squats.mp4", description: "Strengthen legs, glutes, and core. Essential for lower body strength and mobility.", recommended: 7, category: "strength", difficulty: "medium"},
        {name: "Lunges", video: "lunges.mp4", description: "Improve balance, coordination, and leg strength. Targets quadriceps and glutes.", recommended: 6, category: "strength", difficulty: "medium"},
        {name: "Plank", video: "plank.mp4", description: "Core stability exercise that strengthens abdominal muscles and improves posture.", recommended: 3, category: "core", difficulty: "medium"},
        {name: "High Knees", video: "high_knees.mp4", description: "High-intensity cardio that boosts heart rate quickly and strengthens legs.", recommended: 4, category: "cardio", difficulty: "medium"},
        {name: "Butt Kicks", video: "butt_kicks.mp4", description: "Warm-up exercise that targets hamstrings and improves running form.", recommended: 4, category: "cardio", difficulty: "easy"},
        {name: "Mountain Climbers", video: "mountain_climbers.mp4", description: "Full body cardio exercise that builds core strength and burns calories.", recommended: 5, category: "cardio", difficulty: "hard"},
        {name: "Burpees", video: "burpees.mp4", description: "High intensity full body exercise combining strength and cardio.", recommended: 5, category: "cardio", difficulty: "hard"},
        {name: "Bicycle Crunches", video: "bicycle_crunches.mp4", description: "Target oblique muscles for a stronger core and defined abs.", recommended: 4, category: "core", difficulty: "medium"},
        {name: "Tricep Dips", video: "tricep_dips.mp4", description: "Isolate and strengthen triceps using body weight.", recommended: 4, category: "strength", difficulty: "medium"},
        {name: "Leg Raises", video: "leg_raises.mp4", description: "Focus on lower abdominal muscles for core strength.", recommended: 4, category: "core", difficulty: "medium"},
        {name: "Russian Twists", video: "russian_twists.mp4", description: "Rotational core exercise that targets obliques.", recommended: 5, category: "core", difficulty: "medium"},
        {name: "Wall Sit", video: "wall_sit.mp4", description: "Isometric exercise that builds endurance in legs and glutes.", recommended: 3, category: "strength", difficulty: "easy"},
        {name: "Arm Circles", video: "arm_circles.mp4", description: "Shoulder warm-up that improves mobility and prevents injury.", recommended: 3, category: "strength", difficulty: "easy"},
        {name: "Calf Raises", video: "calf_raises.mp4", description: "Strengthen calf muscles for better ankle stability.", recommended: 5, category: "strength", difficulty: "easy"},
        {name: "Side Plank", video: "side_plank.mp4", description: "Target oblique muscles and improve core stability.", recommended: 3, category: "core", difficulty: "hard"},
        {name: "Glute Bridges", video: "glute_bridges.mp4", description: "Activate and strengthen glute muscles for better posture.", recommended: 6, category: "strength", difficulty: "easy"},
        {name: "Jump Squats", video: "jump_squats.mp4", description: "Plyometric exercise that builds power and burns calories.", recommended: 5, category: "cardio", difficulty: "hard"}
    ];

    const exerciseList = document.getElementById("exerciseList");
    const totalTimeDisplay = document.getElementById("totalTime");
    const completedCountDisplay = document.getElementById("completedCount");
    const caloriesBurnedDisplay = document.getElementById("caloriesBurned");
    const filterButtons = document.querySelectorAll(".filter-btn");

    let totalSeconds = 0;
    let completedExercises = 0;
    let totalCalories = 0;
    const caloriesPerMinute = 8;

    // Base path for videos - CHANGE THIS BASED ON YOUR STRUCTURE
    const VIDEO_BASE_PATH = '../assets/videos/';

    // Function to get full video path
    function getVideoPath(filename) {
        // Remove any existing base path from filename
        const cleanFilename = filename.replace(/^.*[\\\/]/, '');
        return VIDEO_BASE_PATH + cleanFilename;
    }

    // Function to encode file paths with spaces
    function encodeVideoPath(path) {
        return path.replace(/ /g, '%20');
    }

    // Initialize statistics
    function updateStats() {
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        
        totalTimeDisplay.textContent = `${String(totalHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
        completedCountDisplay.textContent = `${completedExercises}/${exercises.length}`;
        caloriesBurnedDisplay.textContent = `${totalCalories} kcal`;
    }

    // Filter exercises
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            
            // Filter exercises
            const filteredExercises = filter === "all" 
                ? exercises 
                : exercises.filter(ex => ex.category === filter);
            
            renderExercises(filteredExercises);
        });
    });

    // Show video error
    function showVideoError(card, videoPath, errorMessage) {
        const videoContainer = card.querySelector(".video-container");
        videoContainer.innerHTML = `
            <div class="video-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Video could not load</p>
                <p class="video-path">Error: ${errorMessage || "File not found"}</p>
                <p class="video-path">Tried path: ${videoPath}</p>
                <p><small>Check if file exists at: ${window.location.origin + '/' + videoPath}</small></p>
            </div>
        `;
    }

    // Render exercises
    function renderExercises(exercisesToRender) {
        exerciseList.innerHTML = '';
        
        exercisesToRender.forEach((ex, idx) => {
            const card = document.createElement("div");
            card.className = `exercise-card ${ex.category}`;
            card.dataset.category = ex.category;
            
            const videoPath = getVideoPath(ex.video);
            const encodedVideoPath = encodeVideoPath(videoPath);
            
            card.innerHTML = `
                <div class="video-container">
                    <video controls loop muted preload="metadata" playsinline>
                        <source src="${encodedVideoPath}" type="video/mp4">
                        Your browser does not support HTML5 video.
                    </video>
                    <div class="video-overlay">
                        <h3 class="exercise-name">${ex.name}</h3>
                    </div>
                    <div class="video-controls-overlay">
                        <button class="video-control-btn volume-btn" title="Toggle Mute">
                            <i class="fas fa-volume-mute"></i>
                        </button>
                        <button class="video-control-btn fullscreen-btn" title="Fullscreen">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p class="description">${ex.description}</p>
                    <div class="exercise-meta">
                        <span class="recommendation">
                            <i class="fas fa-clock"></i>
                            ${ex.recommended} mins
                        </span>
                        <span class="difficulty ${ex.difficulty}">${ex.difficulty.toUpperCase()}</span>
                    </div>
                    <div class="exercise-controls">
                        <button class="start-btn">
                            <i class="fas fa-play"></i> Start Timer
                        </button>
                        <button class="stop-btn">
                            <i class="fas fa-pause"></i> Pause
                        </button>
                        <button class="reset-btn">
                            <i class="fas fa-redo"></i> Reset
                        </button>
                    </div>
                    <div class="timer-container">
                        <span class="timer-label">
                            <i class="fas fa-hourglass-half"></i> Timer:
                        </span>
                        <span class="timer">00:00</span>
                    </div>
                </div>
            `;

            exerciseList.appendChild(card);

            // Get elements
            const startBtn = card.querySelector(".start-btn");
            const stopBtn = card.querySelector(".stop-btn");
            const resetBtn = card.querySelector(".reset-btn");
            const timerDisplay = card.querySelector(".timer");
            const video = card.querySelector("video");
            const volumeBtn = card.querySelector(".volume-btn");
            const fullscreenBtn = card.querySelector(".fullscreen-btn");
            const recommendedSeconds = ex.recommended * 60;

            let timer = 0;
            let interval = null;
            let isCompleted = false;
            let isMuted = true;

            // Debug: Log video loading attempt
            console.log(`Loading video for ${ex.name}:`, encodedVideoPath);

            // Volume toggle
            volumeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                isMuted = !isMuted;
                video.muted = isMuted;
                volumeBtn.innerHTML = isMuted 
                    ? '<i class="fas fa-volume-mute"></i>' 
                    : '<i class="fas fa-volume-up"></i>';
                volumeBtn.title = isMuted ? "Unmute" : "Mute";
            });

            // Fullscreen toggle
            fullscreenBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) {
                    video.webkitRequestFullscreen();
                } else if (video.mozRequestFullScreen) {
                    video.mozRequestFullScreen();
                }
            });

            // Start button
            startBtn.addEventListener("click", () => {
                if (!interval) {
                    // Try to play video
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(e => {
                            console.error(`Error playing video ${ex.name}:`, e);
                            showVideoError(card, encodedVideoPath, e.message);
                        });
                    }
                    
                    interval = setInterval(() => {
                        timer++;
                        totalSeconds++;
                        totalCalories = Math.floor(totalSeconds * caloriesPerMinute / 60);
                        
                        const mins = String(Math.floor(timer / 60)).padStart(2, '0');
                        const secs = String(timer % 60).padStart(2, '0');
                        timerDisplay.textContent = `${mins}:${secs}`;

                        updateStats();

                        if (timer >= recommendedSeconds && !isCompleted) {
                            clearInterval(interval);
                            interval = null;
                            isCompleted = true;
                            completedExercises++;
                            card.classList.add("completed");
                            timerDisplay.textContent = `${mins}:${secs} ✅`;
                            updateStats();
                            
                            showNotification(`${ex.name} completed! Great job!`);
                        }
                    }, 1000);
                }
            });

            // Stop button
            stopBtn.addEventListener("click", () => {
                if (interval) {
                    video.pause();
                    clearInterval(interval);
                    interval = null;
                }
            });

            // Reset button
            resetBtn.addEventListener("click", () => {
                video.pause();
                video.currentTime = 0;
                clearInterval(interval);
                interval = null;
                if (isCompleted) {
                    completedExercises--;
                    isCompleted = false;
                    card.classList.remove("completed");
                }
                timer = 0;
                timerDisplay.textContent = "00:00";
                updateStats();
            });

            // Video click to play/pause
            video.addEventListener("click", (e) => {
                e.stopPropagation();
                if (video.paused) {
                    video.play();
                    if (!interval) startBtn.click();
                } else {
                    video.pause();
                    if (interval) stopBtn.click();
                }
            });

            // Video error handling
            video.addEventListener("error", (e) => {
                console.error(`Error loading video ${ex.name}:`, video.error);
                const errorMessage = video.error?.message || 
                                   (video.error?.code === 4 ? "Media source not supported" : "Unknown error");
                showVideoError(card, encodedVideoPath, errorMessage);
            });

            // Video loaded successfully
            video.addEventListener("loadeddata", () => {
                console.log(`Video ${ex.name} loaded successfully`);
            });

            // Video metadata loaded
            video.addEventListener("loadedmetadata", () => {
                console.log(`Video metadata loaded for ${ex.name}, duration: ${video.duration}s`);
            });
        });
    }

    // Notification function
    function showNotification(message) {
        // Remove existing notification
        const existingNotification = document.querySelector(".notification");
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement("div");
        notification.className = "notification";
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add("fade-out");
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(to right, #27ae60, #2ecc71);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 0.8rem;
                box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
                z-index: 1000;
                animation: slideIn 0.3s ease;
            }
            
            .notification.fade-out {
                animation: slideOut 0.3s ease forwards;
            }
            
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

    // Function to test video paths
    function testVideoPaths() {
        console.log("Testing video paths...");
        
        // Test a few sample videos
        const testVideos = ['jogging.mp4', 'pushups.mp4', 'squats.mp4'];
        
        testVideos.forEach(videoName => {
            const videoPath = getVideoPath(videoName);
            const testVideo = document.createElement('video');
            testVideo.preload = 'metadata';
            testVideo.onloadeddata = () => {
                console.log(`✓ ${videoName} found at: ${videoPath}`);
            };
            testVideo.onerror = () => {
                console.log(`✗ ${videoName} NOT found at: ${videoPath}`);
                console.log(`   Full URL would be: ${window.location.origin}/${videoPath}`);
            };
            testVideo.src = videoPath;
        });
    }

    // Run tests on page load
    setTimeout(testVideoPaths, 1000);

    // Initial render
    renderExercises(exercises);
    updateStats();
    
    console.log("Exercise app loaded successfully");
});