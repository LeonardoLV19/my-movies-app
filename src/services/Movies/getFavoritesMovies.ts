// services/Movies/getFavoritesMovies.ts
import api from "../api";

export interface FavoriteMovie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export const getFavoritesMovies = async (guestSessionId: string): Promise<{
  success: boolean;
  movies: FavoriteMovie[];
  error?: string;
}> => {
  try {
    const endpoint = `/account/${guestSessionId}/favorite/movies?language=en-US`;
    const { data } = await api.get(endpoint);
    
    return {
      success: true,
      movies: data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date
      }))
    };
  } catch (error: any) {
    return {
      success: false,
      movies: [],
      error: error.response?.data?.status_message || "Error al obtener favoritos"
    };
  }
};