import React from 'react';
import Hero from '../components/Hero';
import MovieGrid from '../components/MovieGrid';

const Home = () => {
    return (
        <main>
            <Hero />
            <MovieGrid endpoint="movie/now_playing" title="Recently Updated" />
            <MovieGrid endpoint="trending/movie/week" title="Trending" />
            <MovieGrid endpoint="movie/upcoming" title="New Release - Movies" />
            <MovieGrid endpoint="tv/on_the_air" title="New Release - Series" isSeries />
            <div className="recommended-section">
                <div className="recommend-buttons">
                    <button className="recommend-btn active" data-type="movies">Movies</button>
                    <button className="recommend-btn" data-type="series">Series</button>
                    <button className="recommend-btn" data-type="animation">Animation</button>
                </div>
                <MovieGrid endpoint="movie/top_rated" title="Recommended" />
                
            </div>
        </main>
    );
};

export default Home;