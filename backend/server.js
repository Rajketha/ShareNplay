const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Game state storage
const games = new Map();
const players = new Map();

// Game configurations
const GAMES = {
  'rock-paper-scissors': {
    name: 'Rock Paper Scissors',
    rounds: 3,
    options: ['rock', 'paper', 'scissors']
  },
  'tap-war': {
    name: 'Tap War',
    rounds: 3,
    duration: 10000 // 10 seconds
  },
  'quick-quiz': {
    name: 'Quick Quiz',
    rounds: 3,
    questions: [
      { question: "What is 2 + 2?", answer: "4" },
      { question: "What color is the sky?", answer: "blue" },
      { question: "How many days in a week?", answer: "7" },
      { question: "What is the capital of France?", answer: "paris" },
      { question: "What is the largest planet?", answer: "jupiter" }
    ]
  },
  'emoji-memory': {
    name: 'Emoji Memory',
    rounds: 3,
    emojis: ['😀', '😎', '🎮', '🚀', '⭐', '🎯', '🎪', '🎨']
  },
  'typing-speed': {
    name: 'Typing Speed',
    rounds: 3,
    texts: [
      "The quick brown fox jumps over the lazy dog.",
      "All work and no play makes Jack a dull boy.",
      "To be or not to be, that is the question.",
      "A journey of a thousand miles begins with a single step.",
      "Practice makes perfect."
    ]
  },
  'reaction-time': {
    name: 'Reaction Time',
    rounds: 3,
    minDelay: 1000,
    maxDelay: 5000
  }
};

