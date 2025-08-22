import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchMovies, formatDuration, formatSeriesInfo, fetchMovieDetails } from '../api';

const SearchResults = ({ query }) => {
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const fetchResults = async () => {
            try {
                setError(null);
                const data = query.trim()
                    ? await searchMovies(query)
                    : await searchMovies('');
                const processed = await Promise.all(
                    data.slice(0, 8).map(async (item) => {
                        try {
                            const isMovie = item.media_type === 'movie' || !item.media_type;
                            const details = await fetchMovieDetails(item.id, isMovie ? 'movie' : 'tv');
                            const title = item.title || item.name || 'N/A';
                            const runtime = isMovie
                                ? formatDuration(details.runtime)
                                : await formatSeriesInfo(item.id, details.number_of_seasons);
                            return { ...item, title, runtime, mediaType: isMovie ? 'movie' : 'tv' };
                        } catch (err) {
                            console.error(`Error fetching details for item ${item.id}:`, err);
                            return null;
                        }
                    })
                );
                if (mounted) {
                    setResults(processed.filter(item => item !== null));
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
                if (mounted) {
                    setError('Failed to load search results. Please try again.');
                }
            }
        };

        const timeout = setTimeout(fetchResults, 500);
        return () => {
            mounted = false;
            clearTimeout(timeout);
        };
    }, [query]);

    return (
        <section className="search-results category">
            <div className="category-container">
                <h2>{query.trim() ? 'Search Results' : 'Suggestions'}</h2>
            </div>
            <div className="search-grid">
                {error ? (
                    <p style={{ color: '#fff', padding: '10px' }}>{error}</p>
                ) : results.length === 0 && query.trim() ? (
                    <p style={{ color: '#fff', padding: '10px' }}>No results found</p>
                ) : (
                    results.map((item) => (
                        <Link
                            key={item.id}
                            to={`/movie-page/${item.id}/${item.mediaType}`}
                            className="search-card"
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/w92${item.poster_path || '/placeholder.jpg'}`}
                                alt={item.title}
                            />
                            <div className="search-overlay">
                                <h3>{item.title}</h3>
                                <p>{item.runtime}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </section>
    );
};

export default SearchResults;