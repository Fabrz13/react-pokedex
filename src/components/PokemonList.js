import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FavoritesContext, ThemeContext } from '../App';
import '../styles/PokemonList.css';
import { motion } from 'framer-motion';

const PokemonList = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [typesList, setTypesList] = useState([]);
  const [visiblePokemon, setVisiblePokemon] = useState(50);
  const { favorites, toggleFavorite } = useContext(FavoritesContext);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const cachedData = localStorage.getItem('pokemonList');
    const cachedTypes = localStorage.getItem('pokemonTypes');
    
    if (cachedData) {
      setPokemonList(JSON.parse(cachedData));
      setLoading(false);
    } else {
      fetchPokemon();
    }

    if (cachedTypes) {
      setTypesList(JSON.parse(cachedTypes));
    } else {
      fetchTypes();
    }

    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 100) {
        setVisiblePokemon(prev => Math.min(prev + 20, 151));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPokemon = async () => {
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151');
      const detailedPokemon = await Promise.all(
        response.data.results.map(async (pokemon, index) => {
          const details = await axios.get(pokemon.url);
          return {
            ...pokemon,
            id: index + 1,
            types: details.data.types.map(t => t.type.name)
          };
        })
      );
      setPokemonList(detailedPokemon);
      localStorage.setItem('pokemonList', JSON.stringify(detailedPokemon));
      setLoading(false);
      preloadImages(detailedPokemon.map(p => p.id));
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/type');
      const types = response.data.results.map(t => t.name);
      setTypesList(types);
      localStorage.setItem('pokemonTypes', JSON.stringify(types));
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const preloadImages = (ids) => {
    ids.forEach(id => {
      const img = new Image();
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    });
  };

  const filteredPokemon = pokemonList
    .filter(pokemon => 
      pokemon.name.includes(searchTerm.toLowerCase()) || 
      pokemon.id.toString().includes(searchTerm)
    )
    .filter(pokemon => 
      selectedType === 'all' || pokemon.types.includes(selectedType)
    )
    .slice(0, visiblePokemon);

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className={`pokedex-container ${darkMode ? 'dark' : ''}`}>
      <div className="controls">
        <input 
          type="text" 
          placeholder="Buscar Pokémon por nombre o número..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <select 
          onChange={(e) => setSelectedType(e.target.value)} 
          className="type-filter"
        >
          <option value="all">Todos los tipos</option>
          {typesList.map(type => (
            <option key={type} value={type}>
              {typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="pokemon-grid">
        {filteredPokemon.map((pokemon) => (
        <motion.div
          key={pokemon.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="pokemon-card">
            <button 
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(pokemon.id);
              }}
              className={`favorite-btn ${favorites.includes(pokemon.id) ? 'favorited' : ''}`}
            >
              {favorites.includes(pokemon.id) ? '★' : '☆'}
            </button>
            <Link to={`/pokemon/${pokemon.id}`} className="pokemon-link">
              <div className="pokemon-number">#{pokemon.id.toString().padStart(3, '0')}</div>
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} 
                alt={pokemon.name} 
                loading="lazy"
              />
              <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
            <div className="pokemon-types">
                {pokemon.types.map(type => (
                <div key={type} className="type-container">
                    <span className={`type-pill ${type}`}>
                    {typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                </div>
                ))}
            </div>
            </Link>
          </div>
        </motion.div>
      ))}
      </div>
    </div>
  );

};

const typeNames = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  electric: "Eléctrico",
  grass: "Planta",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada"
};

export default PokemonList;