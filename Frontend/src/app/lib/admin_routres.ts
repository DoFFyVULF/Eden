export const ADMIN_ROUTES = {
  DASHBOARD: '/administration',
  LOGIN: '/administration/login',
  
  MASTERS: {
    LIST: '/administration/master',
    CREATE: '/administration/master/create',
    EDIT: '/administration/master/:id/edit',
    PROFILE: '/administration/master/:id',
  },
  
  APPOINTMENTS: {
    LIST: '/administration/appointments',
    CREATE: '/administration/appointments/create',
    EDIT: '/administration/appointments/:id/edit',
    CALENDAR: '/administration/appointments/calendar',
  },
  
  SERVICES: {
    LIST: '/administration/services',
    CREATE: '/administration/services/create',
    EDIT: '/administration/services/:id/edit',
  },
  
  SCHEDULE: {
    OVERVIEW: '/administration/schedule',
    EMPLOYEE: '/administration/schedule/employee/:id',
    WORKING_HOURS: '/administration/schedule/working-hours',
  },

  PRICES: {
    LIST: '/administration/service-price'
  },

  CATEGORY: {
    LIST: '/administration/category'
  }

} as const;