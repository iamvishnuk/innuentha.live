import api from './axios';

export const addEventMutationFn = async (data: FormData) => {
  return api.post('/events', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
