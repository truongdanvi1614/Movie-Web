import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ item, isMovie = true, runtime }) => {
    const title = item.title || item.name || 'N/A';
    const mediaType = isMovie ? 'movie' : 'tv';

    console.log('Rendering MovieCard:', { id: item.id, title, poster_path: item.poster_path });

    return (
        <Link to={`/movie-page/${item.id}/${mediaType}`} className="movie-card">
            <img
                src={`https://image.tmdb.org/t/p/original${item.poster_path || '/placeholder.jpg'}`}
                alt={title}
                onError={(e) => console.error('Image load error for:', title)}
            />
            <div className="overlay">
                <h3>{title}</h3>
                <p>{runtime}</p>
            </div>
        </Link>
    );
};

export default MovieCard;