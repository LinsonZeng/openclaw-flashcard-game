// Oxford English Flashcards Game - Enhanced Version
class FlashcardGame {
    constructor() {
        this.flashcards = [];
        this.currentIndex = 0;
        this.imageBasePath = '/Volumes/138XXXX0377/下载/牛津树/05. 牛津闪卡1000张+音频/闪片/牛津闪卡 (1)/';
        this.imageExtension = '.jpg';
        this.isFrontVisible = true; // Track which side is currently visible
        this.isLoading = false; // Track loading state
        
        this.initializeElements();
        this.fetchFlashcardsFromBackend()
            .then(() => {
                this.loadProgress();
                this.updateDisplay();
            });
        this.bindEvents();
    }
    
    initializeElements() {
        this.cardElement = document.getElementById('flashcard');
        this.frontElement = document.getElementById('cardFront');
        this.backElement = document.getElementById('cardBack');
        this.englishElement = document.getElementById('englishWord');
        this.chineseElement = document.getElementById('chineseMeaning');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.againBtn = document.getElementById('againBtn');
        this.hardBtn = document.getElementById('hardBtn');
        this.goodBtn = document.getElementById('goodBtn');
        this.easyBtn = document.getElementById('easyBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.flashcardImage = document.getElementById('flashcardImage');
        this.flashcardImageBack = document.getElementById('flashcardImageBack');
        
        // Disable buttons while loading
        this.setLoadingState(true);
    }
    
    setLoadingState(isLoading) {
        this.isLoading = isLoading;
        const buttons = [this.prevBtn, this.nextBtn, this.againBtn, this.hardBtn, this.goodBtn, this.easyBtn];
        buttons.forEach(btn => {
            btn.disabled = isLoading;
            if (isLoading) {
                btn.style.opacity = '0.6';
            } else {
                btn.style.opacity = '1';
            }
        });
    }
    
    async fetchFlashcardsFromBackend() {
        try {
            this.setLoadingState(true);
            const response = await fetch('http://localhost:9876/api/flashcards');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.flashcards = data;
            
            // If we have image capability, fetch image list
            await this.fetchImageList();
            
            console.log(`Loaded ${this.flashcards.length} flashcards from backend`);
            this.setLoadingState(false);
            return data;
        } catch (error) {
            console.error('Error fetching flashcards from backend:', error);
            // Fallback to sample data
            this.createSampleFlashcards();
            this.setLoadingState(false);
            return this.flashcards;
        }
    }
    
    async fetchImageList() {
        try {
            const response = await fetch('http://localhost:9876/api/images');
            if (response.ok) {
                const imageData = await response.json();
                console.log(`Found ${imageData.count} images in directory`);
                
                // Assign images to flashcards if possible
                this.assignImagesToFlashcards(imageData.images);
            }
        } catch (error) {
            console.warn('Could not fetch image list:', error);
        }
    }
    
    assignImagesToFlashcards(imageFiles) {
        // Assign images to flashcards based on index
        this.flashcards.forEach((card, index) => {
            if (index < imageFiles.length) {
                card.imagePath = `${this.imageBasePath}${imageFiles[index]}`;
            }
        });
    }
    
    createSampleFlashcards() {
        // Sample flashcard data as fallback
        this.flashcards = [
            { id: 1, english: "abandon", chinese: "放弃；抛弃", imagePath: "", difficulty: 0 },
            { id: 2, english: "benefit", chinese: "利益；好处；有益于", imagePath: "", difficulty: 0 },
            { id: 3, english: "consequence", chinese: "结果；后果", imagePath: "", difficulty: 0 },
            { id: 4, english: "define", chinese: "定义；解释", imagePath: "", difficulty: 0 },
            { id: 5, english: "emphasize", chinese: "强调；着重", imagePath: "", difficulty: 0 },
            { id: 6, english: "feature", chinese: "特征；特色；以...为特色", imagePath: "", difficulty: 0 },
            { id: 7, english: "generate", chinese: "产生；生成", imagePath: "", difficulty: 0 },
            { id: 8, english: "highlight", chinese: "突出；强调；亮点", imagePath: "", difficulty: 0 },
            { id: 9, english: "implement", chinese: "实施；执行", imagePath: "", difficulty: 0 },
            { id: 10, english: "justify", chinese: "证明...有理；为...辩护", imagePath: "", difficulty: 0 },
            { id: 11, english: "maintain", chinese: "维持；保持；维修", imagePath: "", difficulty: 0 },
            { id: 12, english: "occur", chinese: "发生；出现", imagePath: "", difficulty: 0 },
            { id: 13, english: "policy", chinese: "政策；方针；保险单", imagePath: "", difficulty: 0 },
            { id: 14, english: "primary", chinese: "主要的；初级的；基本的", imagePath: "", difficulty: 0 },
            { id: 15, english: "principle", chinese: "原理；原则；道德准则", imagePath: "", difficulty: 0 }
        ];
    }
    
    bindEvents() {
        // Card flip on click/tap
        this.cardElement.addEventListener('click', () => this.flipCard());
        
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.previousCard());
        this.nextBtn.addEventListener('click', () => this.nextCard());
        
        // Difficulty buttons
        this.againBtn.addEventListener('click', () => this.rateCard(0));
        this.hardBtn.addEventListener('click', () => this.rateCard(1));
        this.goodBtn.addEventListener('click', () => this.rateCard(2));
        this.easyBtn.addEventListener('click', () => this.rateCard(3));
        
        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetProgress());
        
