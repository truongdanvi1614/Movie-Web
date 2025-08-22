import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchActorDetails, fetchActorCredits, formatDuration } from "../api";
import MovieCard from '../components/MovieCard';

const ActorPage = () => {
    const { id } = useParams();
    const [actor, setActor] = useState(null);
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const details = await fetchActorDetails(id);
                const creditsData = await fetchActorCredits(id);
                setActor(details);
                setCredits(creditsData.slice(0, 12)); // Lấy 12 phim/series đầu tiên
            } catch (err) {
                console.error('Error loading actor data:', err);
                setError('Failed to load actor details. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!actor) return <div>Actor not found</div>;

    const profileUrl = actor.profile_path
        ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
        : 'https://via.placeholder.com/500x750?text=No+Profile';

    return (
        <main className="actor-page">
            <div className="actor-header">
                <img src={profileUrl} alt={actor.name} className="actor-profile" />
                <div className="actor-info">
                    <h1>{actor.name}</h1>
                    <p>Born: {actor.birthday || 'N/A'}</p>
                    <p>Place of Birth: {actor.place_of_birth || 'N/A'}</p>
                    <p>Biography: {actor.biography || 'No biography available.'}</p>
                </div>
            </div>
            {credits.length > 0 && (
                <section className="actor-credits">
                    <h2>Known For</h2>
                    <div className="credits-grid">
                        {credits.map((item) => (
                            <MovieCard
                                key={item.id}
                                item={item}
                                isMovie={item.media_type === 'movie'}
                                runtime={item.media_type === 'movie' ? formatDuration(item.runtime) : `${item.number_of_seasons} Seasons`}
                            />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
};

export default ActorPage;