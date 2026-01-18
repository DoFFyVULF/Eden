export const ADMIN_ROUTES = {
  DASHBOARD: '/administration',
  LOGIN: '/administration/login',
  
  MASTERS: {
    LIST: '/administration/master',
    SERVICES: '/administration/master-service'
  },
  
  APPOINTMENTS: {
    LIST: '/administration/appointments',
    HISTORY: '/administration/appointments/appointments-history'
  },
  
  SERVICES: {
    LIST: '/administration/services',
    CREATE: '/administration/services/create',
    EDIT: '/administration/services/:id/edit',
  },
  
  SCHEDULE: {
    OVERVIEW: '/administration/schedule',
    WORKING_HOURS: '/administration/schedule/working-hours',
  },

  PRICES: {
    LIST: '/administration/service-price',
    MASTER: '/administration/master-service'
  },

  CATEGORY: {
    LIST: '/administration/category'
  },

  USERS: '/administration/user',

} as const;