        // Touch events for swipe gestures
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.cardElement.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault(); // Prevent default to ensure swipe is captured
        });
        
        this.cardElement.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            
            // Only consider horizontal swipes if they're significantly larger than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
                if (diffX > 0) {
                    // Swipe left - next card
                    this.nextCard();
                } else {
                    // Swipe right - previous card
                    this.previousCard();
                }
            } else if (Math.abs(diffY) > 30) {
                // Vertical swipe - flip card
                this.flipCard();
            }
            
            e.preventDefault();
        });
        
        // Prevent scrolling when touching the card area
        this.cardElement.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isLoading) return; // Don't respond to keys while loading
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousCard();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextCard();
                    break;
                case ' ':
                    e.preventDefault();
                    this.flipCard();
                    break;
                case '1':
                    e.preventDefault();
                    this.rateCard(0);
                    break;
                case '2':
                    e.preventDefault();
                    this.rateCard(1);
                    break;
                case '3':
                    e.preventDefault();
                    this.rateCard(2);
                    break;
                case '4':
                    e.preventDefault();
                    this.rateCard(3);
                    break;
            }
        });
    }
    
    flipCard() {
        if (this.isLoading) return;
        
        this.cardElement.classList.toggle('flipped');
        this.isFrontVisible = !this.isFrontVisible;
        
        // Update image visibility based on card side
        if (this.isFrontVisible) {
            this.showFrontImage();
        } else {
            this.showBackImage();
        }
    }
    
    showFrontImage() {
        if (this.flashcards[this.currentIndex]?.imagePath) {
            this.flashcardImage.src = this.flashcards[this.currentIndex].imagePath;
            this.flashcardImage.style.display = 'block';
            // Hide text if image is present
            this.englishElement.style.display = 'none';
        } else {
            this.flashcardImage.style.display = 'none';
            this.englishElement.style.display = 'block';
        }
        this.flashcardImageBack.style.display = 'none';
        // Ensure back text is hidden when showing front
        this.chineseElement.style.display = 'none';
    }
    
    showBackImage() {
        if (this.flashcards[this.currentIndex]?.imagePath) {
            this.flashcardImageBack.src = this.flashcardImage.src; // Use same image
            this.flashcardImageBack.style.display = 'block';
            // Hide text if image is present
            this.chineseElement.style.display = 'none';
        } else {
            this.flashcardImageBack.style.display = 'none';
            this.chineseElement.style.display = 'block';
        }
        this.flashcardImage.style.display = 'none';
        // Ensure front text is hidden when showing back
        this.englishElement.style.display = 'none';
    }
    
    nextCard() {
        if (this.isLoading || this.currentIndex >= this.flashcards.length - 1) return;
        
        this.currentIndex++;
        this.resetCardState();
        this.updateDisplay();
    }
    
    previousCard() {
        if (this.isLoading || this.currentIndex <= 0) return;
        
        this.currentIndex--;
        this.resetCardState();
        this.updateDisplay();
    }
    
    async rateCard(difficulty) {
        if (this.isLoading || !this.flashcards[this.currentIndex]) return;
        
        const card = this.flashcards[this.currentIndex];
        card.difficulty = difficulty;
        
        // Save locally first
        this.saveProgress();
        
        // Then attempt to save to backend
        await this.saveRatingToBackend(card.id, difficulty);
        
        // Move to next card after rating
        setTimeout(() => {
            this.nextCard();
        }, 300);
    }
    
    resetCardState() {
        this.cardElement.classList.remove('flipped');
        this.isFrontVisible = true;
    }
    
    updateDisplay() {
        if (this.flashcards[this.currentIndex]) {
            const card = this.flashcards[this.currentIndex];
            
            // Update text content
            this.englishElement.textContent = card.english;
            this.chineseElement.textContent = card.chinese;
            
            // Show appropriate content based on current card side
            if (this.isFrontVisible) {
                this.showFrontImage();
            } else {
                this.showBackImage();
            }
            
            // Update progress bar
            const progressPercent = ((this.currentIndex + 1) / this.flashcards.length) * 100;
            this.progressFill.style.width = `${progressPercent}%`;
            this.progressText.textContent = `${this.currentIndex + 1}/${this.flashcards.length}`;
        }
    }
    
    saveProgress() {
        const progressData = {
            currentIndex: this.currentIndex,
            flashcards: this.flashcards,
            timestamp: Date.now()
        };
        
        localStorage.setItem('oxfordFlashcardsProgress', JSON.stringify(progressData));
    }
    
    loadProgress() {
        const savedData = localStorage.getItem('oxfordFlashcardsProgress');
        if (savedData) {
            try {
                const progressData = JSON.parse(savedData);
                
                // Verify data integrity
                if (Array.isArray(progressData.flashcards) && 
                    progressData.flashcards.length > 0) {
                    
                    // Update our flashcards with saved difficulty ratings
                    for (let i = 0; i < this.flashcards.length; i++) {
                        if (progressData.flashcards[i]) {
                            // Find matching card by ID if possible, otherwise by index
                            const savedCardIdx = this.flashcards.findIndex(c => c.id === progressData.flashcards[i].id);
                            if (savedCardIdx !== -1) {
                                this.flashcards[savedCardIdx].difficulty = progressData.flashcards[i].difficulty || 0;
                            }
                        }
                    }
                    
                    // Set current index if valid
                    if (typeof progressData.currentIndex === 'number' && 
                        progressData.currentIndex >= 0 && 
                        progressData.currentIndex < this.flashcards.length) {
                        
                        this.currentIndex = progressData.currentIndex;
                    }
                }
            } catch (e) {
                console.error('Error loading progress:', e);
                // If there's an error, we'll start fresh
            }
        }
    }
    
    async resetProgress() {
        if (confirm('Are you sure you want to reset all progress?')) {
            try {
                // First try to reset via backend
                const response = await fetch('http://localhost:9876/api/progress/reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log(result.message);
                }
            } catch (error) {
                console.error('Error resetting progress on backend:', error);
            }
            
            // Reset local data anyway
            this.flashcards.forEach(card => {
                card.difficulty = 0;
            });
            
            this.currentIndex = 0;
            this.saveProgress();
            this.resetCardState();
            this.updateDisplay();
        }
    }
    
    async saveRatingToBackend(cardId, rating) {
        try {
            const response = await fetch(`http://localhost:9876/api/flashcards/${cardId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rating })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Rating saved successfully:', result);
            return result;
        } catch (error) {
            console.error('Error saving rating to backend:', error);
            // Still update local data even if backend fails
            return null;
        }
    }
    
    // Method to get cards based on difficulty (for spaced repetition)
    getCardsForPractice() {
        // Filter cards by difficulty level (0 = again, 1 = hard, 2 = good, 3 = easy)
        // Cards rated as "again" or "hard" should appear more frequently
        return this.flashcards.filter(card => card.difficulty < 2);
    }
    
    // Method to get learning statistics
    getLearningStats() {
        const totalCards = this.flashcards.length;
        const masteredCards = this.flashcards.filter(card => card.difficulty >= 3).length;
        const learningCards = this.flashcards.filter(card => card.difficulty > 0 && card.difficulty < 3).length;
        const newCards = this.flashcards.filter(card => card.difficulty === 0).length;
        
        return {
            totalCards,
            masteredCards,
            learningCards,
            newCards,
            masteryPercentage: totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0
        };
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new FlashcardGame();
    
    // Add a small delay to ensure everything is loaded
    setTimeout(() => {
        console.log('Oxford Flashcards Game initialized!');
        console.log('Features ready: Card flipping, navigation, progress tracking, image support');
    }, 1000);
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register service worker if needed for offline functionality
        // navigator.serviceWorker.register('/sw.js');
    });
}