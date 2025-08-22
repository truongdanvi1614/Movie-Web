"use client"

import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { fetchGenres, fetchCountries } from "../api"
import PaginatedMovieGrid from "../components/PaginatedMovieGrid"

const ViewAll = () => {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const categoryParam = query.get("category")
  const [endpoint, setEndpoint] = useState("")
  const [title, setTitle] = useState("")
  const [isSeries, setIsSeries] = useState(false)
  const [genres, setGenres] = useState({ movie: [], tv: [] })
  const [countries, setCountries] = useState([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState({
    genre: "",
    yearFrom: "",
    yearTo: "",
    rating: "",
    country: "",
  })

  useEffect(() => {
    const loadGenres = async () => {
      const movieGenres = await fetchGenres("movie")
      const tvGenres = await fetchGenres("tv")
      setGenres({ movie: movieGenres, tv: tvGenres })
    }
    const loadCountries = async () => {
      const countriesData = await fetchCountries()
      setCountries(countriesData)
    }
    loadGenres()
    loadCountries()
  }, [])

  useEffect(() => {
    console.log("Raw category parameter:", categoryParam)
    let category = categoryParam

    if (category && typeof category === "string") {
      category = category.toLowerCase().replace(/-/g, "_")
      console.log("Normalized category:", category)
    } else {
      category = "invalid"
      console.warn("Category parameter is invalid or missing:", categoryParam)
    }

    setEndpoint("")
    setTitle("")
    setIsSeries(false)

    switch (category) {
      case "movie_now_playing":
        setEndpoint("movie/now_playing")
        setTitle("Recently Updated")
        setIsSeries(false)
        break
      case "trending_movie_week":
        setEndpoint("trending/movie/week")
        setTitle("Trending")
        setIsSeries(false)
        break
      case "movie_upcoming":
        setEndpoint("movie/upcoming")
        setTitle("New Release - Movies")
        setIsSeries(false)
        break
      case "tv_on_the_air":
        setEndpoint("tv/on_the_air")
        setTitle("New Release - Series")
        setIsSeries(true)
        break
      case "movie_top_rated":
        setEndpoint("movie/top_rated")
        setTitle("Recommended")
        setIsSeries(false)
        break
      case "movie_popular":
        setEndpoint("movie/popular")
        setTitle("Most Popular Movies")
        setIsSeries(false)
        break
      case "tv_popular":
        setEndpoint("tv/popular")
        setTitle("Most Popular Series")
        setIsSeries(true)
        break
      case "animation":
        setEndpoint("discover/movie?with_genres=16")
        setTitle("Most Popular Animation")
        setIsSeries(false)
        break
      default:
        if (category.startsWith("movie_genre_")) {
          const genreId = category.replace("movie_genre_", "")
          const genre = genres.movie.find((g) => g.id === Number.parseInt(genreId))
          setEndpoint(`discover/movie?with_genres=${genreId}`)
          setTitle(`Movies - ${genre ? genre.name : "Genre " + genreId}`)
          setIsSeries(false)
        } else if (category.startsWith("tv_genre_")) {
          const genreId = category.replace("tv_genre_", "")
          const genre = genres.tv.find((g) => g.id === Number.parseInt(genreId))
          setEndpoint(`discover/tv?with_genres=${genreId}`)
          setTitle(`Series - ${genre ? genre.name : "Genre " + genreId}`)
          setIsSeries(true)
        } else if (category.startsWith("country_")) {
          const countryCode = category.replace("country_", "")
          setEndpoint(`discover/movie?with_origin_country=${countryCode}`)
          setTitle(`Movies from ${countryCode}`)
          setIsSeries(false)
        } else {
          setTitle("Invalid Category")
          console.warn("No matching category found:", category)
        }
        break
    }
  }, [categoryParam, genres])

  const applyFilter = () => {
    let newEndpoint = endpoint
    const params = []

    if (filter.genre) params.push(`with_genres=${filter.genre}`)
    if (filter.yearFrom) params.push(`primary_release_date.gte=${filter.yearFrom}-01-01`)
    if (filter.yearTo) params.push(`primary_release_date.lte=${filter.yearTo}-12-31`)
    if (filter.rating) params.push(`vote_average.gte=${filter.rating}`)
    if (filter.country) params.push(`with_origin_country=${filter.country}`)

    if (params.length > 0) {
      newEndpoint = `${isSeries ? "discover/tv" : "discover/movie"}?${params.join("&")}&api_key=${process.env.REACT_APP_TMDB_API_KEY}`
    }

    setEndpoint(newEndpoint)
    setFilterOpen(false) // Đóng bộ lọc sau khi áp dụng
  }

  const resetFilter = () => {
    setFilter({ genre: "", yearFrom: "", yearTo: "", rating: "", country: "" })
    setEndpoint(endpoint.split("?")[0]) // Reset về endpoint gốc
    setFilterOpen(false)
  }

  if (!endpoint) return <p>Loading...</p>

  return (
    <main>
      <h1>{title}</h1>
      <div className="filter-section">
        <button onClick={() => setFilterOpen(!filterOpen)}>Filter</button>
        {filterOpen && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>Genre:</label>
              <select value={filter.genre} onChange={(e) => setFilter({ ...filter, genre: e.target.value })}>
                <option value="">All</option>
                {(isSeries ? genres.tv : genres.movie).map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Year From:</label>
              <input
                type="number"
                value={filter.yearFrom}
                onChange={(e) => setFilter({ ...filter, yearFrom: e.target.value })}
                placeholder="YYYY"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="filter-group">
              <label>Year To:</label>
              <input
                type="number"
                value={filter.yearTo}
                onChange={(e) => setFilter({ ...filter, yearTo: e.target.value })}
                placeholder="YYYY"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="filter-group">
              <label>Rating (&gt;=):</label>
              <input
                type="number"
                value={filter.rating}
                onChange={(e) => setFilter({ ...filter, rating: e.target.value })}
                placeholder="e.g., 7"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
            <div className="filter-group">
              <label>Country:</label>
              <select value={filter.country} onChange={(e) => setFilter({ ...filter, country: e.target.value })}>
                <option value="">All</option>
                {countries.map((country) => (
                  <option key={country.iso_3166_1} value={country.iso_3166_1}>
                    {country.english_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-actions">
              <button onClick={applyFilter}>Apply</button>
              <button onClick={resetFilter}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <PaginatedMovieGrid endpoint={endpoint} isSeries={isSeries} key={endpoint} />
    </main>
  )
}

export default ViewAll
