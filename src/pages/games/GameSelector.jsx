import React from 'react';
import { useNavigate } from 'react-router-dom';
import { games } from '../../constants';

// Generic GameCard component
function GameCard({ title, description, icon, gradientFrom, gradientTo, path }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/games${path}`)}
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-105 hover:shadow-2xl"
    >
      <div
        className={`h-40 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} flex items-center justify-center`}
      >
        <span className="text-white text-4xl font-bold">{icon}</span>
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-extrabold mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

// GameSelector uses GameCard
export default function GameSelector() {
  return (
    <div className="pt-24 px-6 w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
      {games.map(game => (
        <GameCard key={game.title} {...game} />
      ))}
    </div>
  );
}
