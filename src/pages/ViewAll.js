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
  const [filterOpen, setFilterOpen] = useState(false)
  const [filter, setFilter] = useState({
    countries: [],
    movieTypes: [],
    ratings: [],
    genres: [],
    years: [],
    sortBy: "popularity.desc",
  })

  const countryMapping = {
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    KR: "South Korea",
    HK: "Hong Kong",
    JP: "Japan",
    FR: "France",
    TH: "Thailand",
    CN: "China",
    AU: "Australia",
    DE: "Germany",
  }

  const movieTypeOptions = [
    { id: "movie", name: "Movies" },
    { id: "tv", name: "TV Series" },
  ]

  const ratingOptions = [
    { id: "G", name: "G (General Audiences)" },
    { id: "PG", name: "PG (Parental Guidance)" },
    { id: "PG-13", name: "PG-13 (13+ years)" },
    { id: "R", name: "R (17+ years)" },
    { id: "NC-17", name: "NC-17 (18+ years)" },
  ]

  const sortOptions = [
    { id: "popularity.desc", name: "Most Popular" },
    { id: "release_date.desc", name: "Newest" },
    { id: "vote_average.desc", name: "Highest Rated" },
    { id: "vote_count.desc", name: "Most Voted" },
  ]

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 16 }, (_, i) => currentYear - i)

  const toggleFilterItem = (category, item) => {
    setFilter((prev) => ({
      ...prev,
      [category]: prev[category].includes(item) ? prev[category].filter((i) => i !== item) : [...prev[category], item],
    }))
  }

  const isSelected = (category, item) => {
    return filter[category].includes(item)
  }

  const handleCountryChange = (countries) => {
    setFilter((prev) => ({
      ...prev,
      countries: countries,
    }))
  }

  useEffect(() => {
    const loadGenres = async () => {
      const movieGenres = await fetchGenres("movie")
      const tvGenres = await fetchGenres("tv")
      setGenres({ movie: movieGenres, tv: tvGenres })
    }
    loadGenres()
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
          setEndpoint(`discover/movie?with_origin_country=${countryCode.toUpperCase()}`)
          setTitle(`Movies from ${countryMapping[countryCode.toUpperCase()] || countryCode.toUpperCase()}`)
          setIsSeries(false)
        } else {
          setTitle("Invalid Category")
          console.warn("No matching category found:", category)
        }
        break
    }
  }, [categoryParam, genres])

  const applyFilter = () => {
    const params = new URLSearchParams()

    // Add API key
    params.append("api_key", process.env.REACT_APP_TMDB_API_KEY)

    // Determine media type based on filter selection or current context
    let mediaType = "movie"
    if (filter.movieTypes.includes("tv")) {
      mediaType = "tv"
      setIsSeries(true)
    } else if (filter.movieTypes.includes("movie")) {
      mediaType = "movie"
      setIsSeries(false)
    } else {
      // Use current context if no type selected
      mediaType = isSeries ? "tv" : "movie"
    }

    // Add filters
    if (filter.genres.length > 0) {
      params.append("with_genres", filter.genres.join(","))
    }
    if (filter.countries.length > 0) {
      params.append("with_origin_country", filter.countries.join(","))
    }
    if (filter.years.length > 0) {
      const minYear = Math.min(...filter.years)
      const maxYear = Math.max(...filter.years)
      if (mediaType === "tv") {
        params.append("first_air_date.gte", `${minYear}-01-01`)
        params.append("first_air_date.lte", `${maxYear}-12-31`)
      } else {
        params.append("primary_release_date.gte", `${minYear}-01-01`)
        params.append("primary_release_date.lte", `${maxYear}-12-31`)
      }
    }

    // Add sorting
    params.append("sort_by", filter.sortBy)

    // Construct new endpoint
    const newEndpoint = `discover/${mediaType}?${params.toString()}`

    console.log("[v0] Applied filter endpoint:", newEndpoint)
    setEndpoint(newEndpoint)
    setTitle(`Filtered ${mediaType === "tv" ? "TV Series" : "Movies"}`)
    setFilterOpen(false)
  }

  const resetFilter = () => {
    setFilter({
      countries: [],
      movieTypes: [],
      ratings: [],
      genres: [],
      years: [],
      sortBy: "popularity.desc",
    })
    setFilterOpen(false)
  }

  if (!endpoint) return <p>Loading...</p>

  return (
    <main>
      <h1>{title}</h1>
      <div className="filter-section">
        <button className="filter-toggle" onClick={() => setFilterOpen(!filterOpen)}>
          <span className="filter-icon">▼</span> Filter
        </button>
        {filterOpen && (
          <div className="advanced-filter-panel">
            <div className="filter-header">
              <h3>
                <span className="filter-triangle">▼</span> Filter
              </h3>
            </div>

            <div className="filter-row">
              <label className="filter-label">Country:</label>
              <div className="filter-options">
                <div className="filter-country-dropdown">
                  <select
                    className="filter-country-select"
                    value={filter.countries[0] || ""}
                    onChange={(e) => handleCountryChange(e.target.value ? [e.target.value] : [])}
                  >
                    <option value="">All Countries</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="KR">South Korea</option>
                    <option value="HK">Hong Kong</option>
                    <option value="JP">Japan</option>
                    <option value="FR">France</option>
                    <option value="TH">Thailand</option>
                    <option value="CN">China</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="filter-row">
              <label className="filter-label">Type:</label>
              <div className="filter-options">
                <button
                  className={`filter-tag ${filter.movieTypes.length === 0 ? "active" : ""}`}
                  onClick={() => setFilter((prev) => ({ ...prev, movieTypes: [] }))}
                >
                  All
                </button>
                {movieTypeOptions.map((type) => (
                  <button
                    key={type.id}
                    className={`filter-tag ${isSelected("movieTypes", type.id) ? "active" : ""}`}
                    onClick={() => toggleFilterItem("movieTypes", type.id)}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-row">
              <label className="filter-label">Rating:</label>
              <div className="filter-options">
                <button
                  className={`filter-tag ${filter.ratings.length === 0 ? "active" : ""}`}
                  onClick={() => setFilter((prev) => ({ ...prev, ratings: [] }))}
                >
                  All
                </button>
                {ratingOptions.map((rating) => (
                  <button
                    key={rating.id}
                    className={`filter-tag ${isSelected("ratings", rating.id) ? "active" : ""}`}
                    onClick={() => toggleFilterItem("ratings", rating.id)}
                  >
                    {rating.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-row">
              <label className="filter-label">Genre:</label>
              <div className="filter-options genres-grid">
                <button
                  className={`filter-tag ${filter.genres.length === 0 ? "active" : ""}`}
                  onClick={() => setFilter((prev) => ({ ...prev, genres: [] }))}
                >
                  All
                </button>
                {(isSeries ? genres.tv : genres.movie).map((genre) => (
                  <button
                    key={genre.id}
                    className={`filter-tag ${isSelected("genres", genre.id) ? "active" : ""}`}
                    onClick={() => toggleFilterItem("genres", genre.id)}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-row">
              <label className="filter-label">Release Year:</label>
              <div className="filter-options">
                <button
                  className={`filter-tag ${filter.years.length === 0 ? "active" : ""}`}
                  onClick={() => setFilter((prev) => ({ ...prev, years: [] }))}
                >
                  All
                </button>
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    className={`filter-tag ${isSelected("years", year) ? "active" : ""}`}
                    onClick={() => toggleFilterItem("years", year)}
                  >
                    {year}
                  </button>
                ))}
                <input type="text" placeholder="🔍 Enter year" className="year-search-input" />
              </div>
            </div>

            <div className="filter-row">
              <label className="filter-label">Sort by:</label>
              <div className="filter-options">
                {sortOptions.map((sort) => (
                  <button
                    key={sort.id}
                    className={`filter-tag ${filter.sortBy === sort.id ? "active" : ""}`}
                    onClick={() => setFilter((prev) => ({ ...prev, sortBy: sort.id }))}
                  >
                    {sort.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button className="apply-filter-btn" onClick={applyFilter}>
                Apply Filters →
              </button>
              <button className="close-filter-btn" onClick={resetFilter}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <PaginatedMovieGrid endpoint={endpoint} isSeries={isSeries} key={endpoint} />
    </main>
  )
}

export default ViewAll
