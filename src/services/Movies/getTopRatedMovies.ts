import api from "../api";

export const getTopRatedMovies = async () => {
  let res: any;
  const endpoint = "/movie/top_rated?language=en-US";
  await api
    .get(endpoint)
    .then((data) => {
      res = data.data;
    })
    .catch((error) => {
      res = error.response;
    });
  return res;
};

export default getTopRatedMovies;