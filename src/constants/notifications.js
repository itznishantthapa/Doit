export const FCM_USER_TOPIC = 'all_users';
export const FCM_ADMIN_TOPIC = 'all_admins';

export const getFcmBroadcastTopicForRole = (role) =>
  role === 'admin' ? FCM_ADMIN_TOPIC : FCM_USER_TOPIC;
