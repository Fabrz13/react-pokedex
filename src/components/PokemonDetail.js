
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FavoritesContext, ThemeContext } from '../App';
import '../styles/PokemonDetail.css';

const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutions, setEvolutions] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite } = useContext(FavoritesContext);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        
        setPokemon(pokemonResponse.data);
        setSpecies(speciesResponse.data);
        
        // Obtener debilidades
        const damageRelations = await Promise.all(
          pokemonResponse.data.types.map(type => 
            axios.get(type.type.url).then(res => res.data.damage_relations)
          )
        );
        
        // Combinar debilidades de todos los tipos
        const allWeaknesses = damageRelations.flatMap(relation => 
          relation.double_damage_from.map(weakness => weakness.name)
        );
        
        // Eliminar duplicados y contar ocurrencias
        const weaknessCounts = allWeaknesses.reduce((acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        
        // Ordenar por frecuencia (4x primero, luego 2x)
        setWeaknesses(
          Object.entries(weaknessCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([type, multiplier]) => ({
              type,
              multiplier: multiplier === 2 ? '2x' : '4x'
            }))
        );
        
        // Obtener evoluciones
        const evolutionChain = await axios.get(speciesResponse.data.evolution_chain.url);
        processEvolutionChain(evolutionChain.data.chain);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Pokémon details:', error);
      }
    };

    const processEvolutionChain = (chain) => {
      const evolutions = [];
      let current = chain;
      
      while (current) {
        const id = current.species.url.split('/').slice(-2, -1)[0];
        evolutions.push({
          id: parseInt(id),
          name: current.species.name,
          trigger: current.evolution_details[0]?.trigger?.name || 'level-up'
        });
        current = current.evolves_to[0];
      }
      
      setEvolutions(evolutions);
    };

    fetchPokemonData();
  }, [id]);

    const handlePrevious = () => {
    if (id > 1) {
      navigate(`/pokemon/${parseInt(id) - 1}`);
    }
  };

  const handleNext = () => {
    if (id < 151) {
      navigate(`/pokemon/${parseInt(id) + 1}`);
    }
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );

  const spanishEntry = species.flavor_text_entries.find(
    entry => entry.language.name === 'es'
  );

  const statsData = {
    labels: pokemon.stats.map(stat => stat.stat.name.replace('-', ' ')),
    datasets: [{
      data: pokemon.stats.map(stat => stat.base_stat),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      pointBorderColor: '#fff',
    }]
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`pokemon-detail-container ${darkMode ? 'dark' : ''}`}
    >
    <div className="pokedex-header">
        <Link to="/" className="pokedex-link">Pokédex</Link>
      </div>

      <div className="navigation-buttons">
        <button 
          onClick={handlePrevious}
          disabled={id <= 1}
          className="nav-button prev-button"
        >
          &lt; Anterior
        </button>
      <div className="header-section">
        <div className="pokemon-number">#{id.toString().padStart(3, '0')}</div>
        <button 
          onClick={() => toggleFavorite(parseInt(id))}
          className={`favorite-btn ${favorites.includes(parseInt(id)) ? 'favorited' : ''}`}
        >
          {favorites.includes(parseInt(id)) ? '★ Favorito' : '☆ Añadir a favoritos'}
        </button>
      </div>
        <button 
          onClick={handleNext}
          disabled={id >= 151}
          className="nav-button next-button"
        >
          Siguiente &gt;
        </button>
      </div>
      
      <h1>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h1>
      
      <div className="pokemon-image">
        <img 
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`} 
          alt={pokemon.name} 
        />
      </div>
      
        <div className="pokemon-info">
        <div className="pokemon-types">
        {pokemon.types.map(type => (
            <div key={type.slot} className="type-container">
            <span className={`type-pill large ${type.type.name}`}>
                {typeNames[type.type.name] || type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}
            </span>
            </div>
        ))}
        </div>
        
        <div className="pokemon-description">
          <p>{spanishEntry ? spanishEntry.flavor_text.replace(/\f/g, ' ') : 'Descripción no disponible'}</p>
        </div>
        
        <div className="weaknesses-section">
        <h3>Debilidades</h3>
        {weaknesses.length > 0 ? (
            <div className="weaknesses-list">
            {weaknesses.map((weakness, index) => (
                <div key={index} className="weakness-item">
                <div className="type-container">
                    <span className={`type-pill ${weakness.type}`}>
                    {typeNames[weakness.type] || weakness.type.charAt(0).toUpperCase() + weakness.type.slice(1)}
                    </span>
                </div>
                <span className="weakness-multiplier">{weakness.multiplier}</span>
                </div>
            ))}
            </div>
        ) : (
            <p>No tiene debilidades</p>
        )}
        </div>
        
        <div className="stats-section">
          <div className="pokemon-stats">
            <h3>Estadísticas</h3>
            {pokemon.stats.map(stat => (
              <div key={stat.stat.name} className="stat-row">
                <span className="stat-name">
                  {stat.stat.name.replace('-', ' ').toUpperCase()}:
                </span>
                <span className="stat-value">{stat.base_stat}</span>
                <div className="stat-bar">
                  <div 
                    className="stat-bar-fill" 
                    style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
        
        {evolutions.length > 1 && (
          <div className="evolution-chain">
            <h3>Cadena evolutiva</h3>
            <div className="evolutions">
              {evolutions.map(evo => (
                <Link to={`/pokemon/${evo.id}`} key={evo.id} className="evolution-item">
                  <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`} 
                    alt={evo.name} 
                  />
                  <span>{evo.name.charAt(0).toUpperCase() + evo.name.slice(1)}</span>
                  {evo.trigger && (
                    <span className="evolution-trigger">
                      ({evo.trigger.replace('-', ' ')})
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
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

export default PokemonDetail;