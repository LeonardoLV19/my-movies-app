import api from '../api';

export const getPopularMovies = async () => {
    let res: any;
    const endpoint = '/movie/popular?language=en-US';
    await api
    .get(endpoint)
    .then((data) => {
        res = data.data;
        })
        .catch(
        (error) => {
            res = error.response
        });
    return res;
};

export default getPopularMovies;
