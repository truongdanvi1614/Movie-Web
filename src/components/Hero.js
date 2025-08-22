import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { fetchMovies, fetchMovieDetails } from "../api"

const Hero = () => {
  const [movies, setMovies] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentMovieDetails, setCurrentMovieDetails] = useState(null)
  const heroRef = useRef(null)
  const totalMovies = 6

  useEffect(() => {
    const loadHeroMovies = async () => {
      try {
        const trending = await fetchMovies("trending/movie/week")
        const validMovies = trending.filter((movie) => movie.backdrop_path).slice(0, totalMovies)
        setMovies(validMovies.length >= totalMovies ? validMovies : trending.slice(0, totalMovies))
      } catch (error) {
        console.error("Error fetching hero movies:", error)
        setMovies([])
      }
    }
    loadHeroMovies()

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalMovies)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (movies.length > 0 && movies[currentIndex]) {
        try {
          const details = await fetchMovieDetails(movies[currentIndex].id, "movie")
          setCurrentMovieDetails(details)
        } catch (error) {
          console.error("Error fetching movie details:", error)
          setCurrentMovieDetails(null)
        }
      }
    }
    loadMovieDetails()
  }, [currentIndex, movies])

  const handleClick = (e) => {
    if (!heroRef.current) return
    const heroRect = heroRef.current.getBoundingClientRect()
    const clickX = e.clientX - heroRect.left
    const heroWidth = heroRect.width
    const clickThreshold = heroWidth / 3

    if (e.target.classList.contains("dot")) {
      const newIndex = Array.from(document.querySelectorAll(".movie-nav .dot")).indexOf(e.target)
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalMovies) {
        setCurrentIndex(newIndex)
      }
    } else if (clickX < clickThreshold) {
      setCurrentIndex((prev) => (prev - 1 + totalMovies) % totalMovies)
    } else if (clickX > heroWidth - clickThreshold) {
      setCurrentIndex((prev) => (prev + 1) % totalMovies)
    }
  }

  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`
  }

  const getGenres = (genreIds) => {
    const genreMap = {
      28: "Action",
      12: "Adventure",
      16: "Animation",
      35: "Comedy",
      80: "Crime",
      99: "Documentary",
      18: "Drama",
      10751: "Family",
      14: "Fantasy",
      36: "History",
      27: "Horror",
      10402: "Music",
      9648: "Mystery",
      10749: "Romance",
      878: "Science Fiction",
      10770: "TV Movie",
      53: "Thriller",
      10752: "War",
      37: "Western",
    }
    return (
      genreIds
        ?.slice(0, 3)
        .map((id) => genreMap[id])
        .filter(Boolean) || []
    )
  }

  if (!movies.length) return null

  const movie = movies[currentIndex] || {}
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "https://via.placeholder.com/1280x720?text=No+Backdrop"

  return (
    <section
      className="hero"
      ref={heroRef}
      onClick={handleClick}
      style={{
        backgroundImage: `url(${backdropUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="featured-movie">
        <h1>{movie.title || "No Title"}</h1>

        <div className="movie-info-row">
          <div className="genres">
            {getGenres(movie.genre_ids).map((genre, index) => (
              <span key={index} className="genre-tag">
                {genre}
              </span>
            ))}
          </div>

          <div className="movie-details">
            <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}</span>
            <span>{formatRuntime(currentMovieDetails?.runtime)}</span>
            <span>★ {movie.vote_average ? movie.vote_average.toFixed(3) : "N/A"}</span>
          </div>
        </div>

        <p>{movie.overview || "No description available."}</p>

        <div className="hero-buttons">
          <Link to={`/movie-page/${movie.id}/movie`} className="watch-now">
            ▶ Watch Now
          </Link>
          <button className="watch-later">🕒 Watch Later</button>
        </div>
      </div>
      <div className="movie-nav">
        {Array.from({ length: totalMovies }).map((_, idx) => (
          <div key={idx} className={`dot ${idx === currentIndex ? "active" : ""}`} />
        ))}
      </div>
    </section>
  )
}

export default Hero
