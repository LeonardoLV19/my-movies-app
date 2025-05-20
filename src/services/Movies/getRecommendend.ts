import api from "../api";

export const getRecommendedMovies = async (id: string) => {
  let res: any;
  const endpoint = `/movie/${id}/recommendations?language=en-US`;
  await api
    .get(endpoint)
    .then((data) => {
      res = data.data;
    })
    .catch((error) => {
      res = error.response;
    });
  return res;
}