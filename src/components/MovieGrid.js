// src/components/MovieGrid.js
import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import { fetchMovies, fetchMovieDetails, formatDuration, formatSeriesInfo } from '../api';

const MovieGrid = ({ endpoint, title, isSeries = false, limit = 10 }) => {
    const [items, setItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const visibleItems = 4;

    useEffect(() => {
        const loadItems = async () => {
        try {
            console.log('Fetching movies for endpoint:', endpoint); // Debug log
            const data = await fetchMovies(endpoint);
            console.log('Fetched data:', data); // Debug response
            const processed = await Promise.all(
            data.slice(0, limit).map(async (item) => {
                const details = await fetchMovieDetails(item.id, isSeries ? 'tv' : 'movie');
                const runtime = isSeries
                ? await formatSeriesInfo(item.id, details.number_of_seasons)
                : formatDuration(details.runtime);
                return { ...item, runtime };
            })
            );
            setItems(processed);
        } catch (error) {
            console.error('Error loading items:', error);
        }
        };
        loadItems();
    }, [endpoint, isSeries, limit]);
    if (!items.length) return <p>No movies available for {title}.</p>;

    const visibleItemsArray = items.slice(currentIndex * visibleItems, (currentIndex + 1) * visibleItems);

    return (
    <section className="category">
        <div className="category-container">
            <h2>{title}</h2>
            <a href={`/view-all?category=${endpoint.replace(/\//g, '_')}`} className="view-all">View all</a>
        </div>
        <div className="movie-grid-container">
            <div className="movie-grid">
                {items.map((item) => (
                    <MovieCard key={item.id} item={item} isMovie={!isSeries} runtime={item.runtime} />
                ))}
            </div>
        </div>
    </section>
);
};

export default MovieGrid;