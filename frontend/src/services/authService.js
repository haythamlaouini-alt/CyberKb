import axios from "axios";

const API =
  "http://127.0.0.1:8000/api/token/";

const login = async (
  username,
  password
) => {
  const response = await axios.post(API, {
    username,
    password,
  });

  return response.data;
};

export default {
  login,
};