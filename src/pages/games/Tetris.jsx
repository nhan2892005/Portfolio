import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Trophy, Info, X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

const TETROMINOS = {
  I: { shape: [[1,1,1,1]], color: 'bg-cyan-500' },
  O: { shape: [[1,1],[1,1]], color: 'bg-yellow-500' },
  T: { shape: [[0,1,0],[1,1,1]], color: 'bg-purple-500' },
  S: { shape: [[0,1,1],[1,1,0]], color: 'bg-green-500' },
  Z: { shape: [[1,1,0],[0,1,1]], color: 'bg-red-500' },
  J: { shape: [[1,0,0],[1,1,1]], color: 'bg-blue-500' },
  L: { shape: [[0,0,1],[1,1,1]], color: 'bg-orange-500' }
};

const ModernTetris = () => {
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null)));
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, playing, paused, over
  const [time, setTime] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showHighscores, setShowHighscores] = useState(false);
  const [highscores, setHighscores] = useState([]);
  const [startLevel, setStartLevel] = useState(1);
  
  const gameLoopRef = useRef(null);
  const timerRef = useRef(null);

  const getRandomPiece = () => {
    const pieces = Object.keys(TETROMINOS);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    return { type: randomPiece, ...TETROMINOS[randomPiece] };
  };

  const createEmptyBoard = () => Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));

  const canMove = useCallback((piece, pos, newBoard = board) => {
    if (!piece) return false;
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false;
          if (newY >= 0 && newBoard[newY][newX]) return false;
        }
      }
    }
    return true;
  }, [board]);

  const mergePieceToBoard = useCallback(() => {
    if (!currentPiece) return board;
    
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell && position.y + y >= 0) {
          newBoard[position.y + y][position.x + x] = currentPiece.color;
        }
      });
    });
    return newBoard;
  }, [board, currentPiece, position]);

  const clearLines = useCallback((newBoard) => {
    let linesCleared = 0;
    const clearedBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== null)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    
    while (clearedBoard.length < BOARD_HEIGHT) {
      clearedBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }
    
    if (linesCleared > 0) {
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + (linesCleared * 100 * level));
      
      const newLines = lines + linesCleared;
      if (newLines >= level * 10) {
        setLevel(prev => prev + 1);
      }
    }
    
    return clearedBoard;
  }, [level, lines]);

  const spawnNewPiece = useCallback(() => {
    const piece = nextPiece || getRandomPiece();
    const startX = Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2);
    const startY = 0;
    
    if (!canMove(piece, { x: startX, y: startY })) {
      setGameStatus('over');
      return false;
    }
    
    setCurrentPiece(piece);
    setNextPiece(getRandomPiece());
    setPosition({ x: startX, y: startY });
    return true;
  }, [nextPiece, canMove]);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameStatus !== 'playing') return;
    
    const newPos = { x: position.x, y: position.y + 1 };
    
    if (canMove(currentPiece, newPos)) {
      setPosition(newPos);
    } else {
      const mergedBoard = mergePieceToBoard();
      const clearedBoard = clearLines(mergedBoard);
      setBoard(clearedBoard);
      spawnNewPiece();
    }
  }, [currentPiece, position, gameStatus, canMove, mergePieceToBoard, clearLines, spawnNewPiece]);

  const moveLeft = () => {
    if (!currentPiece || gameStatus !== 'playing') return;
    const newPos = { x: position.x - 1, y: position.y };
    if (canMove(currentPiece, newPos)) setPosition(newPos);
  };

  const moveRight = () => {
    if (!currentPiece || gameStatus !== 'playing') return;
    const newPos = { x: position.x + 1, y: position.y };
    if (canMove(currentPiece, newPos)) setPosition(newPos);
  };

  const rotate = () => {
    if (!currentPiece || gameStatus !== 'playing') return;
    
    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );
    
    const rotatedPiece = { ...currentPiece, shape: rotated };
    if (canMove(rotatedPiece, position)) {
      setCurrentPiece(rotatedPiece);
    }
  };

  const hardDrop = () => {
    if (!currentPiece || gameStatus !== 'playing') return;
    
    let newY = position.y;
    while (canMove(currentPiece, { x: position.x, y: newY + 1 })) {
      newY++;
      setScore(prev => prev + 2);
    }
    
    setPosition({ x: position.x, y: newY });
    
    // Immediately lock the piece
    const newPos = { x: position.x, y: newY };
    const mergedBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell && newPos.y + y >= 0) {
          mergedBoard[newPos.y + y][newPos.x + x] = currentPiece.color;
        }
      });
    });
    
    const clearedBoard = clearLines(mergedBoard);
    setBoard(clearedBoard);
    spawnNewPiece();
  };

  const startGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLevel(startLevel);
    setLines(0);
    setTime(0);
    setGameStatus('playing');
    setNextPiece(getRandomPiece());
    spawnNewPiece();
  };

  const togglePause = () => {
    if (gameStatus === 'playing') setGameStatus('paused');
    else if (gameStatus === 'paused') setGameStatus('playing');
  };

  const resetGame = () => {
    setGameStatus('idle');
    setBoard(createEmptyBoard());
    setCurrentPiece(null);
    setNextPiece(null);
    setScore(0);
    setLevel(startLevel);
    setLines(0);
    setTime(0);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameStatus !== 'playing') return;
      
      switch(e.key) {
        case 'ArrowLeft': 
          e.preventDefault();
          moveLeft(); 
          break;
        case 'ArrowRight': 
          e.preventDefault();
          moveRight(); 
          break;
        case 'ArrowDown': 
          e.preventDefault();
          moveDown(); 
          break;
        case 'ArrowUp': 
          e.preventDefault();
          rotate(); 
          break;
        case ' ': 
          e.preventDefault(); 
          hardDrop(); 
          break;
        case 'p': 
        case 'P':
          e.preventDefault();
          togglePause(); 
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStatus, currentPiece, position, moveDown]);

  useEffect(() => {
    if (gameStatus === 'playing') {
      const speed = Math.max(100, 1000 - (level - 1) * 100);
      gameLoopRef.current = setInterval(moveDown, speed);
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    }
    
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus, level, moveDown]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece && gameStatus === 'playing') {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell && position.y + y >= 0 && position.y + y < BOARD_HEIGHT) {
            displayBoard[position.y + y][position.x + x] = currentPiece.color;
          }
        });
      });
    }
    
    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className={`w-7 h-7 border border-gray-700 ${cell || 'bg-gray-900'} transition-colors`}
          />
        ))}
      </div>
    ));
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    return (
      <div className="bg-gradient-to-tr from-gray-100 to-gray-200 p-4 rounded-lg">
        <h3 className="text-sm font-semibold mb-2 text-gray-300">Next</h3>
        <div className="flex flex-col items-center">
          {nextPiece.shape.map((row, y) => (
            <div key={y} className="flex">
              {row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className={`w-6 h-6 border border-gray-700 ${cell ? nextPiece.color : 'bg-gray-900'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-tr from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <h1 className="text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-black">
          Blocks Game
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
          {/* Left Panel */}
          <div className="bg-gradient-to-tr from-gray-100 to-gray-200 rounded-xl p-6 space-y-4 w-full lg:w-64">
            {gameStatus === 'idle' && (
              <div className="rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold mb-3 text-orange-400">Starting Level</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setStartLevel(lvl)}
                      className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                        startLevel === lvl
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Higher level = faster speed</p>
              </div>
            )}
            
            <div className="space-y-2">
              <button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Play size={20} /> New Game
              </button>
              
              {gameStatus === 'playing' && (
                <button
                  onClick={togglePause}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Pause size={20} /> Pause
                </button>
              )}
              
              {gameStatus === 'paused' && (
                <button
                  onClick={togglePause}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Play size={20} /> Resume
                </button>
              )}
              
              <button
                onClick={resetGame}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw size={20} /> Reset
              </button>
              
              <button
                onClick={() => setShowHelp(true)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Info size={20} /> Controls
              </button>

              <button 
                onClick={() => window.location.href = '/games'} 
                className="w-full bg-pink-400 hover:bg-pink-600 text-gray-600 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                Quay về menu
              </button>
            </div>

            {renderNextPiece()}

            <div className="rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-bold text-orange-400 mb-3">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Score:</span>
                  <span className="font-bold text-cyan-400">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Level:</span>
                  <span className="font-bold text-green-400">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lines:</span>
                  <span className="font-bold text-yellow-400">{lines}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="font-bold text-orange-400">{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="relative">
            <div className="bg-black rounded-xl p-4 shadow-2xl border-4 border-purple-500">
              {renderBoard()}
            </div>
            
            {gameStatus === 'over' && (
              <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-xl">
                <div className="text-center">
                  <h2 className="text-4xl font-bold text-red-500 mb-4">Game Over!</h2>
                  <p className="text-2xl text-white mb-6">Score: {score}</p>
                  <button
                    onClick={startGame}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
            
            {gameStatus === 'paused' && (
              <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-xl">
                <h2 className="text-4xl font-bold text-yellow-400">Paused</h2>
              </div>
            )}
          </div>

          {/* Right Panel - Controls */}
          <div className="bg-gradient-to-tr from-gray-100 to-gray-200 rounded-xl p-6 w-full lg:w-64">
            <h3 className="text-lg font-bold text-orange-400 mb-4">Controls</h3>
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={rotate}
                  disabled={gameStatus !== 'playing'}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white p-3 rounded-lg transition-all"
                >
                  <ArrowUp size={24} />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={moveLeft}
                    disabled={gameStatus !== 'playing'}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white p-3 rounded-lg transition-all"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <button
                    onClick={moveDown}
                    disabled={gameStatus !== 'playing'}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white p-3 rounded-lg transition-all"
                  >
                    <ArrowDown size={24} />
                  </button>
                  <button
                    onClick={moveRight}
                    disabled={gameStatus !== 'playing'}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white p-3 rounded-lg transition-all"
                  >
                    <ArrowRight size={24} />
                  </button>
                </div>
                <button
                  onClick={hardDrop}
                  disabled={gameStatus !== 'playing'}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white py-2 px-8 rounded-lg font-semibold transition-all"
                >
                  DROP (Space)
                </button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 text-sm space-y-2 text-gray-300">
                <p><kbd className="bg-gray-700 px-2 py-1 rounded">↑</kbd> Rotate</p>
                <p><kbd className="bg-gray-700 px-2 py-1 rounded">←→</kbd> Move</p>
                <p><kbd className="bg-gray-700 px-2 py-1 rounded">↓</kbd> Soft Drop</p>
                <p><kbd className="bg-gray-700 px-2 py-1 rounded">Space</kbd> Hard Drop</p>
                <p><kbd className="bg-gray-700 px-2 py-1 rounded">P</kbd> Pause</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-tr from-gray-400 to-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-orange-400">How to Play</h2>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-3 text-gray-300">
              <p>Use arrow keys to move and rotate pieces.</p>
              <p>Complete horizontal lines to score points.</p>
              <p>Game speed increases with each level.</p>
              <p>Clear 10 lines per level to advance.</p>
              <p className="text-cyan-400 font-semibold">Press Space for instant drop!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernTetris;