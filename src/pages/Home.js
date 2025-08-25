"use client"

import { useState } from "react"
import Hero from "../components/Hero"
import MovieGrid from "../components/MovieGrid"

const Home = () => {
  const [activeRecommendedFilter, setActiveRecommendedFilter] = useState("movies")

  const getRecommendedConfig = () => {
    switch (activeRecommendedFilter) {
      case "movies":
        return { endpoint: "movie/top_rated", isSeries: false }
      case "series":
        return { endpoint: "tv/top_rated", isSeries: true }
      case "animation":
        return { endpoint: "discover/movie?with_genres=16", isSeries: false }
      default:
        return { endpoint: "movie/top_rated", isSeries: false }
    }
  }

  const recommendedConfig = getRecommendedConfig()

  return (
    <main>
      <Hero />
      <MovieGrid endpoint="movie/now_playing" title="Recently Updated" />
      <MovieGrid endpoint="trending/movie/week" title="Trending" />
      <MovieGrid endpoint="movie/upcoming" title="New Release - Movies" />
      <MovieGrid endpoint="tv/on_the_air" title="New Release - Series" isSeries />

      <div className="recommended-section">
        <div className="recommended-header">
          <h2>Recommended</h2>
          <div className="recommend-buttons">
            <button
              className={`recommend-btn ${activeRecommendedFilter === "movies" ? "active" : ""}`}
              onClick={() => setActiveRecommendedFilter("movies")}
            >
              Movies
            </button>
            <button
              className={`recommend-btn ${activeRecommendedFilter === "series" ? "active" : ""}`}
              onClick={() => setActiveRecommendedFilter("series")}
            >
              Series
            </button>
            <button
              className={`recommend-btn ${activeRecommendedFilter === "animation" ? "active" : ""}`}
              onClick={() => setActiveRecommendedFilter("animation")}
            >
              Animation
            </button>
          </div>
        
        </div>
        <MovieGrid
          key={activeRecommendedFilter}
          endpoint={recommendedConfig.endpoint}
          title=""
          isSeries={recommendedConfig.isSeries}
        />
      </div>
    </main>
  )
}

export default Home
