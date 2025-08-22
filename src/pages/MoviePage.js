import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails, fetchCredits, fetchRecommendations, fetchVideos, formatDuration } from '../api';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';

const MoviePage = () => {
    const { id, type } = useParams();
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [detailedRecommendations, setDetailedRecommendations] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const details = await fetchMovieDetails(id, type);
                const credits = await fetchCredits(id, type);
                const recs = await fetchRecommendations(id, type);
                const videoData = await fetchVideos(id, type);

                setMovie(details);
                setCast(credits.slice(0, 10)); // Lấy 10 diễn viên đầu tiên
                setRecommendations(recs.slice(0, 8)); // Lấy 8 đề xuất
                setVideos(videoData); // Lưu danh sách video

                // Fetch chi tiết cho recommendations
                const detailedRecs = await Promise.all(
                    recs.slice(0, 8).map(async (item) => {
                        const details = await fetchMovieDetails(item.id, item.media_type === 'tv' ? 'tv' : 'movie');
                        const runtime = details.runtime
                            ? formatDuration(details.runtime)
                            : details.number_of_seasons
                            ? `${details.number_of_seasons} Seasons`
                            : 'N/A';
                        return { ...item, runtime };
                    })
                );
                setDetailedRecommendations(detailedRecs.filter(item => item.poster_path)); // Loại bỏ item không có poster
            } catch (err) {
                console.error('Error loading movie page data:', err);
                setError('Failed to load movie details. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, type]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!movie) return <div>Movie not found</div>;

    const title = movie.title || movie.name || 'No Title';
    const overview = movie.overview || 'No description available';
    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

    // Lấy trailer đầu tiên (nếu có), ưu tiên type 'Trailer'
    const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube') || videos[0];
    const videoUrl = trailer
        ? `https://www.youtube.com/embed/${trailer.key}`
        : null;

    return (
        <main className="movie-page">
            <div className="movie-header">
                <img src={posterUrl} alt={title} className="movie-poster" />
                <div className="movie-info">
                    <h1>{title}</h1>
                    <p>{overview}</p>
                    <div className="movie-details">
                        <p>Release Date: {movie.release_date || movie.first_air_date || ''}</p>
                        <p>Rating: {movie.vote_average || ''}/10</p>
                        {movie.runtime && <p>Runtime: {formatDuration(movie.runtime)}</p>}
                        {movie.number_of_seasons && <p>Seasons: {movie.number_of_seasons}</p>}
                    </div>
                </div>
            </div>

            {videoUrl && (
                <section className="video-section">
                    <h2>Trailer</h2>
                    <div className="video-container">
                        <iframe
                            src={videoUrl}
                            title={`${title} Trailer`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </section>
            )}

            {cast.length > 0 && (
                <section className="cast-section">
                    <h2>Cast</h2>
                    <div className="cast-grid">
                        {cast.map((actor) => (
                            <Link to={`/actor-page/${actor.id}`} key={actor.id} className="cast-card">
                                <img
                                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path || '/placeholder.jpg'}`}
                                    alt={actor.name}
                                    className="cast-image"
                                />
                                <p>{actor.name}</p>
                                <p>{actor.character || 'Unknown Role'}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {detailedRecommendations.length > 0 && (
                <section className="recommendations-section">
                    <h2>Recommended Movies</h2>
                    <div className="recommendations-grid">
                        {detailedRecommendations.map((item) => (
                            <MovieCard
                                key={item.id}
                                item={item}
                                isMovie={type === 'movie'}
                                runtime={item.runtime} // Sử dụng runtime đã tính toán
                            />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
};

export default MoviePage;