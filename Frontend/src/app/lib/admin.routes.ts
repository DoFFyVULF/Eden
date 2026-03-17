export const ADMIN_ROUTES = {
  DASHBOARD: "/administration",
  LOGIN: "/administration/login",

  MASTERS: {
    LIST: "/administration/master",
    SERVICES: "/administration/master-service",
  },

  APPOINTMENTS: {
    LIST: "/administration/appointments",
    HISTORY: "/administration/appointments/history",
  },

  SERVICES: {
    LIST: "/administration/services",
  },

  SCHEDULE: {
    OVERVIEW: "/administration/schedule",
    WORKING_HOURS: "/administration/schedule/working-hours",
  },

  PRICES: {
    LIST: "/administration/service-price",
    MASTER: "/administration/master-service",
  },

  CATEGORY: {
    LIST: "/administration/category",
  },

  ANALYTICS: {
    DASHBOARD: "/administration/analytics",
    FINANCIAL: "/administration/analytics/financial",
    CLIENTS: "/administration/analytics/clients",
    APPOINTMENTS: "/administration/analytics/appointments",
    MASTERS: "/administration/analytics/masters",
    SERVICES: "/administration/analytics/services",
    COMPARSION: "/administration/analytics/comparison",
  },

  USERS: "/administration/user",
} as const;