// Helper functions
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getWinner(player1Choice, player2Choice, gameType) {
  if (gameType === 'rock-paper-scissors') {
    if (player1Choice === player2Choice) return 'tie';
    if (
      (player1Choice === 'rock' && player2Choice === 'scissors') ||
      (player1Choice === 'paper' && player2Choice === 'rock') ||
      (player1Choice === 'scissors' && player2Choice === 'paper')
    ) {
      return 'player1';
    }
    return 'player2';
  }
  return null;
}

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createGame', (data) => {
    const roomCode = generateRoomCode();
    const gameType = data.gameType || 'rock-paper-scissors';
    
    games.set(roomCode, {
      id: roomCode,
      type: gameType,
      players: [socket.id],
      scores: { [socket.id]: 0 },
      currentRound: 0,
      maxRounds: GAMES[gameType].rounds,
      status: 'waiting',
      gameData: {}
    });
    
    players.set(socket.id, { roomCode, role: 'sender' });
    socket.join(roomCode);
    
    socket.emit('gameCreated', { roomCode, gameType });
    console.log(`Game created: ${roomCode} (${gameType})`);
  });

  socket.on('joinGame', (data) => {
    const { roomCode } = data;
    const game = games.get(roomCode);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    if (game.players.length >= 2) {
      socket.emit('error', { message: 'Game is full' });
      return;
    }
    
    game.players.push(socket.id);
    game.scores[socket.id] = 0;
    players.set(socket.id, { roomCode, role: 'receiver' });
    socket.join(roomCode);
    
    socket.emit('gameJoined', { roomCode, gameType: game.type });
    
    // Start game if both players joined
    if (game.players.length === 2) {
      game.status = 'playing';
      game.currentRound = 1;
      
      io.to(roomCode).emit('gameStart', {
        gameType: game.type,
        round: game.currentRound,
        maxRounds: game.maxRounds
      });
      
      console.log(`Game started: ${roomCode}`);
    }
  });

  socket.on('gameAction', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    const game = games.get(player.roomCode);
    if (!game || game.status !== 'playing') return;
    
    const { action, value } = data;
    
    if (!game.gameData[socket.id]) {
      game.gameData[socket.id] = {};
    }
    
    game.gameData[socket.id][game.currentRound] = { action, value };
    
    // Check if both players have made their moves
    const player1 = game.players[0];
    const player2 = game.players[1];
    
    if (game.gameData[player1]?.[game.currentRound] && 
        game.gameData[player2]?.[game.currentRound]) {
      
      // Process round result
      let roundResult;
      
      switch (game.type) {
        case 'rock-paper-scissors':
          const p1Choice = game.gameData[player1][game.currentRound].action;
          const p2Choice = game.gameData[player2][game.currentRound].action;
          const winner = getWinner(p1Choice, p2Choice, game.type);
          
          if (winner === 'player1') {
            game.scores[player1]++;
          } else if (winner === 'player2') {
            game.scores[player2]++;
          }
          
          roundResult = {
            player1: { choice: p1Choice, score: game.scores[player1] },
            player2: { choice: p2Choice, score: game.scores[player2] },
            winner: winner
          };
          break;
          
        case 'tap-war':
          const p1Taps = game.gameData[player1][game.currentRound].value;
          const p2Taps = game.gameData[player2][game.currentRound].value;
          
          if (p1Taps > p2Taps) {
            game.scores[player1]++;
          } else if (p2Taps > p1Taps) {
            game.scores[player2]++;
          }
          
          roundResult = {
            player1: { taps: p1Taps, score: game.scores[player1] },
            player2: { taps: p2Taps, score: game.scores[player2] },
            winner: p1Taps > p2Taps ? 'player1' : p2Taps > p1Taps ? 'player2' : 'tie'
          };
          break;
          
        case 'quick-quiz':
          const p1Answer = game.gameData[player1][game.currentRound].value;
          const p2Answer = game.gameData[player2][game.currentRound].value;
          const p1Time = game.gameData[player1][game.currentRound].time;
          const p2Time = game.gameData[player2][game.currentRound].time;
          
          const question = GAMES[game.type].questions[game.currentRound - 1];
          const correctAnswer = question.answer.toLowerCase();
          
          let winner = 'tie';
          if (p1Answer.toLowerCase() === correctAnswer && p2Answer.toLowerCase() !== correctAnswer) {
            game.scores[player1]++;
            winner = 'player1';
          } else if (p2Answer.toLowerCase() === correctAnswer && p1Answer.toLowerCase() !== correctAnswer) {
            game.scores[player2]++;
            winner = 'player2';
          } else if (p1Answer.toLowerCase() === correctAnswer && p2Answer.toLowerCase() === correctAnswer) {
            if (p1Time < p2Time) {
              game.scores[player1]++;
              winner = 'player1';
            } else if (p2Time < p1Time) {
              game.scores[player2]++;
              winner = 'player2';
            }
          }
          
          roundResult = {
            player1: { answer: p1Answer, time: p1Time, score: game.scores[player1] },
            player2: { answer: p2Answer, time: p2Time, score: game.scores[player2] },
            correctAnswer: correctAnswer,
            winner: winner
          };
          break;
          
        case 'emoji-memory':
          const p1Score = game.gameData[player1][game.currentRound].value;
          const p2Score = game.gameData[player2][game.currentRound].value;
          
          if (p1Score > p2Score) {
            game.scores[player1]++;
          } else if (p2Score > p1Score) {
            game.scores[player2]++;
          }
          
          roundResult = {
            player1: { score: p1Score, totalScore: game.scores[player1] },
            player2: { score: p2Score, totalScore: game.scores[player2] },
            winner: p1Score > p2Score ? 'player1' : p2Score > p1Score ? 'player2' : 'tie'
          };
          break;
          
        case 'typing-speed':
          const p1WPM = game.gameData[player1][game.currentRound].value;
          const p2WPM = game.gameData[player2][game.currentRound].value;
          
          if (p1WPM > p2WPM) {
            game.scores[player1]++;
          } else if (p2WPM > p1WPM) {
            game.scores[player2]++;
          }
          
          roundResult = {
            player1: { wpm: p1WPM, totalScore: game.scores[player1] },
            player2: { wpm: p2WPM, totalScore: game.scores[player2] },
            winner: p1WPM > p2WPM ? 'player1' : p2WPM > p1WPM ? 'player2' : 'tie'
          };
          break;
          
        case 'reaction-time':
          const p1Time = game.gameData[player1][game.currentRound].value;
          const p2Time = game.gameData[player2][game.currentRound].value;
          
          if (p1Time < p2Time) {
            game.scores[player1]++;
          } else if (p2Time < p1Time) {
            game.scores[player2]++;
          }
          
          roundResult = {
            player1: { time: p1Time, totalScore: game.scores[player1] },
            player2: { time: p2Time, totalScore: game.scores[player2] },
            winner: p1Time < p2Time ? 'player1' : p2Time < p1Time ? 'player2' : 'tie'
          };
          break;
      }
      
      io.to(player.roomCode).emit('roundResult', roundResult);
      
      // Check if game is over
      if (game.currentRound >= game.maxRounds) {
        const finalScores = {
          player1: { score: game.scores[player1] },
          player2: { score: game.scores[player2] },
          winner: game.scores[player1] > game.scores[player2] ? 'player1' : 
                 game.scores[player2] > game.scores[player1] ? 'player2' : 'tie'
        };
        
        io.to(player.roomCode).emit('gameEnd', finalScores);
        games.delete(player.roomCode);
        
        console.log(`Game ended: ${player.roomCode}`);
      } else {
        // Start next round
        game.currentRound++;
        setTimeout(() => { 
          io.to(player.roomCode).emit('nextRound', {
            round: game.currentRound,
            maxRounds: game.maxRounds
          }); 
        }, 2000);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const player = players.get(socket.id);
    if (player) {
      const game = games.get(player.roomCode);
      if (game) {
        io.to(player.roomCode).emit('playerDisconnected');
        games.delete(player.roomCode);
      }
      players.delete(socket.id);
    }
  });
});

// API Routes
app.get('/api/games', (req, res) => {
  res.json(Object.keys(GAMES).map(key => ({
    id: key,
    name: GAMES[key].name
  })));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`ShareNPlay Backend running on port ${PORT}`);
}); 