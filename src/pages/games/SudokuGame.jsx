import React, { useState, useEffect } from 'react';
import { getSudoku } from 'sudoku-gen';
import classNames from 'classnames';

export default function SudokuGame() {
  const [difficulty, setDifficulty] = useState('easy');
  const [puzzle, setPuzzle]       = useState([]);
  const [solution, setSolution]   = useState([]);
  const [userGrid, setUserGrid]   = useState([]);
  const [draftMode, setDraftMode] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [score, setScore]         = useState(10);
  const [message, setMessage]     = useState('');

  useEffect(() => { startNew(); }, [difficulty]);
  useEffect(() => {
    if (score <= 0) {
      setUserGrid(solution.map(row => row.slice()));
      setScore(0);
      setMessage('😞 You Lose');
    }
  }, [score]);

  function startNew() {
    const { puzzle: p, solution: s } = getSudoku(difficulty);
    const grid = Array.from({ length: 9 }, (_, i) =>
      p.slice(i*9, i*9+9).split('').map(c => c==='-' ? '' : c)
    );
    const sol = Array.from({ length: 9 }, (_, i) =>
      s.slice(i*9, i*9+9).split('')
    );
    setPuzzle(grid);
    setSolution(sol);
    setUserGrid(JSON.parse(JSON.stringify(grid)));
    setScore(10);
    setDraftMode(false);
    setSelected(null);
    setMessage('');
  }

  function handleCellClick(r, c) {
    // Bỏ check prefilled để có thể chọn ô đã có số
    setSelected([r, c]);
  }

  function handleNumberInput(n) {
    if (!selected) return;
    const [r, c] = selected;
    const newGrid = userGrid.map(row => row.slice());

    if (draftMode) {
      const cell = newGrid[r][c];
      if (cell.includes(n)) {
        newGrid[r][c] = cell.replace(n, '');
      } else {
        newGrid[r][c] = (cell + n).split('').sort().join('');
      }
    } else {
      newGrid[r][c] = n;
      if (n !== solution[r][c]) setScore(s => s - 1);
    }

    setUserGrid(newGrid);
    setSelected(null);
    if (!draftMode) checkComplete(newGrid);
  }

  function clearValue() {
    if (!selected) return;
    const [r, c] = selected;

    if (puzzle[r][c] !== '' || userGrid[r][c] === solution[r][c]) return;

    const newGrid = userGrid.map(row => row.slice());
    newGrid[r][c] = '';
    setUserGrid(newGrid);

    if (!draftMode) setScore(s => s - 1);
    setSelected(null);
  }

  function hint() {
    if (!selected) return;
    const [r, c] = selected;
    const newGrid = userGrid.map(row => row.slice());
    newGrid[r][c] = solution[r][c];
    setUserGrid(newGrid);
    setScore(s => s - 2);
    setSelected(null);
    checkComplete(newGrid);
  }

  function surrender() {
    setUserGrid(solution.map(row => row.slice()));
    setScore(0);
    setMessage('😞 You Lose');
  }

  function checkComplete(grid) {
    if (grid.flat().every((v,i) => v === solution.flat()[i])) {
      setMessage('😃 You Win');
    }
  }

  // selected value để highlight all same
  const selectedVal = selected
    ? userGrid[selected[0]][selected[1]]
    : null;

  useEffect(() => {
    function onKeyDown(e) {
      if (!selected) return;
      const key = e.key;

      
      if (/^[1-9]$/.test(key)) {
        e.preventDefault();
        handleNumberInput(key);
      }
      else if (key === 'Backspace' || key === 'Delete') {
        e.preventDefault();
        clearValue();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected, draftMode, handleNumberInput, clearValue]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 pt-28 pb-12 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Sudoku</h1>

      <div className="mb-4 flex flex-wrap justify-center gap-2 sm:gap-3">
        {[{ label: 'Dễ', value: 'easy' },
          { label: 'Vừa', value: 'medium' },
          { label: 'Khó', value: 'hard' },
          { label: 'Chuyên gia', value: 'expert' }].map(level => (
          <button
            key={level.value}
            onClick={() => setDifficulty(level.value)}
            className={classNames(
              'px-4 py-2 rounded-full font-medium transition',
              difficulty === level.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-indigo-100'
            )}
          >{level.label}</button>
        ))}
        <button
          onClick={startNew}
          className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
        >Trò chơi mới</button>
      </div>

      <div className="mb-2 text-lg font-medium text-gray-700">Điểm hiện có: {score}</div>
      <div className="mb-4 flex gap-3">
        <button
          onClick={() => setDraftMode(d => !d)}
          className={classNames(
            'px-5 py-2 rounded-full font-semibold transition',
            draftMode ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-gray-800 hover:bg-yellow-200'
          )}
        >Chế độ nháp</button>
        <button onClick={clearValue} className="px-5 py-2 bg-red-400 text-white rounded-full hover:bg-red-500 transition">Xóa ô</button>
        <button onClick={hint} className="px-5 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition">Gợi ý ô</button>
        <button onClick={surrender} className="px-5 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition">Đầu hàng</button>
      </div>

      <div className="grid grid-cols-9 gap-0.5 bg-white p-1 sm:p-2 rounded-xl shadow-xl">
        {userGrid.map((row, r) =>
          row.map((val, c) => {
            const isPrefilled   = puzzle[r][c] !== '';
            const isSelected    = selected && selected[0]===r && selected[1]===c;

            // highlight block/row/col
            const inSameBlock = selected &&
              Math.floor(r/3)===Math.floor(selected[0]/3) &&
              Math.floor(c/3)===Math.floor(selected[1]/3);
            const inSameRow = selected && r===selected[0];
            const inSameCol = selected && c===selected[1];

            // highlight all cells that have the same value/text as selected
            const isSameValue = selectedVal
              && (
                // pencil-marks mode: any cell whose string includes selectedVal
                (val.length>1 && val.includes(selectedVal))
                // single number mode: exact match
                || (val === selectedVal)
              );

            // build bg class with priority:
            // 1) selected cell
            // 2) same‐value cells
            // 3) related (block/row/col)
            // 4) prefilled
            // 5) empty
            let bgClass;
            if (isSelected)      bgClass = 'bg-indigo-200';
            else if (isSameValue) bgClass = 'bg-yellow-200';
            else if (inSameRow||inSameCol||inSameBlock) bgClass = 'bg-indigo-100';
            else if (isPrefilled) bgClass = 'bg-gray-100';
            else                  bgClass = 'bg-white';

            // wrong‐number styling
            const isSingleNumber = val.length===1;
            const isWrong = !draftMode && isSingleNumber && val!==solution[r][c];

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={classNames(
                  'w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center cursor-pointer select-none border border-gray-400',
                  bgClass,
                  (r%3===2&&r!==8)&&'border-b-2 border-gray-600',
                  (c%3===2&&c!==8)&&'border-r-2 border-gray-600'
                )}
              >
                {val.length > 1 ? (
                  <div className="grid grid-cols-3 w-full h-full text-xs text-gray-500">
                    {Array.from({length:9},(_,i)=>{
                      const num = String(i+1);
                      return (
                        <span
                          key={i}
                          className={classNames(
                            'flex items-center justify-center',
                            !val.includes(num) && 'opacity-0'
                          )}
                        >
                          {num}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className={classNames(
                    'text-lg font-semibold',
                    isWrong
                      ? 'text-red-500'
                      : isPrefilled
                        ? 'text-gray-800'
                        : 'text-indigo-700'
                  )}>
                    {val}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 grid grid-cols-9 gap-0.5 sm:gap-1">
        {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => handleNumberInput(String(n))}
            className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white rounded-lg shadow-md hover:shadow-lg transition font-bold text-base sm:text-lg md:text-xl text-gray-800"
          >{n}</button>
        ))}
      </div>

      {message && (
        <div className="mt-6 space-y-4">
          <div className="text-3xl font-bold text-green-600">{message}</div>
          {message.includes('Lose') && (
            <div className="flex gap-4 justify-center">
              <button 
                onClick={startNew} 
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
          )}
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
