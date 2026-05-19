import api from "../api/axios";

const authService = {
  login: async (credentials) => {
    // credentials contains email & password
    return api.post("/auth/login/", credentials);
  },

  register: async (formData) => {
    // formData contains email, username, first_name, last_name, password, password_confirm
    return api.post("/auth/register/", formData);
  },

  logout: async (refresh) => {
    return api.post("/auth/logout/", { refresh });
  },

  getProfile: async () => {
    return api.get("/users/me/");
  },

  updateProfile: async (data) => {
    return api.patch("/users/me/", data);
  },

  changePassword: async (data) => {
    // data contains old_password, new_password
    return api.post("/users/me/change-password/", data);
  }
};

export default authService;