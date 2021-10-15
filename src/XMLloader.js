import axios from "axios";

export default (url) => {
  const proxy =
    "https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=";

  return axios
    .get(proxy + url)
    .then((response) => response.data.contents)
    .catch(() => {
      throw new Error("errors.networkError");
    });
};
