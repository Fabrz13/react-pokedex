import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, createContext } from 'react';
import Home from './pages/Home';
import PokemonPage from './pages/PokemonPage';
import './App.css';

export const FavoritesContext = createContext();
export const ThemeContext = createContext();

function App() {
  const [favorites, setFavorites] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(pokeId => pokeId !== id) : [...prev, id]
    );
  };

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
        <div className={`app ${darkMode ? 'dark' : 'light'}`}>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pokemon/:id" element={<PokemonPage />} />
            </Routes>
          </Router>
        </div>
      </FavoritesContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;