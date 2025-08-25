import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { fetchGenres, fetchCountries } from "../api"
import SearchResults from "./SearchResults"

const Header = () => {
    const [genres, setGenres] = useState({ movie: [], tv: [] })
    const [searchQuery, setSearchQuery] = useState("")
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [countries, setCountries] = useState([])

    useEffect(() => {
        const loadData = async () => {
        const movieGenres = await fetchGenres("movie")
        const tvGenres = await fetchGenres("tv")
        setGenres({ movie: movieGenres, tv: tvGenres })

        const countriesData = await fetchCountries()
        setCountries(countriesData)
        }
        loadData()
    }, [])

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        setShowSearchResults(!!e.target.value)
    }

    const splitCountriesIntoColumns = (countries, columns = 3) => {
        const itemsPerColumn = Math.ceil(countries.length / columns)
        const result = []
        for (let i = 0; i < columns; i++) {
        result.push(countries.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn))
        }
        return result
    }

    const countryColumns = splitCountriesIntoColumns(countries)

    return (
        <header>
        <div className="header-container">
            <nav className="nav-links">
            <Link to="/">Home</Link>
            <div className="genre-dropdown">
                Genre
                <div className="genre-menu">
                <div className="genre-section">
                    <h4>Movies</h4>
                    {genres.movie.map((genre) => (
                    <Link key={`movie-${genre.id}`} to={`/view-all?category=movie_genre_${genre.id}`}>
                        {genre.name}
                    </Link>
                    ))}
                </div>
                <div className="genre-section">
                    <h4>Series</h4>
                    {genres.tv.map((genre) => (
                    <Link key={`tv-${genre.id}`} to={`/view-all?category=tv_genre_${genre.id}`}>
                        {genre.name}
                    </Link>
                    ))}
                </div>
                </div>
            </div>
            <div className="header-country-dropdown">
                Country
                <div className="header-country-menu">
                {countryColumns.map((column, columnIndex) => (
                    <div key={columnIndex} className="country-column">
                    {column.map((country) => (
                        <Link key={country.iso_3166_1} to={`/view-all?category=country_${country.iso_3166_1.toU}`}>
                        {country.english_name}
                        </Link>
                    ))}
                    </div>
                ))}
                </div>
            </div>
            </nav>
            <div className="search-bar">
            <input type="text" placeholder="Search..." onChange={handleSearch} />
            {showSearchResults && <SearchResults query={searchQuery} />}
            </div>
            <nav className="nav-links">
            <Link to="/view-all?category=movie_popular">Movies</Link>
            <Link to="/view-all?category=tv_popular">Series</Link>
            <Link to="/view-all?category=animation">Animation</Link>
            <Link to="/login">Login/Signup</Link>
            </nav>
        </div>
        </header>
    )
}

export default Header
