// Oxford English Flashcards Game - Stacked Card Version with Gesture Controls
class FlashcardGame {
    constructor() {
        this.flashcards = [];
        this.currentIndex = 0;
        this.imageBasePath = '/Volumes/138XXXX0377/下载/牛津树/05. 牛津闪卡1000张+音频/闪片/牛津闪卡 (1)/';
        this.imageExtension = '.jpg';
        this.isFrontVisible = true;
        this.isLoading = false;
        this.vocabularyList = []; // 生词列表

        // Touch tracking
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchCurrentX = 0;
        this.touchCurrentY = 0;
        this.isSwiping = false;

        this.initializeElements();
        this.loadVocabularyList();
        this.fetchFlashcardsFromBackend()
            .then(() => {
                this.loadProgress();
                this.updateDisplay();
            });
        this.bindEvents();
    }

    initializeElements() {
        this.cardElement = document.getElementById('flashcard');
        this.cardContent = document.getElementById('cardContent');
        this.englishElement = document.getElementById('englishWord');
        this.chineseElement = document.getElementById('chineseMeaning');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.flipHint = document.getElementById('flipHint');
        this.magicReveal = document.getElementById('magicReveal');
        this.flashcardImage = document.getElementById('flashcardImage');
        this.flashcardImageBack = document.getElementById('flashcardImageBack');
        this.backBtn = document.getElementById('backBtn');
        this.closeBtn = document.getElementById('closeBtn');
        this.discardHint = document.getElementById('discardHint');
        this.vocabIndicator = document.getElementById('vocabIndicator');
        this.vocabCount = document.getElementById('vocabCount');
        this.cardStack = document.getElementById('cardStack');

        // Create swipe overlays
        this.createSwipeOverlays();

        // Create toast element
        this.createToast();

        this.setLoadingState(true);
    }

    createSwipeOverlays() {
        const overlays = ['left', 'right', 'down'];
        overlays.forEach(direction => {
            const overlay = document.createElement('div');
            overlay.className = `swipe-overlay ${direction}`;
            overlay.id = `overlay-${direction}`;
            this.cardElement.appendChild(overlay);
        });
    }

    createToast() {
        this.toast = document.createElement('div');
        this.toast.className = 'toast';
        document.body.appendChild(this.toast);
    }

