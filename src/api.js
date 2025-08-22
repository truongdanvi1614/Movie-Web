import axios from "axios"

export const API_KEY = process.env.REACT_APP_TMDB_API_KEY
const BASE_URL = "https://api.themoviedb.org/3"

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: "en-US",
  },
})

export const searchMovies = async (query, country = "VN", genre = null) => {
  const params = { query, region: country }
  if (genre) params.with_genres = genre
  try {
    const { data } = await api.get("/search/multi", { params })
    console.log("Search response:", data.results) // Debug log
    return data.results
  } catch (error) {
    console.error("Error in searchMovies:", error)
    throw error
  }
}

export const fetchMovies = async (endpoint) => {
  const { data } = await api.get(`/${endpoint}`, { params: { page: 1 } })
  return data.results
}

// src/services/api.js
export const fetchMovieDetails = async (id, type = "movie") => {
  console.log("Fetching details for:", { id, type }) // Debug log
  if (!id || !["movie", "tv"].includes(type)) {
    throw new Error("Invalid id or type")
  }
  try {
    const { data } = await api.get(`/${type}/${id}`, { params: { append_to_response: "credits" } })
    return data
  } catch (error) {
    console.error(`Error fetching details for ${type}/${id}:`, error)
    throw error
  }
}
/* 
export const fetchVideos = async (id, type = 'movie') => {
    const { data } = await api.get(`/${type}/${id}/videos`);
    return data.results;
};
*/
export const fetchSeasonDetails = async (seriesId, seasonNumber) => {
  const { data } = await api.get(`/tv/${seriesId}/season/${seasonNumber}`)
  return data
}

export const fetchGenres = async (type = "movie") => {
  const { data } = await api.get(`/genre/${type}/list`)
  return data.genres
}

export const fetchCountries = async () => {
  const { data } = await api.get("/configuration/countries")
  return data
}

export const fetchCredits = async (id, type) => {
  const response = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`)
  const data = await response.json()
  return data.cast || [] // Trả về danh sách diễn viên
}

export const fetchRecommendations = async (id, type) => {
  const response = await fetch(`${BASE_URL}/${type}/${id}/recommendations?api_key=${API_KEY}`)
  const data = await response.json()
  return data.results || [] // Trả về danh sách đề xuất
}

export const fetchVideos = async (id, type) => {
  const response = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`)
  const data = await response.json()
  return data.results || [] // Trả về danh sách video, lấy trailer đầu tiên
}

export const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes) || minutes <= 0) return "N/A" // Xử lý trường hợp không hợp lệ
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}:${mins}:00`
}

export const formatSeriesInfo = async (id, seasons) => {
  // Simplified; original had more logic, but assuming basic for now
  return `Season ${seasons}`
}

export const fetchPopularPersons = async () => {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}`)
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching popular persons:", error)
    return []
  }
}

export const fetchActorDetails = async (id) => {
  const response = await fetch(`${BASE_URL}/person/${id}?api_key=${API_KEY}`)
  return await response.json()
}

export const fetchActorCredits = async (id) => {
  const response = await fetch(`${BASE_URL}/person/${id}/combined_credits?api_key=${API_KEY}`)
  const data = await response.json()
  return data.cast || [] // Trả về danh sách phim/series diễn viên tham gia
}
