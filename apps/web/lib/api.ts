import api from './axios';

export const addEventMutationFn = async (data: FormData) => {
  return api.post('/events', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getEventsQueryFn = async () => {
  return api.get('/events?status=all');
};

export const getUserProfileQueryFn = async () => {
  const { data } = await api.get('/users/profile');
  return data.profile;
};

export const updateProfileMutationFn = async (data: { fullName: string }) => {
  const { data: responseData } = await api.put('/users/profile', data);
  return responseData.profile;
};

export const getMySubmissionsQueryFn = async () => {
  const { data } = await api.get('/events/my-submissions');
  return data.events;
};
