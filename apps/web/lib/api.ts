import api from './axios';

export const addEventMutationFn = async (data: FormData) => {
  return api.post('/events', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getEventsQueryFn = async () => {
  return api.get('/events?status=all');
};
