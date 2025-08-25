"use client"

import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { fetchMovieDetails, formatDuration } from "../api"

const MovieCard = ({ item, isMovie = true, runtime }) => {
    const [movieDetails, setMovieDetails] = useState(null)
    const [isHovered, setIsHovered] = useState(false)

    const title = item.title || item.name || "N/A"
    const mediaType = isMovie ? "movie" : "tv"

    const releaseYear = item.release_date
        ? new Date(item.release_date).getFullYear()
        : item.first_air_date
        ? new Date(item.first_air_date).getFullYear()
        : "N/A"
    const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A"
    const genres = item.genre_ids ? item.genre_ids.slice(0, 4) : []

    useEffect(() => {
        if (isHovered && !movieDetails) {
        const loadDetails = async () => {
            try {
            const details = await fetchMovieDetails(item.id, mediaType)
            setMovieDetails(details)
            } catch (error) {
            console.error("Error fetching movie details:", error)
            }
        }
        loadDetails()
        }
    }, [isHovered, item.id, mediaType, movieDetails])

    // Genre mapping (basic common genres)
    const genreMap = {
        28: "Action",
        35: "Comedy",
        18: "Drama",
        27: "Horror",
        10749: "Romance",
        878: "Sci-Fi",
        53: "Thriller",
        16: "Animation",
        80: "Crime",
        14: "Fantasy",
        36: "History",
        10402: "Music",
        9648: "Mystery",
        10751: "Family",
        10752: "War",
        37: "Western",
    }

    const getAgeRating = () => {
        if (!movieDetails) return "N/A"

        // For movies, use release_dates certification
        if (isMovie && movieDetails.release_dates?.results) {
        const usRating = movieDetails.release_dates.results.find((r) => r.iso_3166_1 === "US")
        if (usRating?.release_dates?.[0]?.certification) {
            return usRating.release_dates[0].certification
        }
        }

        // For TV shows, use content_ratings
        if (!isMovie && movieDetails.content_ratings?.results) {
        const usRating = movieDetails.content_ratings.results.find((r) => r.iso_3166_1 === "US")
        if (usRating?.rating) {
            return usRating.rating
        }
        }

        // Fallback based on vote_average
        const vote = item.vote_average || 0
        if (vote >= 8) return "PG"
        if (vote >= 6) return "PG-13"
        return "R"
    }

    const getMediaInfo = () => {
        if (!movieDetails) return "Loading..."

        if (isMovie) {
        return movieDetails.runtime ? formatDuration(movieDetails.runtime) : "N/A"
        } else {
        const seasons = movieDetails.number_of_seasons || 1
        const episodes = movieDetails.number_of_episodes || 0
        return `S${seasons} • ${episodes} Episodes`
        }
    }

    console.log("Rendering MovieCard:", { id: item.id, title, poster_path: item.poster_path })

    return (
        <div
        className={`movie-card ${isHovered ? "elevated" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >
        <Link to={`/movie-page/${item.id}/${mediaType}`}>
            <img
            src={`https://image.tmdb.org/t/p/original${item.poster_path || "/placeholder.jpg"}`}
            alt={title}
            onError={(e) => console.error("Image load error for:", title)}
            />

            <div className="overlay">
            <h3>{title}</h3>
            <p>{runtime}</p>
            </div>

            <div className="hover-overlay">
            <div className="hover-content">
                
                {/* Movie title */}
                <h2 className="hover-title">{title}</h2>

                {/* Action buttons */}
                <div className="action-buttons">
                <button className="btn-watch-now">
                    <span>▶</span> Watch Now
                </button>
                <button className="btn-like">
                    <span>♡</span> Like
                </button>
                <button className="btn-details">
                    <span>ⓘ</span> Details
                </button>
                </div>

                <div className="movie-metadata">
                <span className="age-rating">{getAgeRating()}</span>
                <span className="year">{releaseYear}</span>
                <span className="media-info">{getMediaInfo()}</span>
                </div>

                {/* Genres */}
                <div className="hover-genres">
                {genres.map((genreId) => (
                    <span key={genreId} className="genre-tag">
                    {genreMap[genreId] || ""}
                    </span>
                ))}
                </div>
            </div>
            </div>
        </Link>
        </div>
    )
}

export default MovieCard
