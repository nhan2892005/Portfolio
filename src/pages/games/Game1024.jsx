import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import Confetti from 'react-confetti';
import classNames from 'classnames';

// Utils to initialize and move the grid
function createEmptyGrid() {
  return Array(4).fill().map(() => Array(4).fill(0));
}

function addRandomTile(grid) {
  const empty = [];
  grid.forEach((row, r) => row.forEach((v, c) => v === 0 && empty.push([r, c])));
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return grid;
}

function cloneGrid(grid) {
  return grid.map(row => row.slice());
}

function slideAndCombine(row) {
  const arr = row.filter(v => v !== 0);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      arr[i + 1] = 0;
    }
  }
  const newRow = arr.filter(v => v !== 0);
  while (newRow.length < 4) newRow.push(0);
  return newRow;
}

function moveGrid(grid, direction) {
  let moved = false;
  let newGrid = cloneGrid(grid);
  if (direction === 'left' || direction === 'right') {
    newGrid = newGrid.map(row => {
      const r = direction === 'right' ? row.reverse() : row;
      const res = slideAndCombine(r);
      const final = direction === 'right' ? res.reverse() : res;
      if (!moved && final.some((v,i) => v !== row[i])) moved = true;
      return final;
    });
  } else {
    // up/down: transpose
    const trans = [0,1,2,3].map(c => newGrid.map(r => r[c]));
    const movedCols = trans.map(col => {
      const c = direction === 'down' ? col.reverse() : col;
      const res = slideAndCombine(c);
      return direction === 'down' ? res.reverse() : res;
    });
    newGrid = newGrid.map((row, r) => movedCols.map(col => col[r]));
    if (!moved) {
      moved = !newGrid.flat().every((v,i) => grid.flat()[i] === v);
    }
  }
  return moved ? addRandomTile(newGrid) : grid;
}

function isGameOver(grid) {
  if (grid.some(row => row.includes(0))) return false;
  for (let r=0; r<4; r++) for (let c=0; c<4; c++) {
    const v = grid[r][c];
    if ((r<3 && grid[r+1][c]===v) || (c<3 && grid[r][c+1]===v)) return false;
  }
  return true;
}

export default function Game1024() {
  const [grid, setGrid]   = useState(() => addRandomTile(addRandomTile(createEmptyGrid())));
  const [moves, setMoves] = useState(0);
  const [over, setOver]   = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [energy, setEnergy] = useState(0);

  const maxEnergy = 10000; // threshold for energy bar
  const thresholds = [101,201,401,501,601,801,1001];

  const handleMove = useCallback(dir => {
    if (over) return;
    setGrid(g => {
      const newG = moveGrid(g, dir);
      if (newG !== g) {
        // moves count
        setMoves(m => m+1);
        // energy increment
        setEnergy(e => {
          const ne = e + 1;
          if (ne >= maxEnergy) {
            // release and reset map, keep moves
            setGrid(addRandomTile(addRandomTile(createEmptyGrid())));
            return 0;
          }
          return ne;
        });
        // confetti on move milestones
        setMoves(m2 => {
          const nm = m2;
          if (thresholds.includes(nm)) {
            setConfetti(true);
            setTimeout(() => setConfetti(false), 3000);
          }
          return nm;
        });
      }
      if (isGameOver(newG)) setOver(true);
      return newG;
    });
  }, [over]);

  // keyboard
  useEffect(() => {
    const listener = e => {
      switch (e.key) {
        case 'ArrowUp':    handleMove('up'); break;
        case 'ArrowDown':  handleMove('down'); break;
        case 'ArrowLeft':  handleMove('left'); break;
        case 'ArrowRight': handleMove('right'); break;
        default: return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleMove]);

  // Score display
  const score = moves/2 + 0.5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center pt-16 sm:pt-24 px-2 sm:px-4">
      {confetti && <Confetti />}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">1024 Game</h1>
      <div className="w-full max-w-md mb-4 px-2">
        <div className="h-4 bg-gray-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400"
            style={{ width: `${(energy / maxEnergy) * 100}%` }}
          />
        </div>
        <div className="text-right text-sm mt-1">Energy: {energy} / {maxEnergy}</div>
      </div>
      <div className="text-lg mb-2">Score: {score.toFixed(1)}</div>
      <div className="grid grid-cols-4 gap-2 bg-white p-4 rounded-xl shadow-xl">
        {grid.flat().map((v,i) => (
          <div key={i} className={classNames(
            'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center text-base sm:text-lg md:text-xl font-bold rounded',
            v===0 ? 'bg-gray-200' : 'bg-purple-300'
          )}>{v||''}</div>
        ))}
      </div>
      <div className="mt-4 flex gap-4">
        {['up','left','down','right'].map(dir => (
          <button key={dir} onClick={() => handleMove(dir)} className="p-3 bg-white rounded-full shadow hover:bg-gray-100 transition">
            {dir==='up' && <ArrowUp />} {dir==='down' && <ArrowDown />} {dir==='left' && <ArrowLeft />} {dir==='right' && <ArrowRight />}
          </button>
        ))}
      </div>
      {over && (
        <div className="mt-4 space-y-4">
          <div className="text-2xl font-semibold text-red-600">
            Bạn đã hoàn thành với số điểm {score.toFixed(1)}
          </div>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Chơi lại
            </button>
            <button 
              onClick={() => window.location.href = '/games'} 
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Quay về menu
            </button>
          </div>
        </div>
      )}
      <button 
        onClick={() => window.location.href = '/games'}
        className="mt-8 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
      >
        ← Quay về menu
      </button>
    </div>
  );
}