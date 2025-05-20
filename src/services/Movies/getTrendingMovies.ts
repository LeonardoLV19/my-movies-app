import api from '../api';

export const getTrendingMovies = async () => {
  const endpoint = '/trending/movie/week';
  try {
    const { data } = await api.get(endpoint);
    return data;
  } catch (error: any) {
    return error.response;
  }
};

export default getTrendingMovies;