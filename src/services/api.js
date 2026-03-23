import axios from 'axios';

const chatLambdaUrl = import.meta.env.VITE_AWS_LAMBDA_CHAT_COMPLETION_URL;
const imageEditLambdaUrl = import.meta.env.VITE_AWS_LAMBDA_IMAGE_EDIT_URL;
const imageGenLambdaUrl = import.meta.env.VITE_AWS_LAMBDA_IMAGE_GENERATION_URL;

const apiClient = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const chatService = {
  sendMessage: async (messages, model = 'gpt-4') => {
    const response = await apiClient.post(chatLambdaUrl, { messages, model });
    return response.data;
  },
};

export const imageEditService = {
  editImage: async (imageUrl, instruction) => {
    const response = await apiClient.post(imageEditLambdaUrl, { image_url: imageUrl, instruction });
    return response.data;
  },
};

export const imageGenService = {
  generateImage: async (prompt, model = 'dall-e-3') => {
    const response = await apiClient.post(imageGenLambdaUrl, { prompt, model });
    return response.data;
  },
};

export const openaiService = {
  chat: async (messages, apiKey) => {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages,
    }, {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    });
    return response.data;
  },
};

export const geminiService = {
  chat: async (messages, apiKey) => {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      { contents: messages }
    );
    return response.data;
  },
};