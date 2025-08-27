import React, { useState, useRef, useEffect } from 'react';
import Chessboard from 'chessboardjsx';
import { Chess } from 'chess.js';
import { Undo2, Menu, X, BarChart2 } from 'lucide-react';

const ICONS = {
  p: { white: '♙', black: '♟' },
  n: { white: '♘', black: '♞' },
  b: { white: '♗', black: '♝' },
  r: { white: '♖', black: '♜' },
  q: { white: '♕', black: '♛' },
  k: { white: '♔', black: '♚' }
};

export default function ChessGame() {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [history, setHistory] = useState([]);
  const [whiteCaptured, setWhiteCaptured] = useState([]);
  const [blackCaptured, setBlackCaptured] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [userColor, setUserColor] = useState('w');
  const [depth, setDepth] = useState(12);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);

  const boardContainerRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(320);
  useEffect(() => {
    const updateSize = () => {
      if (!boardContainerRef.current) return;
      const avail = Math.min(
        boardContainerRef.current.offsetWidth - (window.innerWidth >= 768 ? 180 : 20),
        window.innerHeight - 200
      );
      setBoardWidth(Math.max(280, Math.min(640, avail)));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const resetGame = () => {
    const g = new Chess();
    gameRef.current = g;
    setHistory([]);
    setWhiteCaptured([]);
    setBlackCaptured([]);
    setFen(g.fen());
    setApiResponse(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  };
  useEffect(resetGame, [userColor, depth]);

  const postFen = async f => {
    try {
      const res = await fetch('https://chess-api.com/v1', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen: f, depth })
      });
      const data = await res.json();
      setApiResponse(data);
    } catch (err) { console.error(err); }
  };
  useEffect(() => { if (gameRef.current.turn() !== userColor) postFen(fen); }, [fen, depth, userColor]);

  useEffect(() => {
    if (!apiResponse) return;
    const game = gameRef.current;
    if (game.turn() !== userColor) {
      const { move, san } = apiResponse;
      const mv = game.move({ from: move.slice(0,2), to: move.slice(2,4), promotion: move[4]||'q' });
      if (mv) handleMove('Engine', san, mv);
    }
  }, [apiResponse]);

  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState('');

  const handleMove = (author, san, mv) => {
    setFen(gameRef.current.fen());
    setHistory(h => [...h, `${author}: ${san}`]);
    if (mv.captured) {
      const setter = mv.color==='w' ? setBlackCaptured : setWhiteCaptured;
      setter(arr => [...arr, mv.captured]);
    }
    setSelectedSquare(null);
    setLegalMoves([]);

    // Check game state after move
    const game = gameRef.current;
    if (game.isCheckmate()) {
      setGameOver(true);
      setGameResult(author === 'You' ? 'win' : 'lose');
    } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
      setGameOver(true);
      setGameResult('draw');
    }
  };

  const onSquareClick = square => {
    const game = gameRef.current;
    // If a piece is selected and this square is legal, move!
    if (selectedSquare && legalMoves.includes(square)) {
      const mv = game.move({ from: selectedSquare, to: square, promotion: 'q' });
      if (mv) handleMove('You', mv.san, mv);
      return;
    }
    // Otherwise, toggle highlights
    const piece = game.get(square);
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }
    if (piece && piece.color===userColor && game.turn()===userColor) {
      const moves = game.moves({ square, verbose: true }).map(m=>m.to);
      setSelectedSquare(square);
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const onDragStart = (piece, square) => {
    const game = gameRef.current;
    const p = game.get(square);
    return p && p.color===userColor && game.turn()===userColor;
  };

  const onDrop = ({ sourceSquare, targetSquare }) => {
    if (selectedSquare===sourceSquare && legalMoves.includes(targetSquare)) {
      const mv = gameRef.current.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (mv) handleMove('You', mv.san, mv);
      return true;
    }
    setSelectedSquare(null);
    setLegalMoves([]);
    return false;
  };

  const undoMove = () => {
    const game = gameRef.current;
    if (!history.length) return;
    const pop = () => { const mv=game.undo(); setHistory(h=>h.slice(0,-1)); if(mv?.captured){ const s=mv.color==='w'?setWhiteCaptured:setBlackCaptured; s(a=>a.slice(0,-1)); } };
    pop(); if(history.length>1) pop();
    setFen(game.fen()); setSelectedSquare(null); setLegalMoves([]);
  };

  const moves = history.reduce((acc,lab,i)=>{ if(i%2===0) acc.push({w:lab.replace('You: ',''),b:''}); else acc[Math.floor(i/2)].b=lab.replace('Engine: ',''); return acc; }, []);

  const renderCaptured = (pcs,color)=>(<div className="flex flex-wrap gap-1">{pcs.map((p,i)=><span key={i} className="text-xl">{ICONS[p][color]}</span>)}</div>);

  const squareStyles = {};
  if(selectedSquare) squareStyles[selectedSquare]={boxShadow:'inset 0 0 0 4px rgba(255,215,0,0.8)'};
  legalMoves.forEach(sq=>squareStyles[sq]={background:'radial-gradient(circle, rgba(255,215,0,0.6) 40%, transparent 40%)'});

  const AnalysisBox = ()=>{
    if(!apiResponse) return null;
    const { eval:centi, winChance, continuationArr, mate, depth:d }=apiResponse;
    return(
      <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-opacity-70 backdrop-blur-lg p-4 rounded-2xl shadow-xl mt-6 text-gray-200">
        <div className="flex items-center justify-between"><h3 className="text-lg font-bold">Game Analysis</h3><BarChart2 size={20}/></div>
        <div className="mt-2 space-y-1 text-sm">
          <p><strong>📏 Eval:</strong> {centi} cp</p>
          <p><strong>🎯 Win Chance:</strong> {(1 - winChance).toFixed(2)}%</p>
          <p><strong>🔎 Depth:</strong> {d}</p>
          {mate && <p><strong>🔔 Mate in:</strong> {mate}</p>}
          <div><strong>🚀 Continuation:</strong><ul className="list-disc list-inside ml-4">{continuationArr.map((m,i)=><li key={i}>{m}</li>)}</ul></div>
        </div>
      </div>
    );
  };

  const Panel = ()=>(
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <h3 className="font-semibold mb-2">Settings</h3>
        <select value={userColor} onChange={e=>setUserColor(e.target.value)} className="w-full p-2 border rounded mb-3"><option value="w">White</option><option value="b">Black</option></select>
        <select value={depth} onChange={e=>setDepth(+e.target.value)} className="w-full p-2 border rounded mb-3">{[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(d=><option key={d}>{d}</option>)}</select>
        <button onClick={resetGame} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Reset</button>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow-lg max-h-64 overflow-y-auto">
        <h3 className="font-semibold mb-2">History</h3>
        <table className="w-full text-sm"><thead><tr><th>You</th><th>Engine</th></tr></thead><tbody>{moves.map((m,i)=><tr key={i} className={i%2?'bg-gray-50':''}><td className="px-1 py-0.5">{m.w}</td><td className="px-1 py-0.5">{m.b}</td></tr>)}</tbody></table>
      </div>
      <AnalysisBox />
      <button onClick={undoMove} className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"><Undo2 className="mr-2"/>Undo</button>
    </div>
  );

  return(
    <div ref={boardContainerRef} className="pt-16 sm:pt-24 flex bg-gradient-to-tr from-gray-100 to-gray-200 min-h-screen">
      <button onClick={()=>setShowPanel(!showPanel)} className="fixed top-16 sm:top-20 right-4 sm:right-6 p-2 bg-white shadow-lg rounded-full z-20">{showPanel?<X size={20}/> : <Menu size={20}/>}</button>
      <div className={`${showPanel?'block':'hidden'} md:block w-72 sm:w-80 p-4 sm:p-6 fixed right-0 top-16 sm:top-20 h-full overflow-y-auto bg-white bg-opacity-90 backdrop-blur-md shadow-lg`}><Panel/></div>
      <div className="flex-1 flex flex-col items-center px-2 sm:px-6">
        {gameOver ? (
          <div className="text-xl sm:text-2xl font-bold mb-4 space-y-4">
            <div className={`text-${gameResult === 'win' ? 'green' : gameResult === 'lose' ? 'red' : 'blue'}-600`}>
              {gameResult === 'win' ? 'You Won!' : gameResult === 'lose' ? 'You Lost!' : 'Draw!'}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={resetGame} 
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Play Again
              </button>
              <button 
                onClick={() => window.location.href = '/games'} 
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Back to Menu
              </button>
            </div>
          </div>
        ) : (
          <h2 className="text-xl sm:text-2xl font-bold mb-4">{gameRef.current.turn()==='w'?'White to move':'Black to move'}</h2>
        )}
        <div className="bg-white p-2 sm:p-6 rounded-3xl shadow-2xl">
          <Chessboard width={boardWidth} position={fen} onDrop={onDrop} onDragStart={onDragStart} onSquareClick={onSquareClick} squareStyles={squareStyles}/>
        </div>
        <div className="w-full flex justify-between mt-6 px-10 items-center">
          <div><div className="text-sm mb-1">White Captured</div>{renderCaptured(whiteCaptured,'white')}</div>
          <button onClick={undoMove} className="p-2 bg-white shadow rounded-full"><Undo2 size={20}/></button>
          <div><div className="text-sm mb-1">Black Captured</div>{renderCaptured(blackCaptured,'black')}</div>
        </div>
        <button 
          onClick={() => window.location.href = '/games'}
          className="mt-8 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
}
