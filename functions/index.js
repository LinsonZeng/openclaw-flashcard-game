const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();

// In-memory flashcards data (in production, you'd use Firestore)
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

// User progress data (in production, you'd store this in Firestore)
let userProgress = {};

// API endpoint to get all flashcards
exports.getFlashcards = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        res.json(flashcards);
    });
});

// API endpoint to get flashcards by difficulty level
exports.getPracticeFlashcards = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const difficulty = parseInt(req.path.split('/')[3]); // Extract difficulty from path like /practice/2
        const filteredCards = flashcards.filter(card => card.difficulty <= difficulty);
        res.json(filteredCards);
    });
});

// API endpoint to rate a flashcard (update difficulty)
exports.rateFlashcard = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const id = parseInt(req.path.split('/')[3]); // Extract id from path like /1/rate
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
    });
});

// API endpoint to get user progress
exports.getUserProgress = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
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
    });
});

// API endpoint to reset user progress
exports.resetProgress = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        // Reset all difficulty ratings to 0
        flashcards.forEach(card => {
            card.difficulty = 0;
        });
        
        // Clear user progress
        userProgress = {};
        
        res.json({ success: true, message: 'Progress reset successfully' });
    });
});

// API endpoint to get image files
exports.getImages = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        // Return a simulated list of images
        const imageFiles = [];
        for (let i = 1; i <= 100; i++) {
            imageFiles.push(`初级 (${i}).jpg`);
        }
        
        res.json({ 
            basePath: '/images/', 
            images: imageFiles,
            count: imageFiles.length
        });
    });
});

// Main API endpoint
exports.api = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        // Route to different endpoints based on path
        const pathParts = req.path.split('/').filter(Boolean);
        
        if (pathParts[0] === 'flashcards') {
            if (pathParts.length === 1 && req.method === 'GET') {
                // GET /api/flashcards
                res.json(flashcards);
            } else if (pathParts.length === 3 && pathParts[1] === 'practice') {
                // GET /api/flashcards/practice/:difficulty
                const difficulty = parseInt(pathParts[2]);
                const filteredCards = flashcards.filter(card => card.difficulty <= difficulty);
                res.json(filteredCards);
            } else if (pathParts.length === 3 && pathParts[2] === 'rate' && req.method === 'POST') {
                // POST /api/flashcards/:id/rate
                const id = parseInt(pathParts[1]);
                
                const cardIndex = flashcards.findIndex(card => card.id === id);
                if (cardIndex !== -1) {
                    const { rating } = req.body;
                    flashcards[cardIndex].difficulty = rating;
                    
                    // Save user progress
                    if (!userProgress[id]) {
                        userProgress[id] = { attempts: 0, correct: 0 };
                    }
                    userProgress[id].attempts += 1;
                    if (rating >= 2) {
                        userProgress[id].correct += 1;
                    }
                    
                    res.json({ success: true, updatedCard: flashcards[cardIndex] });
                } else {
                    res.status(404).json({ error: 'Flashcard not found' });
                }
            } else {
                res.status(404).json({ error: 'Endpoint not found' });
            }
        } else if (pathParts[0] === 'progress') {
            if (pathParts.length === 1 && req.method === 'GET') {
                // GET /api/progress
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
            } else if (pathParts.length === 1 && req.method === 'POST' && req.query.action === 'reset') {
                // POST /api/progress/reset
                flashcards.forEach(card => {
                    card.difficulty = 0;
                });
                
                userProgress = {};
                
                res.json({ success: true, message: 'Progress reset successfully' });
            } else {
                res.status(404).json({ error: 'Endpoint not found' });
            }
        } else if (pathParts[0] === 'images') {
            // GET /api/images
            const imageFiles = [];
            for (let i = 1; i <= 100; i++) {
                imageFiles.push(`初级 (${i}).jpg`);
            }
            
            res.json({ 
                basePath: '/images/', 
                images: imageFiles,
                count: imageFiles.length
            });
        } else {
            res.status(404).json({ error: 'Endpoint not found' });
        }
    });
});