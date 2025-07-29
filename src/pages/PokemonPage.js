import React from 'react';
import { useParams } from 'react-router-dom';
import PokemonDetail from '../components/PokemonDetail';
import { ThemeContext } from '../App';
import { useContext } from 'react';

const PokemonPage = () => {
  const { id } = useParams();
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <div>
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="theme-toggle"
      >
        {darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
      </button>
      <PokemonDetail />
    </div>
  );
};

export default PokemonPage;