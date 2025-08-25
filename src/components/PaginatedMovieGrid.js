"use client"

import { useState, useEffect } from "react"
import { fetchMovieDetails, formatDuration, formatSeriesInfo } from "../api"
import { Link } from "react-router-dom"

const PaginatedMovieGrid = ({ endpoint, isSeries = false }) => {
    const [items, setItems] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(false)
    const moviesPerPage = 20 // 5 rows * 4 movies per row

    const fetchMovies = async (endpoint, page = 1) => {
        const API_KEY = process.env.REACT_APP_TMDB_API_KEY
        const separator = endpoint.includes("?") ? "&" : "?"
        const url = `https://api.themoviedb.org/3/${endpoint}${separator}api_key=${API_KEY}&page=${page}`

        try {
        const response = await fetch(url)
        const data = await response.json()
        return {
            results: data.results || [],
            total_pages: data.total_pages || 0,
            total_results: data.total_results || 0,
        }
        } catch (error) {
        console.error("Error fetching movies:", error)
        return { results: [], total_pages: 0, total_results: 0 }
        }
    }

    useEffect(() => {
        const loadItems = async () => {
        if (!endpoint) return

        setLoading(true)
        try {
            console.log("Fetching movies for endpoint:", endpoint, "page:", currentPage)
            const data = await fetchMovies(endpoint, currentPage)
            console.log("Fetched data:", data)

            setTotalPages(data.total_pages)

            const processed = await Promise.all(
            data.results.map(async (item) => {
                try {
                const details = await fetchMovieDetails(item.id, isSeries ? "tv" : "movie")
                const title = isSeries ? details.name || item.name || "N/A" : details.title || item.title || "N/A"
                const runtime = isSeries
                    ? await formatSeriesInfo(item.id, details.number_of_seasons || 0)
                    : details.runtime
                    ? formatDuration(details.runtime)
                    : "N/A"
                return { ...item, title, runtime }
                } catch (error) {
                console.error("Error fetching details for item:", item.id, error)
                const title = isSeries ? item.name || "N/A" : item.title || "N/A"
                return { ...item, title, runtime: "N/A" }
                }
            }),
            )
            console.log("Processed items:", processed)
            setItems(processed.filter((item) => item.title !== "N/A"))
        } catch (error) {
            console.error("Error loading items:", error)
            setItems([])
            setTotalPages(0)
        } finally {
            setLoading(false)
        }
        }
        loadItems()
    }, [endpoint, isSeries, currentPage])

    useEffect(() => {
        setCurrentPage(1)
    }, [endpoint])

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber)
        window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const goToPrevious = () => paginate(currentPage - 1)
    const goToNext = () => paginate(currentPage + 1)

    if (loading) {
        return <div className="loading-spinner">Loading...</div>
    }

    return (
        <section className="paginated-movie-grid">
        <div className="movie-grid-container">
            {items.length === 0 && !loading && <p>No {isSeries ? "series" : "movies"} available.</p>}
            {items.map((item) => (
            <Link key={item.id} to={`/movie-page/${item.id}/${isSeries ? "tv" : "movie"}`} className="movie-card">
                <img
                src={`https://image.tmdb.org/t/p/original${item.poster_path || "/placeholder.jpg"}`}
                alt={item.title}
                onError={(e) => {
                    e.target.src = "/abstract-movie-poster.png"
                }}
                />
                <div className="movie-overlay">
                <h3>{item.title}</h3>
                <p>{item.runtime || "N/A"}</p>
                </div>
            </Link>
            ))}
        </div>

        {totalPages > 1 && (
            <div className="pagination-new">
            <button className="pagination-arrow" onClick={goToPrevious} disabled={currentPage === 1}>
                ←
            </button>
            <div className="pagination-info">
                <span className="pagination-label">Page</span>
                <span className="pagination-current">{currentPage}</span>
                <span className="pagination-total">/ {totalPages}</span>
            </div>
            <button className="pagination-arrow" onClick={goToNext} disabled={currentPage === totalPages}>
                →
            </button>
            </div>
        )}
        </section>
    )
}

export default PaginatedMovieGrid
