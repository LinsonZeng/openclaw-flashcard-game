// Oxford English Flashcards Game with Dynamic Image Loading
class FlashcardGame {
    constructor() {
        this.flashcards = [];
        this.currentIndex = 0;
        this.imageBasePath = '/Volumes/138XXXX0377/下载/牛津树/05. 牛津闪卡1000张+音频/闪片/牛津闪卡 (1)/';
        this.imageExtension = '.jpg';
        this.imageFiles = [];
        this.isFrontVisible = true; // Track which side is currently visible
        
        this.initializeElements();
        this.loadFlashcardImages(); // Load image filenames first
        this.loadProgress();
        this.updateDisplay();
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
    }
    
    async loadFlashcardImages() {
        try {
            // Simulate loading images from the specified path
            // In a real environment, this would require a backend endpoint or file system access
            console.log('Loading flashcard images from:', this.imageBasePath);
            
            // For demonstration purposes, we'll create a list of image files
            // In a real implementation, this would be retrieved from the file system
            this.imageFiles = [];
            for (let i = 1; i <= 100; i++) {
                this.imageFiles.push(`初级 (${i}).jpg`);
            }
            
            // Create flashcards based on image files
            this.createFlashcardsFromImages();
            
            // Update UI after loading
            this.updateDisplay();
        } catch (error) {
            console.error('Error loading flashcard images:', error);
            // Fallback to sample data
            this.createSampleFlashcards();
        }
    }
    
    createFlashcardsFromImages() {
        // Create flashcards with placeholder text - in a real implementation
        // this would come from a database or metadata file
        this.flashcards = this.imageFiles.map((filename, index) => ({
            id: index,
            english: `Word ${index + 1}`,
            chinese: `词语 ${index + 1}`,
            imagePath: `${this.imageBasePath}${filename}`,
            difficulty: 0
        }));
    }
    
    createSampleFlashcards() {
        // Sample flashcard data as fallback
        this.flashcards = [
            { id: 0, english: "abandon", chinese: "放弃；抛弃", imagePath: "", difficulty: 0 },
            { id: 1, english: "benefit", chinese: "利益；好处；有益于", imagePath: "", difficulty: 0 },
            { id: 2, english: "consequence", chinese: "结果；后果", imagePath: "", difficulty: 0 },
            { id: 3, english: "define", chinese: "定义；解释", imagePath: "", difficulty: 0 },
            { id: 4, english: "emphasize", chinese: "强调；着重", imagePath: "", difficulty: 0 },
            { id: 5, english: "feature", chinese: "特征；特色；以...为特色", imagePath: "", difficulty: 0 },
            { id: 6, english: "generate", chinese: "产生；生成", imagePath: "", difficulty: 0 },
            { id: 7, english: "highlight", chinese: "突出；强调；亮点", imagePath: "", difficulty: 0 },
            { id: 8, english: "implement", chinese: "实施；执行", imagePath: "", difficulty: 0 },
            { id: 9, english: "justify", chinese: "证明...有理；为...辩护", imagePath: "", difficulty: 0 }
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
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
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
                    this.rateCard(0);
                    break;
                case '2':
                    this.rateCard(1);
                    break;
                case '3':
                    this.rateCard(2);
                    break;
                case '4':
                    this.rateCard(3);
                    break;
            }
        });
    }
    
    flipCard() {
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
        } else {
            this.flashcardImage.style.display = 'none';
        }
        this.flashcardImageBack.style.display = 'none';
    }
    
    showBackImage() {
        if (this.flashcards[this.currentIndex]?.imagePath) {
            this.flashcardImageBack.src = this.flashcards[this.currentIndex].imagePath;
            this.flashcardImageBack.style.display = 'block';
        } else {
            this.flashcardImageBack.style.display = 'none';
        }
        this.flashcardImage.style.display = 'none';
    }
    
    nextCard() {
        if (this.currentIndex < this.flashcards.length - 1) {
            this.currentIndex++;
            this.resetCardState();
            this.updateDisplay();
        }
    }
    
    previousCard() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.resetCardState();
            this.updateDisplay();
        }
    }
    
    rateCard(difficulty) {
        if (this.flashcards[this.currentIndex]) {
            this.flashcards[this.currentIndex].difficulty = difficulty;
            this.saveProgress();
            
            // Move to next card after rating
            setTimeout(() => {
                this.nextCard();
            }, 300);
        }
    }
    
    resetCardState() {
        this.cardElement.classList.remove('flipped');
        this.isFrontVisible = true;
    }
    
    updateDisplay() {
        if (this.flashcards[this.currentIndex]) {
            const card = this.flashcards[this.currentIndex];
            this.englishElement.textContent = card.english;
            this.chineseElement.textContent = card.chinese;
            
            // Show appropriate image based on current card side
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
                            const savedCard = progressData.flashcards.find(c => c.id === this.flashcards[i].id);
                            if (savedCard) {
                                this.flashcards[i].difficulty = savedCard.difficulty || 0;
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
    
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress?')) {
            // Reset difficulty ratings
            this.flashcards.forEach(card => {
                card.difficulty = 0;
            });
            
            this.currentIndex = 0;
            this.saveProgress();
            this.resetCardState();
            this.updateDisplay();
        }
    }
    
    // Backend interaction methods
    async fetchFlashcardsFromBackend() {
        try {
            const response = await fetch('/api/flashcards');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.flashcards = data;
            
            // Update UI after loading
            this.updateDisplay();
            return data;
        } catch (error) {
            console.error('Error fetching flashcards from backend:', error);
            // Fallback to local data
            return this.flashcards;
        }
    }
    
    async saveRatingToBackend(cardId, rating) {
        try {
            const response = await fetch(`/api/flashcards/${cardId}/rate`, {
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
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new FlashcardGame();
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register service worker if needed for offline functionality
        // navigator.serviceWorker.register('/sw.js');
    });
}