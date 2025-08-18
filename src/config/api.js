// API Configuration
const API_CONFIG = {
  // Use relative path to leverage Vite proxy
  baseURL: "/api",
  version: "v1",
  timeout: 10000,

  getBaseURL() {
    return this.baseURL;
  },

  getVersion() {
    return this.version;
  },

  // Environment-specific configurations
  development: {
    baseURL: "/api", // Uses Vite proxy
  },

  production: {
    // baseURL: process.env.VITE_API_URL || "/api",
  },

  // Get environment-specific config
  getConfig() {
    const env = process.env.NODE_ENV || "development";
    return this[env] || this.development;
  },
};

export default API_CONFIG;
