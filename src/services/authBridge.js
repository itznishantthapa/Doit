let getAccessToken = () => null;
let refreshAccessToken = async () => {
  throw new Error('Auth handlers are not registered.');
};
let logout = async () => {};

export const registerAuthHandlers = (handlers) => {
  if (handlers.getAccessToken) {
    getAccessToken = handlers.getAccessToken;
  }

  if (handlers.refreshAccessToken) {
    refreshAccessToken = handlers.refreshAccessToken;
  }

  if (handlers.logout) {
    logout = handlers.logout;
  }
};

export const authBridge = {
  getAccessToken: () => getAccessToken(),
  refreshAccessToken: () => refreshAccessToken(),
  logout: () => logout(),
};
