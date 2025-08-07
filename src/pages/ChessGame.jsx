import React, { useState, useRef, useEffect } from 'react';
import Chessboard from 'chessboardjsx';
import { Chess } from 'chess.js';

export default function ChessGame() {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveFrom, setMoveFrom] = useState('');
  const [highlightSquares, setHighlightSquares] = useState({});
  const [history, setHistory] = useState([]);
  const [fenHistory, setFenHistory] = useState([gameRef.current.fen()]);
  const [whiteCaptured, setWhiteCaptured] = useState([]);
  const [blackCaptured, setBlackCaptured] = useState([]);

  // Responsive board width
  const boardContainerRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(400);
  useEffect(() => {
    const update = () => {
      if (!boardContainerRef.current) return;
      const available = boardContainerRef.current.offsetWidth - 40;
      setBoardWidth(Math.max(300, Math.min(available, 500)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // CPU random move
  function makeRandomMove() {
    const game = gameRef.current;
    if (game.isGameOver()) return;
    const moves = game.moves();
    const m = moves[Math.floor(Math.random() * moves.length)];
    const r = game.move(m);
    if (r) {
      handleCapture(r);
      updateState(`Máy: ${r.san}`);
    }
  }

  function handleCapture(move) {
    if (move.captured) {
      const piece = move.captured;
      if (move.color === 'w') setBlackCaptured(c => [...c, piece]);
      else setWhiteCaptured(c => [...c, piece]);
    }
  }

  function updateState(san) {
    const game = gameRef.current;
    setFen(game.fen());
    setHistory(h => [...h, san]);
    setFenHistory(fh => [...fh, game.fen()]);
    setHighlightSquares({});
    setMoveFrom('');
  }

  // Handle drop (user move)
  function onDrop({ sourceSquare, targetSquare }) {
    const game = gameRef.current;
    try {
      const mv = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (mv) {
        handleCapture(mv);
        updateState(`Bạn: ${mv.san}`);
        setTimeout(makeRandomMove, 400);
      }
    } catch {}  
  }

  // Click to highlight & move
  function onSquareClick(square) {
    const game = gameRef.current;
    const piece = game.get(square);
    if (!moveFrom && piece) {
      const moves = game.moves({ square, verbose: true });
      if (!moves.length) return;
      const opts = {};
      for (let m of moves) {
        opts[m.to] = {
          background:
            game.get(m.to) && game.get(m.to).color !== piece.color
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 70%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 30%, transparent 30%)',
          borderRadius: '50%',
        };
      }
      opts[square] = { background: 'rgba(59, 130, 246, 0.2)' };
      setHighlightSquares(opts);
      setMoveFrom(square);
      return;
    }
    if (moveFrom) {
      if (moveFrom === square) {
        setMoveFrom('');
        setHighlightSquares({});
        return;
      }
      const moves = game.moves({ square: moveFrom, verbose: true });
      const found = moves.find(m => m.to === square);
      if (found) {
        const mv = game.move({ from: moveFrom, to: square, promotion: 'q' });
        if (mv) {
          handleCapture(mv);
          updateState(`Bạn: ${mv.san}`);
          setTimeout(makeRandomMove, 400);
        }
      }
    }
  }

  // Reset and Undo
  function resetGame() {
    const newGame = new Chess();
    gameRef.current = newGame;
    setFen(newGame.fen());
    setHistory([]);
    setFenHistory([newGame.fen()]);
    setWhiteCaptured([]);
    setBlackCaptured([]);
    setHighlightSquares({});
    setMoveFrom('');
  }

  function undoMove() {
    if (fenHistory.length < 2) return;
    const newHistory = [...fenHistory];
    newHistory.pop(); newHistory.pop();
    const lastFen = newHistory[newHistory.length - 1];
    gameRef.current.load(lastFen);
    setFen(lastFen);
    setFenHistory(newHistory);
    const newSan = [...history]; newSan.pop(); newSan.pop();
    setHistory(newSan);
    setHighlightSquares({});
    setMoveFrom('');
  }

  // Current Turn
  const currentTurn = gameRef.current.turn() === 'w' ? 'White to move' : 'Black to move';

  const renderCaptured = pieces => (
    <div className="flex flex-wrap gap-1">
      {pieces.map((p, i) => <span key={i} className="text-xl">{p.toUpperCase()}</span>)}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" ref={boardContainerRef}>
      {/* Navbar spacer */}
      <div className="h-24" />

      {/* Main content */}
      <div className="flex flex-1 px-8">
        {/* Left empty */}
        <div className="hidden lg:block lg:w-1/6" />

        {/* Center area */}
        <div className="w-full lg:w-4/6 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <div className="flex space-x-4 mb-4">
            <button onClick={resetGame} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Restart
            </button>
            <button onClick={undoMove} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              Undo
            </button>
          </div>
          <div className="mb-4 text-xl font-semibold text-gray-700">{currentTurn}</div>
          <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
            <Chessboard
              width={boardWidth}
              position={fen}
              onDrop={onDrop}
              onSquareClick={onSquareClick}
              squareStyles={highlightSquares}
            />
          </div>
          <div className="mt-4 w-full flex justify-between text-gray-800">
            <div>
              <div className="font-medium">White captured:</div>
              {renderCaptured(whiteCaptured)}
            </div>
            <div>
              <div className="font-medium">Black captured:</div>
              {renderCaptured(blackCaptured)}
            </div>
          </div>
        </div>

        {/* Right history */}
        <div className="hidden md:flex flex-col lg:w-1/6 ml-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex-1 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-3">Move History</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              {history.map((h, i) => <li key={i}>{h}</li>)}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
