import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import './index.css';
import confetti from 'canvas-confetti';

const BACKEND_URL = 'http://localhost:5000';
const FEATURES = [
  { icon: '🔒', text: 'Secure 6-digit code file sharing' },
  { icon: '📱', text: 'QR code for easy sharing' },
  { icon: '🚀', text: 'Real-time transfer with rocket animation' },
  { icon: '🎮', text: '6 fun mini-games while you wait' },
  { icon: '🤝', text: 'Best-of-3 multiplayer game flow' },
  { icon: '😜', text: 'Dare system for the winner' },
  { icon: '🧹', text: 'Auto-cleanup after 1 hour' },
  { icon: '🌙', text: 'Glassmorphism & animated illusion theme - NEW!' },
];

function App() {
  const [view, setView] = useState('home');
  const [file, setFile] = useState(null);
  const [code, setCode] = useState('');
  const [dare, setDare] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [playerType, setPlayerType] = useState('');
  const [dares, setDares] = useState({});
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ sender: 0, receiver: 0 });
  const [gameResult, setGameResult] = useState(null);
  const [gameWinner, setGameWinner] = useState(null);
  const [action, setAction] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [receiverFileInfo, setReceiverFileInfo] = useState(null);
  const [receiverCode, setReceiverCode] = useState('');
  const [receiverDare, setReceiverDare] = useState('');
  const [receiverError, setReceiverError] = useState('');
  const [gameData, setGameData] = useState(null);
  // Add state for dare categories and selected category for sender and receiver
  const [dareCategories, setDareCategories] = useState([]);
  const [selectedDareCategory, setSelectedDareCategory] = useState('');
  const [receiverDareCategory, setReceiverDareCategory] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  // Add state for waiting debug info
  const [waitingHint, setWaitingHint] = useState('');

  // Fetch dare categories on mount
  useEffect(() => {
    axios.get(`${BACKEND_URL}/dare-categories`).then(res => {
      setDareCategories(res.data);
    });
  }, []);

  useEffect(() => {
    const s = io(BACKEND_URL);
    setSocket(s);
    
    // Connection events
    s.on('connect', () => {
      console.log('Connected to backend');
    });
    
    s.on('disconnect', () => {
      console.log('Disconnected from backend');
    });
    
    s.on('playerJoined', ({ playerType, dare }) => {
      console.log('Player joined:', playerType, dare);
    });
    
    s.on('gameStart', ({ dares, round, gameData, game }) => {
      console.log('Game started event received:', { dares, round, gameData, game });
      setDares(dares); 
      setRound(round); 
      setView('game');
      setScores({ sender: 0, receiver: 0 });
      setAction('');
      setGameResult(null);
      setGameWinner(null);
      setGameData(gameData);
      // Update fileInfo with game suggestion
      setFileInfo(prev => prev ? { ...prev, gameSuggestion: game } : { gameSuggestion: game });
      console.log('Game started:', game, gameData); // Debug log
    });
    s.on('roundResult', ({ result, scores, round }) => {
      console.log('Round result received:', { result, scores, round });
      setGameResult({ winner: result.winner, reason: result.reason });
      setScores(scores);
      setRound(round);
      setAction(''); // Reset action for next round
      setTimeout(() => setGameResult(null), 2000);
    });
    s.on('gameEnd', ({ winner, finalScores, scores, dares }) => {
      console.log('Game end received:', { winner, finalScores, scores, dares });
      setGameWinner({ winner, finalScores, scores, dares });
      setView('end');
    });
    s.on('nextRound', ({ round, gameData }) => {
      setRound(round);
      setGameData(gameData);
      setAction(''); // Clear the input for new round
      setGameResult(null);
      console.log(`Starting round ${round} with new game data`);
    });
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (view === 'waiting') {
      setWaitingHint('');
      const timer = setTimeout(() => {
        setWaitingHint('Still waiting? Make sure both players joined with the same code and entered a dare.');
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [view]);

  // Place confetti useEffect here, before any return or conditional
  useEffect(() => {
    // Only trigger confetti when game ends and player wins
    if (view === 'end' && gameWinner && gameWinner.winner === playerType && gameWinner.winner !== 'tie') {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    }
  }, [view, gameWinner, playerType]);

  const handleUpload = async () => {
    setIsUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await axios.post(`${BACKEND_URL}/upload`, form);
    setCode(res.data.code);
    setFileInfo({ fileName: res.data.fileName, mimetype: res.data.mimetype });
    setView('sender');
    setIsUploading(false);
  };

  const handleJoinAsSender = () => {
    console.log('Joining as sender:', { code, dare, selectedGame });
    socket.emit('joinRoom', { code, playerType: 'sender', dare, selectedGame });
    setPlayerType('sender');
    setView('waiting');
  };

  const handleJoinAsReceiver = async (receiverCode, receiverDare) => {
    try {
      console.log('Joining as receiver:', { receiverCode, receiverDare });
      const res = await axios.get(`${BACKEND_URL}/fileinfo/${receiverCode}`);
      setFileInfo(res.data);
      socket.emit('joinRoom', { code: receiverCode, playerType: 'receiver', dare: receiverDare });
      setPlayerType('receiver');
      setView('waiting');
    } catch (error) {
      console.error('Error joining as receiver:', error);
      setError('Failed to join game. Please check the code and try again.');
    }
  };

  const handleAction = (move) => {
    setAction(move);
    socket.emit('gameAction', { code, playerType, action: move });
  };

  const downloadFile = async () => {
    setIsDownloading(true);
    const res = await axios.get(`${BACKEND_URL}/download/${code}`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: fileInfo.mimetype });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileInfo.fileName;
    a.click();
    setIsDownloading(false);
  };

  // New: fetch file info for receiver
  const handleReceiverCodeChange = async (e) => {
    const val = e.target.value;
    setReceiverCode(val);
    setReceiverFileInfo(null);
    setReceiverError('');
    if (val.length === 6) {
      try {
        const res = await axios.get(`${BACKEND_URL}/fileinfo/${val}`);
        setReceiverFileInfo(res.data);
        setReceiverError(''); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching file info:', error);
        setReceiverError('No file found for this code. Please check the code and try again.');
      }
    }
  };

  // HOMEPAGE: beautiful glass, illusion bg, features 2-column, centered
  if (view === 'home') return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
      <div className="glass" style={{maxWidth:'520px',marginTop:'6em',marginBottom:'2em',width:'100%'}}>
        <h1 style={{fontSize:'2.5em',margin:'0 auto',textAlign:'center',marginBottom:'0.5em'}}>ShareNPlay</h1>
        <p style={{textAlign:'center',marginBottom:'2em',fontSize:'1.1em',color:'#666'}}>Secure file sharing with fun mini-games</p>
        
        <div style={{display:'flex',justifyContent:'center',gap:'2em',margin:'2em 0'}}>
          <button 
            onClick={() => setView('sender')}
            style={{
              padding: '1em 2em',
              fontSize: '1.2em',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              minWidth: '120px'
            }}
          >
            📤 Send File
          </button>
          <button 
            onClick={() => setView('receiver')}
            style={{
              padding: '1em 2em',
              fontSize: '1.2em',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              minWidth: '120px'
            }}
          >
            📥 Receive File
          </button>
        </div>
        
        <div style={{textAlign:'center',marginTop:'3em',color:'#888',fontSize:'0.9em'}}>
          <p>Share files securely with a 6-digit code</p>
          <p>Play mini-games while waiting • Winner gets a dare!</p>
        </div>
        
        <div style={{display:'flex',justifyContent:'center',gap:'2em',flexWrap:'wrap',marginTop:'2em'}}>
          <ul className="features-list" style={{flex:'1 1 180px',minWidth:'180px',maxWidth:'220px',paddingRight:'1em'}}>
            {FEATURES.slice(0, Math.ceil(FEATURES.length/2)).map((f,i) => (
              <li key={i} style={{cursor:'pointer',alignItems:'center'}}>
                <span style={{fontSize:'1.2em',marginRight:'0.6em',display:'inline-block',width:'1.5em',textAlign:'center'}}>{f.icon}</span> <span style={{flex:1}}>{f.text}</span>
              </li>
            ))}
          </ul>
          <ul className="features-list" style={{flex:'1 1 180px',minWidth:'180px',maxWidth:'220px',paddingLeft:'1em'}}>
            {FEATURES.slice(Math.ceil(FEATURES.length/2)).map((f,i) => (
              <li key={i+Math.ceil(FEATURES.length/2)} style={{cursor:'pointer',alignItems:'center'}}>
                <span style={{fontSize:'1.2em',marginRight:'0.6em',display:'inline-block',width:'1.5em',textAlign:'center'}}>{f.icon}</span> <span style={{flex:1}}>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {error && <div style={{color:'#e74c3c'}}>{error}</div>}
    </div>
  );
  if (view === 'sender') return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
      <div className="glass" style={{maxWidth:'500px',width:'100%',padding:'2em'}}>
        <h2 style={{textAlign:'center',marginBottom:'1.5em',color:'#333'}}>📤 Send File</h2>
        
        {!code ? (
          <div style={{textAlign:'center'}}>
            <div style={{marginBottom:'1.5em'}}>
              <input 
                type="file" 
                onChange={e => setFile(e.target.files[0])}
                style={{
                  display: 'none'
                }}
                id="fileInput"
              />
              <label 
                htmlFor="fileInput"
                style={{
                  display: 'inline-block',
                  padding: '1em 2em',
                  backgroundColor: '#f8f9fa',
                  border: '2px dashed #dee2e6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.1em',
                  color: '#6c757d'
                }}
              >
                {file ? `📎 ${file.name}` : '📁 Choose File'}
              </label>
            </div>
            
            <button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              style={{
                padding: '0.8em 2em',
                fontSize: '1.1em',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: !file || isUploading ? 'not-allowed' : 'pointer',
                opacity: !file || isUploading ? 0.6 : 1
              }}
            >
              {isUploading ? '⏳ Generating Code...' : '🚀 Send & Generate Code'}
            </button>
          </div>
        ) : (
          <div style={{textAlign:'center'}}>
            <div style={{marginBottom:'2em'}}>
              <h3 style={{color:'#28a745',marginBottom:'0.5em'}}>✅ File Uploaded!</h3>
              <div style={{fontSize:'2em',fontWeight:'bold',color:'#007bff',marginBottom:'0.5em'}}>{code}</div>
              <p style={{color:'#6c757d',marginBottom:'1em'}}>Share this code with the receiver</p>
              <QRCodeSVG value={code} size={120} style={{margin:'0 auto'}} />
            </div>
            
            <div style={{marginBottom:'1.5em'}}>
              <select 
                value={selectedDareCategory} 
                onChange={e => setSelectedDareCategory(e.target.value)}
                style={{
                  padding: '0.5em',
                  fontSize: '1em',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  marginRight: '0.5em',
                  minWidth: '150px'
                }}
              >
                <option value="">🎯 Select Dare Category</option>
                {dareCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <button 
                disabled={!selectedDareCategory} 
                onClick={async()=>{
                  const res = await axios.get(`${BACKEND_URL}/random-dare/${selectedDareCategory}`);
                  setDare(res.data.dare);
                }}
                style={{
                  padding: '0.5em 1em',
                  fontSize: '1em',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !selectedDareCategory ? 'not-allowed' : 'pointer',
                  opacity: !selectedDareCategory ? 0.6 : 1
                }}
              >
                🎲 Get Dare
              </button>
            </div>
            
            <input 
              placeholder="💬 Your dare (or get one randomly)" 
              value={dare} 
              onChange={e => setDare(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8em',
                fontSize: '1em',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                marginBottom: '1.5em',
                boxSizing: 'border-box'
              }}
            />
            
            <div style={{marginBottom:'1.5em'}}>
              <select 
                value={selectedGame} 
                onChange={e => setSelectedGame(e.target.value)}
                style={{
                  padding: '0.5em',
                  fontSize: '1em',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  minWidth: '200px'
                }}
              >
                <option value="">🎮 Auto-select game</option>
                <option value="rockPaperScissors">✂️ Rock Paper Scissors</option>
                <option value="tapWar">👆 Tap War</option>
                <option value="quickQuiz">🧠 Quick Quiz</option>
                <option value="emojiMemory">😊 Emoji Memory</option>
                <option value="typingSpeed">⌨️ Typing Speed</option>
                <option value="reactionTime">⚡ Reaction Time</option>
              </select>
            </div>
            
            <button 
              onClick={handleJoinAsSender} 
              disabled={!dare}
              style={{
                padding: '0.8em 2em',
                fontSize: '1.1em',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: !dare ? 'not-allowed' : 'pointer',
                opacity: !dare ? 0.6 : 1,
                marginBottom: '1em'
              }}
            >
              🎮 Join Game
            </button>
          </div>
        )}
        
        <button 
          onClick={()=>{setView('home');setFile(null);setCode('');setDare('');}}
          style={{
            padding: '0.5em 1em',
            fontSize: '0.9em',
            backgroundColor: 'transparent',
            color: '#6c757d',
            border: '1px solid #6c757d',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
  if (view === 'receiver') return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
      <div className="glass" style={{maxWidth:'500px',width:'100%',padding:'2em'}}>
        <h2 style={{textAlign:'center',marginBottom:'1.5em',color:'#333'}}>📥 Receive File</h2>
        
        <div style={{textAlign:'center'}}>
          <div style={{marginBottom:'2em'}}>
            <input 
              placeholder="🔢 Enter 6-digit code" 
              value={receiverCode} 
              onChange={handleReceiverCodeChange} 
              maxLength={6}
              style={{
                width: '100%',
                padding: '1em',
                fontSize: '1.2em',
                textAlign: 'center',
                borderRadius: '8px',
                border: '2px solid #dee2e6',
                boxSizing: 'border-box',
                letterSpacing: '0.2em',
                fontWeight: 'bold'
              }}
            />
          </div>
          
          {receiverFileInfo && (
            <div style={{
              marginBottom:'2em',
              padding: '1em',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{color:'#28a745',marginBottom:'0.5em'}}>📎 File Found!</h3>
              <p style={{fontSize:'1.1em',color:'#333',marginBottom:'1em'}}>
                <strong>{receiverFileInfo.fileName}</strong>
              </p>
              <button 
                onClick={async()=>{
                  const res = await axios.get(`${BACKEND_URL}/download/${receiverCode}`, { responseType: 'blob' });
                  const blob = new Blob([res.data], { type: receiverFileInfo.mimetype });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = receiverFileInfo.fileName;
                  a.click();
                }}
                style={{
                  padding: '0.8em 2em',
                  fontSize: '1.1em',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                💾 Download File
              </button>
            </div>
          )}
          
          {receiverFileInfo && (
            <>
              <div style={{marginBottom:'1.5em'}}>
                <select 
                  value={receiverDareCategory} 
                  onChange={e => setReceiverDareCategory(e.target.value)}
                  style={{
                    padding: '0.5em',
                    fontSize: '1em',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    marginRight: '0.5em',
                    minWidth: '150px'
                  }}
                >
                  <option value="">🎯 Select Dare Category</option>
                  {dareCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <button 
                  disabled={!receiverDareCategory} 
                  onClick={async()=>{
                    const res = await axios.get(`${BACKEND_URL}/random-dare/${receiverDareCategory}`);
                    setReceiverDare(res.data.dare);
                  }}
                  style={{
                    padding: '0.5em 1em',
                    fontSize: '1em',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !receiverDareCategory ? 'not-allowed' : 'pointer',
                    opacity: !receiverDareCategory ? 0.6 : 1
                  }}
                >
                  🎲 Get Dare
                </button>
              </div>
              
              <input 
                placeholder="💬 Your dare (or get one randomly)" 
                value={receiverDare} 
                onChange={e => setReceiverDare(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8em',
                  fontSize: '1em',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  marginBottom: '1.5em',
                  boxSizing: 'border-box'
                }}
              />
              
              <button 
                onClick={async()=>{
                  setCode(receiverCode);
                  setDare(receiverDare);
                  await handleJoinAsReceiver(receiverCode, receiverDare);
                }} 
                disabled={!receiverCode || !receiverDare} 
                style={{
                  padding: '0.8em 2em',
                  fontSize: '1.1em',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !receiverCode || !receiverDare ? 'not-allowed' : 'pointer',
                  opacity: !receiverCode || !receiverDare ? 0.6 : 1,
                  marginBottom: '1em'
                }}
              >
                🎮 Join Game
              </button>
            </>
          )}
          
          {receiverError && (
            <div style={{
              color:'#dc3545',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              padding: '0.8em',
              marginBottom: '1em'
            }}>
              ⚠️ {receiverError}
            </div>
          )}
        </div>
        
        <button 
          onClick={()=>{setView('home');setReceiverCode('');setReceiverDare('');setReceiverFileInfo(null);}}
          style={{
            padding: '0.5em 1em',
            fontSize: '0.9em',
            backgroundColor: 'transparent',
            color: '#6c757d',
            border: '1px solid #6c757d',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
  if (view === 'waiting') return (
    <div style={{padding:40}}>
      <h2>Waiting for other player to join...</h2>
      <p><b>Player Type:</b> {playerType}</p>
      <p><b>Code:</b> {code}</p>
      <p><b>Dare:</b> {dare}</p>
      {waitingHint && <div style={{color:'#e67e22',marginTop:16}}>{waitingHint}</div>}
      <div style={{marginTop:24, color:'#888', fontSize:'0.98em'}}>
        <ul style={{paddingLeft:20}}>
          <li>Both sender and receiver must join with the same code.</li>
          <li>Both must select or enter a dare and click Join.</li>
          <li>If stuck, reload and try again in a new tab/window.</li>
        </ul>
      </div>
    </div>
  );
  if (view === 'game') return (
    <div style={{padding:40}}>
      <h2>Round {round}</h2>
      <div>Dares: Sender: {dares.sender} | Receiver: {dares.receiver}</div>
      <div>Scores: Sender {scores.sender} - Receiver {scores.receiver}</div>
      
      {/* Game-specific UI */}
      <div style={{marginTop: '2em'}}>
        
        {(fileInfo?.gameSuggestion?.game === 'rockPaperScissors' || fileInfo?.gameSuggestion?.game === 'rps') && (
          <div>
            <h3>Rock Paper Scissors</h3>
            <div>
              <button onClick={() => handleAction('rock')} disabled={!!action}>Rock</button>
              <button onClick={() => handleAction('paper')} disabled={!!action}>Paper</button>
              <button onClick={() => handleAction('scissors')} disabled={!!action}>Scissors</button>
            </div>
          </div>
        )}
        
        {fileInfo?.gameSuggestion?.game === 'tapWar' && (
          <TapWarGame onResult={handleAction} round={round} socket={socket} code={code} />
        )}
        
        {fileInfo?.gameSuggestion?.game === 'quickQuiz' && (
          <div>
            <h3>Quick Quiz - Round {round}</h3>
            {gameData && (
              <div style={{marginBottom: '1em', padding: '1em', backgroundColor: '#f9f9f9', borderRadius: '8px'}}>
                <p style={{fontSize: '1.2em', fontWeight: 'bold'}}>Question:</p>
                <p style={{fontSize: '1.1em'}}>{gameData.question}</p>
              </div>
            )}
            <div style={{marginBottom: '1em'}}>
              <input 
                placeholder="Type your answer..." 
                value={action} 
                onChange={(e) => setAction(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAction(action)}
                style={{padding: '0.5em', fontSize: '1em', width: '200px', marginRight: '0.5em'}}
              />
              <button 
                onClick={() => handleAction(action)} 
                disabled={!action}
                style={{padding: '0.5em 1em', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}
              >
                Submit Answer
              </button>
            </div>
            <div style={{fontSize: '0.9em', color: '#666'}}>
              Tip: Answer quickly and accurately!
            </div>
          </div>
        )}
        
        {fileInfo?.gameSuggestion?.game === 'emojiMemory' && (
          <EmojiMemoryGame sequence={gameData?.sequence || []} onResult={handleAction} />
        )}
        
        {fileInfo?.gameSuggestion?.game === 'typingSpeed' && (
          <TypingSpeedGame text={gameData?.text || ''} onResult={handleAction} />
        )}
        
        {fileInfo?.gameSuggestion?.game === 'reactionTime' && (
          <ReactionTimeGame onResult={handleAction} round={round} />
        )}
        
        {/* Fallback for unknown game types */}
        {!fileInfo?.gameSuggestion?.game && (
          <div>
            <h3>Default Game - Rock Paper Scissors</h3>
            <div>
              <button onClick={() => handleAction('rock')} disabled={!!action}>Rock</button>
              <button onClick={() => handleAction('paper')} disabled={!!action}>Paper</button>
              <button onClick={() => handleAction('scissors')} disabled={!!action}>Scissors</button>
            </div>
          </div>
        )}
      </div>
      
      {gameResult && (
        <div style={{marginTop: '2em', padding: '1em', backgroundColor: '#f0f8ff', borderRadius: '8px', textAlign:'center'}}>
          <h4>Round Result:</h4>
          <p>Winner: {gameResult.winner === 'tie' ? 'Tie' : (gameResult.winner === playerType ? 'You' : 'Opponent')}</p>
          <p>Reason: {gameResult.reason}</p>
          <p>Scores: Sender {scores.sender} - Receiver {scores.receiver}</p>
          {gameResult.winner === playerType && gameResult.winner !== 'tie' && <span style={{fontSize:'2em'}}>🏆</span>}
          {gameResult.winner !== playerType && gameResult.winner !== 'tie' && <span style={{fontSize:'2em'}}>😢</span>}
          {gameResult.winner === 'tie' && <span style={{fontSize:'2em'}}>🤝</span>}
        </div>
      )}
    </div>
  );
  if (view === 'end') {
    return (
      <div style={{padding:40, textAlign:'center'}}>
        <h2>Game Over!</h2>
        <div style={{fontSize:'2em', margin:'1em'}}>
          {gameWinner.winner === playerType && gameWinner.winner !== 'tie' && <span>🏆 <b>You Win!</b></span>}
          {gameWinner.winner !== playerType && gameWinner.winner !== 'tie' && <span>😢 <b>You Lose</b></span>}
          {gameWinner.winner === 'tie' && <span>🤝 <b>It&apos;s a Tie!</b></span>}
        </div>
        <div style={{fontSize:'1.2em', margin:'1em 0'}}>
          Final Scores:<br/>
          <b>Sender:</b> {gameWinner.finalScores ? gameWinner.finalScores.sender : (gameWinner.scores ? gameWinner.scores.sender : 0)} &nbsp; | &nbsp; <b>Receiver:</b> {gameWinner.finalScores ? gameWinner.finalScores.receiver : (gameWinner.scores ? gameWinner.scores.receiver : 0)}
        </div>
        <div>Dare: {gameWinner.dares[gameWinner.winner === 'sender' ? 'receiver' : 'sender']}</div>
        {playerType === 'receiver' && <button onClick={downloadFile} disabled={isDownloading}>Download File</button>}
        <button onClick={() => window.location.reload()}>Restart</button>
      </div>
    );
  }
  return null;
}

export default App; 

function TapWarGame({ onResult, round, socket, code }) {
  const [taps, setTaps] = useState(0);
  const [timer, setTimer] = useState(5);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  
  useEffect(() => {
    setTaps(0);
    setTimer(5);
    setRunning(false);
    setStartTime(null);
  }, [round]);
  
  useEffect(() => {
    let raf;
    function tick() {
      if (!running || !startTime) return;
      const elapsed = (Date.now() - startTime) / 1000;
      const left = Math.max(0, 5 - elapsed);
      setTimer(left);
      if (left > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        onResult(taps);
      }
    }
    if (running) {
      raf = requestAnimationFrame(tick);
    }
    return () => raf && cancelAnimationFrame(raf);
  }, [running, startTime, taps, onResult]);
  
  function handleTap() {
    if (!running) {
      setRunning(true);
      setTaps(1);
      setStartTime(Date.now());
      setTimer(5);
    } else {
      setTaps(t => t + 1);
    }
  }
  
  return (
    <div>
      <h3>Tap War - Tap as fast as you can!</h3>
      <div>Time left: {timer.toFixed(1)}s</div>
      <div style={{fontSize:'1.5em',margin:'0.5em 0'}}>Taps: {taps}</div>
      <button onClick={handleTap} disabled={timer === 0} style={{fontSize:'2em',padding:'1em 2em',margin:'1em 0'}}>
        {running ? 'TAP!' : 'Start'}
      </button>
    </div>
  );
}

function EmojiMemoryGame({ sequence, onResult }) {
  const [input, setInput] = useState([]);
  const [show, setShow] = useState(true);
  useEffect(() => {
    setShow(true);
    setInput([]);
    const t = setTimeout(() => setShow(false), 2000 + sequence.length * 500);
    return () => clearTimeout(t);
  }, [sequence]);
  function handleEmojiClick(e) {
    if (show) return;
    const val = e.target.textContent;
    setInput(arr => {
      const next = [...arr, val];
      if (next.length === sequence.length) {
        let correct = 0;
        for (let i = 0; i < sequence.length; i++) if (sequence[i] === next[i]) correct++;
        onResult(correct);
      }
      return next;
    });
  }
  return (
    <div>
      <h3>Emoji Memory</h3>
      {show ? (
        <div style={{fontSize:'2em'}}>{sequence.join(' ')}</div>
      ) : (
        <div>
          <div>Repeat the sequence:</div>
          <div style={{fontSize:'2em'}}>
            {['😀','🎉','🌟','🎮','🍕','🚀','🎵','🌈'].map(e => (
              <span key={e} style={{cursor:'pointer',margin:'0 0.2em',border:'1px solid #ccc',padding:'0.2em 0.4em',borderRadius:4}} onClick={handleEmojiClick}>{e}</span>
            ))}
          </div>
          <div>Your input: {input.join(' ')}</div>
        </div>
      )}
    </div>
  );
}

function TypingSpeedGame({ text, onResult }) {
  const [input, setInput] = useState('');
  const [start, setStart] = useState(null);
  const [done, setDone] = useState(false);
  
  // Reset state when text changes (new round)
  useEffect(() => {
    setInput('');
    setStart(null);
    setDone(false);
  }, [text]);
  
  function handleChange(e) {
    if (!start) setStart(Date.now());
    setInput(e.target.value);
    if (e.target.value === text) {
      setDone(true);
      const time = (Date.now() - start) / 1000;
      const wpm = Math.round((text.split(' ').length / time) * 60);
      onResult(wpm);
    }
  }
  return (
    <div>
      <h3>Typing Speed</h3>
      <div style={{marginBottom:'1em',fontStyle:'italic',color:'#666'}}>{text}</div>
      <textarea 
        value={input} 
        onChange={handleChange} 
        disabled={done} 
        rows={3} 
        style={{width:'100%'}}
        placeholder="Start typing here..."
      />
      {done && <div style={{color: '#28a745', fontWeight: 'bold'}}>✅ Done! WPM sent.</div>}
    </div>
  );
}

function ReactionTimeGame({ onResult, round }) {
  const [waiting, setWaiting] = useState(true);
  const [ready, setReady] = useState(false);
  const [start, setStart] = useState(null);
  const [done, setDone] = useState(false);
  
  // Reset state for new rounds and start timer
  useEffect(() => {
    setWaiting(true);
    setReady(false);
    setStart(null);
    setDone(false);
    
    // Start the timer for the new round
    const t = setTimeout(() => { 
      setReady(true); 
      setStart(Date.now()); 
    }, 1000 + Math.random() * 2000);
    
    return () => clearTimeout(t);
  }, [round]);
  
  function handleClick() {
    if (!ready || done) return;
    setDone(true);
    onResult(Date.now() - start);
  }
  return (
    <div>
      <h3>Reaction Time</h3>
      <div style={{margin:'1em 0',height:40,background:ready?'#4CAF50':'#f44336',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2em',borderRadius:8}}>
        {ready ? 'CLICK!' : 'Wait for green...' }
      </div>
      <button onClick={handleClick} disabled={!ready || done} style={{fontSize:'1.5em',padding:'1em 2em'}}>
        {done ? 'Done!' : 'Click Me!'}
      </button>
    </div>
  );
} 