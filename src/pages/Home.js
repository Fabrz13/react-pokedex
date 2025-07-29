import React from 'react';
import PokemonList from '../components/PokemonList';
import { ThemeContext } from '../App';
import { useContext } from 'react';


const Home = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  
  return (
    <div>
    <h1 className="home-title">Pokédex</h1>
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="theme-toggle"
      >
        {darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
      </button>
      <PokemonList />
    </div>
  );
};

export default Home;