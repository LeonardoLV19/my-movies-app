import api from '../api';

export const getUpcomingMovies = async () => {
  const endpoint = '/movie/upcoming?language=en-US';
  try {
    const { data } = await api.get(endpoint);
    return data;
  } catch (error: any) {
    return error.response;
  }
};

export default getUpcomingMovies;