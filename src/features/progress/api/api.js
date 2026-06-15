import { API_CLIENT } from '../../../services/client';
import { endpoints } from '../../../services/endpoints';

export const apiSubmitPayment = async ({ assignmentId, operationType, screenshot }) => {
  const formData = new FormData();

  formData.append('operation_type', operationType);
  formData.append('assignment_id', assignmentId);

  if (screenshot) {
    formData.append('payment_screenshot', {
      uri: screenshot.uri,
      name: screenshot.fileName ?? `payment-${Date.now()}.jpg`,
      type: screenshot.mimeType ?? 'image/jpeg',
    });
  }

  const { data } = await API_CLIENT.post(endpoints.submit_payment, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return data;
};

export const apiUnsubmitAssignment = async (assignmentId) => {
  const { data } = await API_CLIENT.post(endpoints.unsubmit_assignment, {
    assignment_id: assignmentId,
  });
  return data;
};

export const apiChangesRequest = async ({ assignmentId, description }) => {
  const { data } = await API_CLIENT.post(endpoints.changes_request, {
    assignment_id: assignmentId,
    changes_request_description: description,
  });
  return data;
};
