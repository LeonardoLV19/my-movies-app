import api from '../api';

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  // Agrega más campos según necesites
}

export const getMovieDetails = async (id: string): Promise<MovieDetails | null> => {
  try {
    const endpoint = `/movie/${id}?language=en-US`;
    const response = await api.get<MovieDetails>(endpoint);
    
    return response.data;
    
  } catch (error: any) {
    console.error(`Error fetching movie details (ID: ${id}):`, {
      status: error.response?.status,
      message: error.message,
      endpoint: error.config?.url
    });
    
    return null;
  }
};

export default getMovieDetails;