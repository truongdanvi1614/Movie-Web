import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ViewAll from './pages/ViewAll';
import MoviePage from './pages/MoviePage';
import Header from './components/Header';
import ActorPage from './components/ActorPage';
import './styles/style.css'; // Combined main styles
import './styles/movie-style.css'; // Movie page styles



function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view-all" element={<ViewAll />} />
        <Route path="/movie-page/:id/:type" element={<MoviePage />} />
        <Route path="/actor-page/:id" element={<ActorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
