import React, { useState, useEffect } from 'react';
import { getSudoku } from 'sudoku-gen';
import classNames from 'classnames';

export default function SudokuGame() {
  const [difficulty, setDifficulty] = useState('easy');
  const [puzzle, setPuzzle] = useState([]);
  const [solution, setSolution] = useState([]);
  const [userGrid, setUserGrid] = useState([]);
  const [draftMode, setDraftMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(10);
  const [message, setMessage] = useState('');

  useEffect(() => {
    startNew();
  }, [difficulty]);

  function startNew() {
    const { puzzle: p, solution: s } = getSudoku(difficulty);
    const grid = Array.from({ length: 9 }, (_, i) =>
      p.slice(i * 9, i * 9 + 9).split('').map(c => (c === '-' ? '' : c))
    );
    const sol = Array.from({ length: 9 }, (_, i) => s.slice(i * 9, i * 9 + 9).split(''));
    setPuzzle(grid);
    setSolution(sol);
    setUserGrid(JSON.parse(JSON.stringify(grid)));
    setScore(10);
    setDraftMode(false);
    setSelected(null);
    setMessage('');
  }

  function handleCellClick(r, c) {
    if (puzzle[r][c] !== '') return;
    setSelected([r, c]);
  }

  function handleNumberInput(n) {
    if (!selected) return;
    const [r, c] = selected;
    const newGrid = userGrid.map(row => row.slice());
    if (draftMode) {
      newGrid[r][c] = newGrid[r][c] + n;
    } else {
      newGrid[r][c] = n;
      if (n !== solution[r][c]) setScore(s => s - 1);
    }
    setUserGrid(newGrid);
    setSelected(null);
    checkComplete(newGrid);
  }

  function clearValue() {
    if (!selected) return;
    const [r, c] = selected;
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
    if (grid.flat().every((v, i) => v === solution.flat()[i])) setMessage('😃 You Win');
  }

  // Compute selected block for highlighting
  const selectedBlock = selected ? [Math.floor(selected[0] / 3), Math.floor(selected[1] / 3)] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 pt-28 pb-12 px-4 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Sudoku</h1>

      <div className="mb-4 flex flex-wrap justify-center gap-3">
        {['Dễ', 'Vừa', 'Khó', 'Chuyên Gia'].map(level => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={classNames(
              'px-4 py-2 rounded-full font-medium transition',
              difficulty === level ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-indigo-100'
            )}
          >{level}</button>
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

      <div className="grid grid-cols-9 gap-0.5 bg-white p-2 rounded-xl shadow-xl">
        {userGrid.map((row, r) => row.map((val, c) => {
          const isPrefilled = puzzle[r][c] !== '';
          const isSelected = selected && selected[0] === r && selected[1] === c;
          const inSameBlock = selectedBlock &&
            Math.floor(r / 3) === selectedBlock[0] &&
            Math.floor(c / 3) === selectedBlock[1];

          return (
            <div
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className={classNames(
                'w-14 h-14 flex items-center justify-center text-lg font-semibold cursor-pointer select-none',
                'border border-gray-400',
                isPrefilled ? 'bg-gray-100 text-gray-800' : 'bg-white text-indigo-700',
                inSameBlock && !isSelected && 'bg-indigo-50',
                isSelected && 'bg-indigo-200',
                (r % 3 === 2 && r !== 8) && 'border-b-2 border-gray-600',
                (c % 3 === 2 && c !== 8) && 'border-r-2 border-gray-600'
              )}
            >{val}</div>
          );
        }))}
      </div>

      <div className="mt-6 grid grid-cols-9 gap-1">
        {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => handleNumberInput(String(n))}
            className="w-14 h-14 bg-white rounded-lg shadow-md hover:shadow-lg transition font-bold text-xl text-gray-800"
          >{n}</button>
        ))}
      </div>

      {message && (
        <div className="mt-6 text-3xl font-bold text-green-600">{message}</div>
      )}
    </div>
  );
}
