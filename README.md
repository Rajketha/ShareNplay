# ShareNPlay 🎮

A real-time multiplayer mini-games platform built with React and Node.js.

## 🎯 Features

- **Real-time multiplayer gaming** with Socket.IO
- **6 exciting mini-games:**
  - 🪨 Rock Paper Scissors
  - 👆 Tap War
  - 🧠 Quick Quiz
  - 😊 Emoji Memory
  - ⌨️ Typing Speed
  - ⚡ Reaction Time
- **Automatic game start** when both players join
- **Score tracking** and winner/loser animations
- **Sender game selection** - choose which game to play
- **Minimal, clean UI** for both sender and receiver

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ShareNPlay.git
   cd ShareNPlay
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start the servers:**
   ```bash
   # Start backend (in backend directory)
   cd backend
   npm start
   
   # Start frontend (in frontend directory, new terminal)
   cd frontend
   npm start
   ```

### Alternative: Use the provided scripts

**Windows:**
```bash
# Start both servers
start-both.bat

# Or start individually
start-backend.bat
start-frontend.bat
```

**PowerShell:**
```bash
# Start both servers
.\start-both.ps1

# Or start individually
.\start-backend.ps1
.\start-frontend.ps1
```

## 🎮 How to Play

1. **Open the app** in your browser at `http://localhost:3000`
2. **Choose your role:**
   - **Sender:** Creates the game and selects which mini-game to play
   - **Receiver:** Joins the game using the provided code
3. **Wait for both players** to join - game starts automatically
4. **Play 3 rounds** of the selected mini-game
5. **See final scores** and winner/loser animations

## 🏗️ Project Structure

```
ShareNPlay/
├── backend/                 # Node.js + Express + Socket.IO server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── node_modules/       # Backend dependencies
├── frontend/               # React application
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   └── index.js       # React entry point
│   ├── public/            # Static files
│   ├── package.json       # Frontend dependencies
│   └── node_modules/      # Frontend dependencies
├── README.md              # This file
├── .gitignore            # Git ignore rules
└── start-*.bat/ps1       # Startup scripts
```

## 🎯 Mini-Games

### Rock Paper Scissors
- Classic RPS with real-time results
- Best of 3 rounds

### Tap War
- Race to tap your button the most times
- 10-second timer per round

### Quick Quiz
- Answer trivia questions
- Fastest correct answer wins

### Emoji Memory
- Remember and repeat emoji sequences
- Increasing difficulty each round

### Typing Speed
- Type the given text as fast as possible
- WPM (Words Per Minute) scoring

### Reaction Time
- Click when the color changes
- Fastest reaction time wins

## 🔧 Development

### Backend (Port 5000)
- Express.js server
- Socket.IO for real-time communication
- CORS enabled for all localhost origins
- Game logic and state management

### Frontend (Port 3000)
- React with hooks
- Socket.IO client
- Responsive design
- Game UI components

## 🚀 Deployment

### GitHub Pages
1. Push code to GitHub
2. Enable GitHub Pages in repository settings
3. Set source to GitHub Actions
4. The app will auto-deploy on push

### Manual Deployment
```bash
# Build the frontend
cd frontend
npm run build

# Serve the build folder
npx serve -s build -l 3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill processes on ports
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**CORS errors:**
- Ensure backend is running on port 5000
- Check that frontend is connecting to correct backend URL

**Game not starting:**
- Make sure both players have joined
- Check browser console for errors
- Verify Socket.IO connection

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Look at the browser console for errors
3. Create an issue on GitHub

---

**Happy Gaming! 🎮✨** 