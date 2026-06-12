import { API_CLIENT } from '../../../services/client';
import { endpoints } from '../../../services/endpoints';

export const apiCreateAssignment = async (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'files') return;
    if (value != null && value !== '') formData.append(key, value);
  });

  payload.files.forEach(({ uri, name, type }) => {
    formData.append('files', {
      uri,
      name,
      type: type === 'image' ? 'image/jpeg' : 'application/octet-stream',
    });
  });

  const { data } = await API_CLIENT.post(endpoints.create_assignment, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};