    showToast(message, duration = 1500) {
        this.toast.textContent = message;
        this.toast.classList.add('show');
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, duration);
    }

    setLoadingState(isLoading) {
        this.isLoading = isLoading;
        if (this.englishElement) {
            this.englishElement.classList.toggle('loading', isLoading);
        }
    }

    async fetchFlashcardsFromBackend() {
        try {
            this.setLoadingState(true);
            // Update to use Firebase Functions URL
            const firebaseFunctionsUrl = 'https://us-central1-gen-lang-client-0530317861.cloudfunctions.net/api';
            const response = await fetch(`${firebaseFunctionsUrl}/flashcards`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.flashcards = data;

            await this.fetchImageList();

            console.log(`Loaded ${this.flashcards.length} flashcards from backend`);
            this.setLoadingState(false);
            return data;
        } catch (error) {
            console.error('Error fetching flashcards from backend:', error);
            this.createSampleFlashcards();
            this.setLoadingState(false);
            return this.flashcards;
        }
    }

    async fetchImageList() {
        try {
            // Update to use Firebase Functions URL
            const firebaseFunctionsUrl = 'https://us-central1-gen-lang-client-0530317861.cloudfunctions.net/api';
            const response = await fetch(`${firebaseFunctionsUrl}/images`);
            if (response.ok) {
                const imageData = await response.json();
                console.log(`Found ${imageData.count} images in directory`);
                this.assignImagesToFlashcards(imageData.images);
            }
        } catch (error) {
            console.warn('Could not fetch image list:', error);
        }
    }

    assignImagesToFlashcards(imageFiles) {
        this.flashcards.forEach((card, index) => {
            if (index < imageFiles.length) {
                card.imagePath = `${this.imageBasePath}${imageFiles[index]}`;
            }
        });
    }

    createSampleFlashcards() {
        this.flashcards = [
            { id: 1, english: "SERENDIPITY", chinese: "意外发现美好事物的运气", imagePath: "", difficulty: 0 },
            { id: 2, english: "EPHEMERAL", chinese: "短暂的；瞬息的", imagePath: "", difficulty: 0 },
            { id: 3, english: "LUMINOUS", chinese: "发光的；明亮的", imagePath: "", difficulty: 0 },
            { id: 4, english: "RESILIENCE", chinese: "韧性；恢复力", imagePath: "", difficulty: 0 },
            { id: 5, english: "WANDERLUST", chinese: "漫游癖；旅行欲", imagePath: "", difficulty: 0 },
            { id: 6, english: "MELLIFLUOUS", chinese: "悦耳的；流畅的", imagePath: "", difficulty: 0 },
            { id: 7, english: "PETRICHOR", chinese: "雨后泥土的芬芳", imagePath: "", difficulty: 0 },
            { id: 8, english: "SONDER", chinese: "意识到陌生人也有复杂人生", imagePath: "", difficulty: 0 },
            { id: 9, english: "AURORA", chinese: "极光；曙光", imagePath: "", difficulty: 0 },
            { id: 10, english: "ETHEREAL", chinese: "飘渺的；超凡的", imagePath: "", difficulty: 0 },
        ];
    }

    bindEvents() {
        // Card tap to flip
        this.cardElement.addEventListener('click', (e) => {
            if (!this.isSwiping) {
                this.flipCard();
            }
        });

        // Touch events for swipe gestures
        this.cardElement.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.cardElement.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.cardElement.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        this.cardElement.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });

        // Mouse events for desktop testing
        this.cardElement.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Navigation buttons
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.previousCard());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                if (confirm('确定要退出吗？')) {
                    window.history.back();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    handleTouchStart(e) {
        if (this.isLoading) return;

        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchCurrentX = touch.clientX;
        this.touchCurrentY = touch.clientY;
        this.isSwiping = false;

        this.cardElement.classList.add('swiping');
        this.cardElement.classList.remove('returning', 'flying-out');
    }

    handleTouchMove(e) {
        if (this.isLoading) return;
        e.preventDefault();

        const touch = e.touches[0];
        this.touchCurrentX = touch.clientX;
        this.touchCurrentY = touch.clientY;

        const deltaX = this.touchCurrentX - this.touchStartX;
        const deltaY = this.touchCurrentY - this.touchStartY;

        // Start swiping if moved enough
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            this.isSwiping = true;
        }

        if (this.isSwiping) {
            // Apply transform with damping
            const rotation = deltaX * 0.05;
            this.cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;

            // Update overlay opacity based on swipe direction
            this.updateSwipeOverlays(deltaX, deltaY);
        }
    }

    handleTouchEnd(e) {
        if (this.isLoading) return;

        this.cardElement.classList.remove('swiping');

        const deltaX = this.touchCurrentX - this.touchStartX;
        const deltaY = this.touchCurrentY - this.touchStartY;

        // Hide overlays
        this.hideSwipeOverlays();

        // Determine swipe direction
        const swipeThreshold = 80;

        if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
            // Determine primary direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX < -swipeThreshold) {
                    // Swipe left - previous card
                    this.animateCardOut('left', () => this.previousCard());
                } else if (deltaX > swipeThreshold) {
                    // Swipe right - next card
                    this.animateCardOut('right', () => this.nextCard());
                }
            } else {
                // Vertical swipe
                if (deltaY > swipeThreshold) {
                    // Swipe down - add to vocabulary
                    this.animateCardOut('down', () => this.addToVocabulary());
                } else if (deltaY < -swipeThreshold) {
                    // Swipe up - next card
                    this.animateCardOut('up', () => this.nextCard());
                }
            }
        } else {
            // Return card to original position
            this.returnCard();
        }

        this.isSwiping = false;
    }

    handleMouseDown(e) {
        if (this.isLoading) return;

        this.touchStartX = e.clientX;
        this.touchStartY = e.clientY;
        this.touchCurrentX = e.clientX;
        this.touchCurrentY = e.clientY;
        this.isMouseDown = true;
        this.isSwiping = false;

        this.cardElement.classList.add('swiping');
        this.cardElement.classList.remove('returning', 'flying-out');
    }

    handleMouseMove(e) {
        if (!this.isMouseDown || this.isLoading) return;

        this.touchCurrentX = e.clientX;
        this.touchCurrentY = e.clientY;

        const deltaX = this.touchCurrentX - this.touchStartX;
        const deltaY = this.touchCurrentY - this.touchStartY;

        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            this.isSwiping = true;
        }

        if (this.isSwiping) {
            const rotation = deltaX * 0.05;
            this.cardElement.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
            this.updateSwipeOverlays(deltaX, deltaY);
        }
    }

    handleMouseUp(e) {
        if (!this.isMouseDown) return;
        this.isMouseDown = false;

        this.cardElement.classList.remove('swiping');

        const deltaX = this.touchCurrentX - this.touchStartX;
        const deltaY = this.touchCurrentY - this.touchStartY;

        this.hideSwipeOverlays();

        const swipeThreshold = 80;

        if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX < -swipeThreshold) {
                    this.animateCardOut('left', () => this.previousCard());
                } else if (deltaX > swipeThreshold) {
                    this.animateCardOut('right', () => this.nextCard());
                }
            } else {
                if (deltaY > swipeThreshold) {
                    this.animateCardOut('down', () => this.addToVocabulary());
                } else if (deltaY < -swipeThreshold) {
                    this.animateCardOut('up', () => this.nextCard());
                }
            }
        } else if (!this.isSwiping) {
            // It was a click, not a swipe
            return;
        } else {
            this.returnCard();
        }

        this.isSwiping = false;
    }

    updateSwipeOverlays(deltaX, deltaY) {
        const threshold = 40;
        const maxOpacity = 0.8;

        const leftOverlay = document.getElementById('overlay-left');
        const rightOverlay = document.getElementById('overlay-right');
        const downOverlay = document.getElementById('overlay-down');

        // Reset all
        leftOverlay.style.opacity = 0;
        rightOverlay.style.opacity = 0;
        downOverlay.style.opacity = 0;

        if (deltaX < -threshold) {
            leftOverlay.style.opacity = Math.min(Math.abs(deltaX) / 150, maxOpacity);
        } else if (deltaX > threshold) {
            rightOverlay.style.opacity = Math.min(deltaX / 150, maxOpacity);
        }

        if (deltaY > threshold) {
            downOverlay.style.opacity = Math.min(deltaY / 150, maxOpacity);
        }
    }

    hideSwipeOverlays() {
        const overlays = document.querySelectorAll('.swipe-overlay');
        overlays.forEach(overlay => {
            overlay.style.opacity = 0;
        });
    }

    animateCardOut(direction, callback) {
        this.cardElement.classList.add('flying-out');

        let transform;
        switch (direction) {
            case 'left':
                transform = 'translate(-150%, 0) rotate(-30deg)';
                break;
            case 'right':
                transform = 'translate(150%, 0) rotate(30deg)';
                break;
            case 'up':
                transform = 'translate(0, -150%) rotate(0deg)';
                break;
            case 'down':
                transform = 'translate(0, 150%) rotate(0deg)';
                break;
        }

        this.cardElement.style.transform = transform;
        this.cardElement.style.opacity = '0';

        setTimeout(() => {
            callback();
            // Reset card position
            this.cardElement.style.transition = 'none';
            this.cardElement.style.transform = 'translate(0, 0) rotate(0deg)';
            this.cardElement.style.opacity = '1';
            this.cardElement.classList.remove('flying-out');

            // Re-enable transitions
            setTimeout(() => {
                this.cardElement.style.transition = '';
            }, 50);
        }, 350);
    }

    returnCard() {
        this.cardElement.classList.add('returning');
        this.cardElement.style.transform = 'translate(0, 0) rotate(0deg)';

        setTimeout(() => {
            this.cardElement.classList.remove('returning');
        }, 400);
    }

    handleKeydown(e) {
        if (this.isLoading) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousCard();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextCard();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.nextCard();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.addToVocabulary();
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                this.flipCard();
                break;
        }
    }

    flipCard() {
        if (this.isLoading) return;

        // Trigger magic reveal animation
        this.magicReveal.classList.remove('active');
        void this.magicReveal.offsetWidth; // Force reflow
        this.magicReveal.classList.add('active');

        // Toggle card state after a small delay for effect
        setTimeout(() => {
            this.isFrontVisible = !this.isFrontVisible;
            this.cardElement.classList.toggle('revealed');

            // Update content visibility
            if (this.isFrontVisible) {
                this.showFront();
            } else {
                this.showBack();
            }

            // Update hint text
            if (this.flipHint) {
                const hintText = this.flipHint.querySelector('span');
                if (hintText) {
                    hintText.textContent = this.isFrontVisible ? '点击翻面' : '点击返回';
                }
            }
        }, 150);
    }

    showFront() {
        const card = this.flashcards[this.currentIndex];
        if (!card) return;

        if (card.imagePath) {
            this.flashcardImage.src = card.imagePath;
            this.flashcardImage.style.display = 'block';
            this.englishElement.style.display = 'none';
        } else {
            this.flashcardImage.style.display = 'none';
            this.englishElement.style.display = 'block';
        }
        this.chineseElement.style.display = 'none';
    }

    showBack() {
        const card = this.flashcards[this.currentIndex];
        if (!card) return;

        this.flashcardImage.style.display = 'none';
        this.englishElement.style.display = 'none';
        this.chineseElement.style.display = 'block';
    }

    nextCard() {
        if (this.isLoading || this.currentIndex >= this.flashcards.length - 1) {
            if (this.currentIndex >= this.flashcards.length - 1) {
                this.showToast('已经是最后一张了');
            }
            return;
        }

        this.currentIndex++;
        this.resetCardState();
        this.updateDisplay();
    }

    previousCard() {
        if (this.isLoading || this.currentIndex <= 0) {
            if (this.currentIndex <= 0) {
                this.showToast('已经是第一张了');
            }
            return;
        }

        this.currentIndex--;
        this.resetCardState();
        this.updateDisplay();
    }

    addToVocabulary() {
        if (this.isLoading) return;

        const card = this.flashcards[this.currentIndex];
        if (!card) return;

        // Check if already in vocabulary list
        if (this.vocabularyList.find(v => v.id === card.id)) {
            this.showToast('该单词已在生词本中');
        } else {
            this.vocabularyList.push({
                id: card.id,
                english: card.english,
                chinese: card.chinese,
                addedAt: Date.now()
            });
            this.saveVocabularyList();
            this.updateVocabIndicator();
            this.showToast(`"${card.english}" 已加入生词本`);
        }

        // Move to next card
        if (this.currentIndex < this.flashcards.length - 1) {
            setTimeout(() => {
                this.currentIndex++;
                this.resetCardState();
                this.updateDisplay();
            }, 300);
        }
    }

    resetCardState() {
        this.cardElement.classList.remove('revealed');
        this.isFrontVisible = true;

        // Reset hint text
        if (this.flipHint) {
            const hintText = this.flipHint.querySelector('span');
            if (hintText) {
                hintText.textContent = '点击翻面';
            }
        }
    }

    updateDisplay() {
        if (this.flashcards[this.currentIndex]) {
            const card = this.flashcards[this.currentIndex];

            // Update text content
            this.englishElement.textContent = card.english;
            this.chineseElement.textContent = card.chinese;

            // Show appropriate content based on current card side
            if (this.isFrontVisible) {
                this.showFront();
            } else {
                this.showBack();
            }

            // Update progress bar
            const progressPercent = ((this.currentIndex + 1) / this.flashcards.length) * 100;
            this.progressFill.style.width = `${progressPercent}%`;
            this.progressText.textContent = `${this.currentIndex + 1}/${this.flashcards.length}`;
        }

        this.updateVocabIndicator();
    }

    updateVocabIndicator() {
        if (this.vocabularyList.length > 0) {
            this.vocabIndicator.style.display = 'block';
            this.vocabCount.textContent = this.vocabularyList.length;
        } else {
            this.vocabIndicator.style.display = 'none';
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

                if (Array.isArray(progressData.flashcards) && progressData.flashcards.length > 0) {
                    for (let i = 0; i < this.flashcards.length; i++) {
                        if (progressData.flashcards[i]) {
                            const savedCardIdx = this.flashcards.findIndex(c => c.id === progressData.flashcards[i].id);
                            if (savedCardIdx !== -1) {
                                this.flashcards[savedCardIdx].difficulty = progressData.flashcards[i].difficulty || 0;
                            }
                        }
                    }

                    if (typeof progressData.currentIndex === 'number' &&
                        progressData.currentIndex >= 0 &&
                        progressData.currentIndex < this.flashcards.length) {
                        this.currentIndex = progressData.currentIndex;
                    }
                }
            } catch (e) {
                console.error('Error loading progress:', e);
            }
        }
    }

    saveVocabularyList() {
        localStorage.setItem('oxfordFlashcardsVocabulary', JSON.stringify(this.vocabularyList));
    }

    loadVocabularyList() {
        const savedData = localStorage.getItem('oxfordFlashcardsVocabulary');
        if (savedData) {
            try {
                this.vocabularyList = JSON.parse(savedData);
            } catch (e) {
                console.error('Error loading vocabulary list:', e);
                this.vocabularyList = [];
            }
        }
    }

    getVocabularyList() {
        return this.vocabularyList;
    }

    clearVocabularyList() {
        if (confirm('确定要清空生词本吗？')) {
            this.vocabularyList = [];
            this.saveVocabularyList();
            this.updateVocabIndicator();
            this.showToast('生词本已清空');
        }
    }

    // Rate a flashcard and update difficulty
    async rateFlashcard(cardId, rating) {
        try {
            const firebaseFunctionsUrl = 'https://us-central1-gen-lang-client-0530317861.cloudfunctions.net/api';
            const response = await fetch(`${firebaseFunctionsUrl}/flashcards/${cardId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rating })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Rated flashcard ${cardId} with rating ${rating}`);

            // Update the local card data
            const cardIndex = this.flashcards.findIndex(card => card.id === cardId);
            if (cardIndex !== -1) {
                this.flashcards[cardIndex].difficulty = rating;
            }

            return data;
        } catch (error) {
            console.error('Error rating flashcard:', error);
            // Update locally anyway in case of network failure
            const cardIndex = this.flashcards.findIndex(card => card.id === cardId);
            if (cardIndex !== -1) {
                this.flashcards[cardIndex].difficulty = rating;
            }
            return { success: false, error: error.message };
        }
    }

    // Get user progress
    async getUserProgress() {
        try {
            const firebaseFunctionsUrl = 'https://us-central1-gen-lang-client-0530317861.cloudfunctions.net/api';
            const response = await fetch(`${firebaseFunctionsUrl}/progress`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting user progress:', error);
            return { error: error.message };
        }
    }

    // Reset user progress
    async resetProgress() {
        try {
            const firebaseFunctionsUrl = 'https://us-central1-gen-lang-client-0530317861.cloudfunctions.net/api';
            const response = await fetch(`${firebaseFunctionsUrl}/progress/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Progress reset successfully');
            return data;
        } catch (error) {
            console.error('Error resetting progress:', error);
            return { error: error.message };
        }
    }

    // Get practice flashcards by difficulty level
    async getPracticeFlashcards(difficultyLevel) {
        try {
            const firebaseFunctionsUrl = 'https://us-central1-gen-lang-client-0530317861.cloudfunctions.net/api';
            const response = await fetch(`${firebaseFunctionsUrl}/flashcards/practice/${difficultyLevel}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting practice flashcards:', error);
            return { error: error.message };
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new FlashcardGame();

    setTimeout(() => {
        console.log('Oxford Flashcards Game initialized!');
        console.log('Gesture controls: Swipe left=previous, Swipe right/up=next, Swipe down=add to vocabulary');
    }, 1000);
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register service worker if needed for offline functionality
        // navigator.serviceWorker.register('/sw.js');
    });
}