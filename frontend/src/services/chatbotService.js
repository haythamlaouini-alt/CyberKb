import api from "../api/axios";

const chatbotService = {
  ask: async (message) => {
    const response = await api.post(
      "/chatbot/ask/",
      {
        message,
      }
    );

    return response.data;
  },
};

export default chatbotService;