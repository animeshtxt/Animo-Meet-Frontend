const isProd = import.meta.env.ENVIRONMENT === "production";

export const logger = {
  // Only prints in Development
  dev: (...args) => {
    if (!isProd) console.log(...args);
  },
  // Only warn in Development
  warn: (...args) => {
    if (!isProd) console.warn(...args);
  },

  // Always prints (Use for critical tracking)
  info: (...args) => {
    console.log(...args);
  },

  // Always prints errors
  error: (...args) => {
    console.error(...args);
  },
};
