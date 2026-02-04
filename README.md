# Oxford English Flashcards Game

An interactive flashcard application designed for learning Oxford English vocabulary with visual aids.

## Features

### ✅ Implemented Features

1. **Card Flip Animation**
   - Smooth 3D flip animation using CSS transforms
   - Visual feedback when flipping cards
   - Support for both tap and keyboard interactions

2. **Frontend-Backend Interaction**
   - RESTful API integration
   - Real-time progress synchronization
   - Error handling and fallback mechanisms

3. **Dynamic Image Loading**
   - Loads images from `/Volumes/138XXXX0377/下载/牛津树/05. 牛津闪卡1000张+音频/闪片/牛津闪卡 (1)/` path
   - Automatic image assignment to flashcards
   - Responsive image display on both card sides

4. **Navigation System**
   - Previous/Next buttons
   - Keyboard navigation (arrow keys, spacebar)
   - Touch swipe gestures for mobile devices
   - Visual progress indicators

5. **Progress Tracking**
   - Individual card difficulty ratings (Again, Hard, Good, Easy)
   - Local storage persistence
   - Progress bar visualization
   - Statistics dashboard

### 📱 Mobile Compatibility

- Responsive design for all screen sizes
- Touch gesture support
- Optimized layout for mobile devices
- Prevented unwanted scrolling during interactions

## Technical Implementation

### Frontend Stack
- HTML5 for structure
- CSS3 for animations and styling
- JavaScript ES6+ for functionality
- LocalStorage for progress persistence

### Backend Stack
- Node.js with Express
- RESTful API endpoints
- CORS support for frontend communication

### API Endpoints

- `GET /api/flashcards` - Retrieve all flashcards
- `POST /api/flashcards/:id/rate` - Rate a flashcard
- `GET /api/progress` - Get user progress statistics
- `POST /api/progress/reset` - Reset all progress
- `GET /api/images` - Get available image files

## Usage

1. Install dependencies: `npm install`
2. Start the server: `npm start`
3. Open browser to `http://localhost:3000`

## Controls

- **Flip Card**: Click/tap on the card or press Spacebar
- **Next Card**: Right arrow key or Next button
- **Previous Card**: Left arrow key or Previous button
- **Rate Cards**: Number keys (1-4) or rating buttons
- **Swipe Gestures**: Horizontal swipe for navigation, vertical for flipping

## File Structure

```
flashcard-game/
├── index.html          # Main application page
├── styles.css          # Styling and animations
├── app.js              # Enhanced application logic
├── server.js           # Backend API server
├── package.json        # Dependencies
└── README.md           # This file
```

## Future Enhancements

- Spaced repetition algorithm implementation
- Audio pronunciation support
- User accounts and cloud sync
- Advanced statistics and analytics
- Customizable study modes