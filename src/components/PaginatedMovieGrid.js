import React, { useState, useEffect } from 'react';
import { API_KEY, fetchMovies, fetchMovieDetails, formatDuration, formatSeriesInfo } from '../api';
import { Link } from 'react-router-dom';

const PaginatedMovieGrid = ({ endpoint, isSeries = false }) => {
    const [items, setItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const moviesPerPage = 20; // 5 rows * 4 movies per row
    const rowsPerPage = 5;
    const moviesPerRow = 4;

    useEffect(() => {
        const loadItems = async () => {
            try {
                console.log('Fetching items for endpoint:', endpoint);
                let fetchedItems = [];
                if (isSeries === null && endpoint.includes('with_origin_country')) {
                    // Fetch both movie and series for the country
                    const countryCode = endpoint.match(/with_origin_country=([a-zA-Z]{2})/)?.[1] || '';
                    if (!countryCode) {
                        console.warn('No country code found in endpoint:', endpoint);
                        return;
                    }
                    const movieEndpoint = `discover/movie?with_origin_country=${countryCode}&api_key=${API_KEY}`;
                    const tvEndpoint = `discover/tv?with_origin_country=${countryCode}&api_key=${API_KEY}`;
                    const [movieData, tvData] = await Promise.all([
                        fetchMovies(movieEndpoint),
                        fetchMovies(tvEndpoint),
                    ]);
                    fetchedItems = [...(movieData || []), ...(tvData || [])];
                } else {
                    const data = await fetchMovies(endpoint);
                    fetchedItems = data || [];
                }
                console.log('Fetched data:', fetchedItems);
                if (!fetchedItems.length) {
                    console.warn('No data returned from API for endpoint:', endpoint);
                    setItems([]); // Set empty array to trigger "No content available" message
                    return;
                }
                const processed = await Promise.all(
                    fetchedItems.map(async (item) => {
                        const details = await fetchMovieDetails(item.id, item.media_type === 'tv' ? 'tv' : 'movie');
                        const title = item.media_type === 'tv' ? (details.name || 'N/A') : (details.title || 'N/A');
                        const runtime = item.media_type === 'tv'
                            ? await formatSeriesInfo(item.id, details.number_of_seasons)
                            : (details.runtime ? formatDuration(details.runtime) : 'N/A');
                        return { ...item, title, runtime };
                    })
                );
                console.log('Processed items:', processed);
                setItems(processed.filter(item => item.title !== 'N/A')); // Filter out items without title
            } catch (error) {
                console.error('Error loading items:', error);
                setItems([]); // Set empty on error
            }
        };
        loadItems();
    }, [endpoint, isSeries]);

    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    const totalPages = Math.ceil(items.length / moviesPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const goToPrevious = () => paginate(currentPage - 1);
    const goToNext = () => paginate(currentPage + 1);

    return (
        <section className="paginated-movie-grid">
            <div className="movie-grid-container">
                {items.length === 0 && <p>No content available.</p>}
                {items.map((item, index) => {
                    const page = Math.floor(index / moviesPerPage) + 1;
                    const isActive = page === currentPage;
                    return (
                        <Link
                            key={item.id}
                            to={`/movie-page/${item.id}/${item.media_type === 'tv' ? 'tv' : 'movie'}`}
                            className={`movie-card ${isActive ? 'active' : ''}`}
                            style={{ display: isActive ? 'block' : 'none' }}
                        >
                            <img
                                src={`https://image.tmdb.org/t/p/original${item.poster_path || '/placeholder.jpg'}`}
                                alt={item.title}
                                onError={(e) => console.error('Image load error for:', item.title)}
                            />
                            <div className="movie-overlay">
                                <h3>{item.title}</h3>
                                <p>{item.runtime || 'N/A'}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
            <div className="pagination">
                <button onClick={goToPrevious} disabled={currentPage === 1}>
                    Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={currentPage === i + 1 ? 'active' : ''}
                    >
                        {i + 1}
                    </button>
                ))}
                <button onClick={goToNext} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </section>
    );
};

export default PaginatedMovieGrid;