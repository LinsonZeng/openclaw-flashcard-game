const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = 9876;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// In-memory storage for demo purposes (in production, use a proper database)
let flashcards = [
    { id: 1, english: "abandon", chinese: "放弃；抛弃", imagePath: "", difficulty: 0 },
    { id: 2, english: "benefit", chinese: "利益；好处；有益于", imagePath: "", difficulty: 0 },
    { id: 3, english: "consequence", chinese: "结果；后果", imagePath: "", difficulty: 0 },
    { id: 4, english: "define", chinese: "定义；解释", imagePath: "", difficulty: 0 },
    { id: 5, english: "emphasize", chinese: "强调；着重", imagePath: "", difficulty: 0 },
    { id: 6, english: "feature", chinese: "特征；特色；以...为特色", imagePath: "", difficulty: 0 },
    { id: 7, english: "generate", chinese: "产生；生成", imagePath: "", difficulty: 0 },
    { id: 8, english: "highlight", chinese: "突出；强调；亮点", imagePath: "", difficulty: 0 },
    { id: 9, english: "implement", chinese: "实施；执行", imagePath: "", difficulty: 0 },
    { id: 10, english: "justify", chinese: "证明...有理；为...辩护", imagePath: "", difficulty: 0 }
];

let userProgress = {};

// API Routes
// Get all flashcards
app.get('/api/flashcards', async (req, res) => {
    try {
        res.json(flashcards);
    } catch (error) {
        console.error('Error getting flashcards:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get flashcards by difficulty level
app.get('/api/flashcards/practice/:difficulty', async (req, res) => {
    try {
        const difficulty = parseInt(req.params.difficulty);
        const filteredCards = flashcards.filter(card => card.difficulty <= difficulty);
        res.json(filteredCards);
    } catch (error) {
        console.error('Error getting practice flashcards:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Rate a flashcard (update difficulty)
app.post('/api/flashcards/:id/rate', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { rating } = req.body;
        
        const cardIndex = flashcards.findIndex(card => card.id === id);
        if (cardIndex !== -1) {
            flashcards[cardIndex].difficulty = rating;
            
            // Save user progress
            if (!userProgress[id]) {
                userProgress[id] = { attempts: 0, correct: 0 };
            }
            userProgress[id].attempts += 1;
            if (rating >= 2) { // Consider ratings of 2 or 3 as correct
                userProgress[id].correct += 1;
            }
            
            res.json({ success: true, updatedCard: flashcards[cardIndex] });
        } else {
            res.status(404).json({ error: 'Flashcard not found' });
        }
    } catch (error) {
        console.error('Error rating flashcard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user progress
app.get('/api/progress', async (req, res) => {
    try {
        const totalCards = flashcards.length;
        const masteredCards = flashcards.filter(card => card.difficulty >= 3).length;
        const learningCards = flashcards.filter(card => card.difficulty > 0 && card.difficulty < 3).length;
        const newCards = flashcards.filter(card => card.difficulty === 0).length;
        
        res.json({
            totalCards,
            masteredCards,
            learningCards,
            newCards,
            userProgress
        });
    } catch (error) {
        console.error('Error getting progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset user progress
app.post('/api/progress/reset', async (req, res) => {
    try {
        // Reset all difficulty ratings to 0
        flashcards.forEach(card => {
            card.difficulty = 0;
        });
        
        // Clear user progress
        userProgress = {};
        
        res.json({ success: true, message: 'Progress reset successfully' });
    } catch (error) {
        console.error('Error resetting progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get image files from the specified directory
app.get('/api/images', async (req, res) => {
    try {
        const imagePath = '/Volumes/138XXXX0377/下载/牛津树/05. 牛津闪卡1000张+音频/闪片/牛津闪卡 (1)/';
        
        // In a real environment, check if directory exists and read files
        // For this example, we'll return a simulated list
        const imageFiles = [];
        for (let i = 1; i <= 100; i++) {
            imageFiles.push(`初级 (${i}).jpg`);
        }
        
        res.json({ 
            basePath: imagePath, 
            images: imageFiles,
            count: imageFiles.length
        });
    } catch (error) {
        console.error('Error getting images:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Oxford Flashcards API is ready!');
});