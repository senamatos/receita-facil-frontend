import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const searchMeals = (query) =>
  api.get('/meals/search', { params: { q: query } });

export const getCategories = () =>
  api.get('/meals/categories');

export const filterByCategory = (category) =>
  api.get('/meals/filter', { params: { category } });

export const getMealDetail = (id) =>
  api.get(`/meals/${id}`);

export const getRandomByCategory = (category) =>
  api.get('/meals/random', { params: { category } });

export const getFavorites = (params = {}) =>
  api.get('/recipes/', { params });

export const getFavorite = (id) =>
  api.get(`/recipes/${id}`);

export const addFavorite = (recipe) =>
  api.post('/recipes/', recipe);

export const updateFavorite = (id, data) =>
  api.put(`/recipes/${id}`, data);

export const deleteFavorite = (id) =>
  api.delete(`/recipes/${id}`);

export default api;
