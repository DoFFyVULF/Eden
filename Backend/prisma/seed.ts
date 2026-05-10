import 'dotenv/config';
import { hash } from 'argon2';
import {
  AppointmentStatus,
  PrismaClient,
  Role,
  TimeOffType
} from '../generated/prisma/client';

const prisma = new PrismaClient();

type SeedMaster = {
  surname: string;
  name: string;
  middlename: string;
  specialization: string;
  phone: string;
  photo?: string;
  login: string;
  password: string;
  displayName: string;
};

type SeedCategory = {
  title: string;
  description: string;
  services: Array<{
    title: string;
    description: string;
    duration: number;
    img?: string;
  }>;
};

const mastersSeed: SeedMaster[] = [
  {
    surname: 'Иванова',
    name: 'Алина',
    middlename: 'Сергеевна',
    specialization: 'Женские стрижки и укладки',
    phone: '79001000101',
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    login: 'master.alina',
    password: 'master123',
    displayName: 'Алина Иванова'
  },
  {
    surname: 'Петров',
    name: 'Дмитрий',
    middlename: 'Олегович',
    specialization: 'Барбер и мужские стрижки',
    phone: '79001000102',
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    login: 'master.dmitry',
    password: 'master123',
    displayName: 'Дмитрий Петров'
  },
  {
    surname: 'Соколова',
    name: 'Елена',
    middlename: 'Игоревна',
    specialization: 'Колорист и сложные окрашивания',
    phone: '79001000103',
    photo:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80',
    login: 'master.elena',
    password: 'master123',
    displayName: 'Елена Соколова'
  },
  {
    surname: 'Кузнецова',
    name: 'Мария',
    middlename: 'Андреевна',
    specialization: 'Маникюр и SPA-уход',
    phone: '79001000104',
    photo:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
    login: 'master.maria',
    password: 'master123',
    displayName: 'Мария Кузнецова'
  }
];

const categoriesSeed: SeedCategory[] = [
  {
    title: 'Стрижки',
    description: 'Мужские, женские и детские стрижки с подбором формы.',
    services: [
      {
        title: 'Женская стрижка',
        description: 'Стрижка с мытьем головы и легкой укладкой.',
        duration: 60
      },
      {
        title: 'Мужская стрижка',
        description: 'Классическая или современная мужская стрижка.',
        duration: 45
      },
      {
        title: 'Детская стрижка',
        description: 'Бережная стрижка для детей до 12 лет.',
        duration: 30
      }
    ]
  },
  {
    title: 'Окрашивание',
    description: 'Окрашивания любой сложности и тонирование.',
    services: [
      {
        title: 'Окрашивание в один тон',
        description: 'Ровный оттенок по всей длине волос.',
        duration: 120
      },
      {
        title: 'Мелирование',
        description: 'Осветление прядей с мягкими переходами.',
        duration: 150
      },
      {
        title: 'Тонирование',
        description: 'Освежение оттенка и блеска волос.',
        duration: 60
      }
    ]
  },
  {
    title: 'Укладки',
    description: 'Быстрые и вечерние укладки для любого случая.',
    services: [
      {
        title: 'Укладка феном',
        description: 'Ежедневная аккуратная укладка.',
        duration: 40
      },
      {
        title: 'Вечерняя укладка',
        description: 'Праздничная укладка с фиксацией.',
        duration: 75
      }
    ]
  },
  {
    title: 'Маникюр',
    description: 'Уход за ногтями и покрытие.',
    services: [
      {
        title: 'Классический маникюр',
        description: 'Обработка кутикулы и формы ногтей.',
        duration: 45
      },
      {
        title: 'Маникюр с гель-лаком',
        description: 'Маникюр с покрытием и выравниванием.',
        duration: 90
      },
      {
        title: 'SPA-маникюр',
        description: 'Маникюр с уходом и массажем.',
        duration: 75
      }
    ]
  }
];

const workingDays = [
  { dayOfWeek: 1, startHour: 9, endHour: 18 },
  { dayOfWeek: 2, startHour: 9, endHour: 18 },
  { dayOfWeek: 3, startHour: 9, endHour: 18 },
  { dayOfWeek: 4, startHour: 9, endHour: 18 },
  { dayOfWeek: 5, startHour: 9, endHour: 18 },
  { dayOfWeek: 6, startHour: 10, endHour: 16 }
];

function makeTime(dayOffset: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function upsertAdmin() {
  const existing = await prisma.user.findUnique({
    where: { login: 'admin' }
  });

  const password = existing?.password ?? (await hash('admin123'));

  return prisma.user.upsert({
    where: { login: 'admin' },
    update: {
      name: 'Администратор',
      role: Role.admin,
      isActive: true,
      password
    },
    create: {
      login: 'admin',
      password,
      name: 'Администратор',
      role: Role.admin,
      isActive: true
    }
  });
}

async function upsertMasters() {
  const masterMap = new Map<string, { id: number; displayName: string }>();

  for (const master of mastersSeed) {
    const savedMaster = await prisma.master.upsert({
      where: { phone: master.phone },
      update: {
        surname: master.surname,
        name: master.name,
        middlename: master.middlename,
        specialization: master.specialization,
        photo: master.photo,
        isActive: true
      },
      create: {
        surname: master.surname,
        name: master.name,
        middlename: master.middlename,
        specialization: master.specialization,
        phone: master.phone,
        photo: master.photo,
        isActive: true
      }
    });

    const existingUser = await prisma.user.findUnique({
      where: { login: master.login }
    });

    const password = existingUser?.password ?? (await hash(master.password));

    await prisma.user.upsert({
      where: { login: master.login },
      update: {
        name: master.displayName,
        role: Role.master,
        masterId: savedMaster.id,
        isActive: true,
        password
      },
      create: {
        login: master.login,
        password,
        name: master.displayName,
        role: Role.master,
        masterId: savedMaster.id,
        isActive: true
      }
    });

    masterMap.set(master.phone, {
      id: savedMaster.id,
      displayName: master.displayName
    });
  }

  return masterMap;
}

async function upsertCategoriesAndServices() {
  const serviceMap = new Map<string, { id: number; duration: number }>();

  for (const category of categoriesSeed) {
    const savedCategory = await prisma.category.upsert({
      where: { title: category.title },
      update: {
        description: category.description,
        isActive: true
      },
      create: {
        title: category.title,
        description: category.description,
        isActive: true
      }
    });

    for (const service of category.services) {
      const existingService = await prisma.service.findFirst({
        where: {
          title: service.title,
          categoryId: savedCategory.id
        }
      });

      const savedService = existingService
        ? await prisma.service.update({
            where: { id: existingService.id },
            data: {
              description: service.description,
              duration: service.duration,
              img: service.img,
              isActive: true
            }
          })
        : await prisma.service.create({
            data: {
              title: service.title,
              description: service.description,
              duration: service.duration,
              img: service.img,
              isActive: true,
              categoryId: savedCategory.id
            }
          });

      serviceMap.set(service.title, {
        id: savedService.id,
        duration: savedService.duration
      });
    }
  }

  return serviceMap;
}

async function seedSchedules(masterIds: number[]) {
  await prisma.masterSchedule.deleteMany({
    where: {
      masterID: { in: masterIds }
    }
  });

  for (const masterId of masterIds) {
    for (const day of workingDays) {
      await prisma.masterSchedule.create({
        data: {
          masterID: masterId,
          dayOfWeek: day.dayOfWeek,
          startTime: makeTime(day.dayOfWeek, day.startHour),
          endTime: makeTime(day.dayOfWeek, day.endHour)
        }
      });
    }
  }
}

async function seedServicePrices(
  masterMap: Map<string, { id: number; displayName: string }>,
  serviceMap: Map<string, { id: number; duration: number }>
) {
  const masterIds = [...masterMap.values()].map(item => item.id);
  const serviceIds = [...serviceMap.values()].map(item => item.id);

  await prisma.servicePrice.deleteMany({
    where: {
      OR: [{ masterID: { in: masterIds } }, { serviceId: { in: serviceIds } }]
    }
  });

  const masterByPhone = (phone: string) => masterMap.get(phone)?.id as number;
  const serviceByTitle = (title: string) => serviceMap.get(title)?.id as number;

  await prisma.servicePrice.createMany({
    data: [
      {
        masterID: masterByPhone('79001000101'),
        serviceId: serviceByTitle('Женская стрижка'),
        price: '1800'
      },
      {
        masterID: masterByPhone('79001000101'),
        serviceId: serviceByTitle('Укладка феном'),
        price: '1200'
      },
      {
        masterID: masterByPhone('79001000101'),
        serviceId: serviceByTitle('Вечерняя укладка'),
        price: '2500'
      },
      {
        masterID: masterByPhone('79001000102'),
        serviceId: serviceByTitle('Мужская стрижка'),
        price: '1400'
      },
      {
        masterID: masterByPhone('79001000102'),
        serviceId: serviceByTitle('Детская стрижка'),
        price: '900'
      },
      {
        masterID: masterByPhone('79001000103'),
        serviceId: serviceByTitle('Окрашивание в один тон'),
        price: '3500'
      },
      {
        masterID: masterByPhone('79001000103'),
        serviceId: serviceByTitle('Мелирование'),
        price: '4800'
      },
      {
        masterID: masterByPhone('79001000103'),
        serviceId: serviceByTitle('Тонирование'),
        price: '2200'
      },
      {
        masterID: masterByPhone('79001000104'),
        serviceId: serviceByTitle('Классический маникюр'),
        price: '1300'
      },
      {
        masterID: masterByPhone('79001000104'),
        serviceId: serviceByTitle('Маникюр с гель-лаком'),
        price: '2200'
      },
      {
        masterID: masterByPhone('79001000104'),
        serviceId: serviceByTitle('SPA-маникюр'),
        price: '2500'
      }
    ]
  });
}

async function seedAppointments(
  masterMap: Map<string, { id: number; displayName: string }>,
  serviceMap: Map<string, { id: number; duration: number }>
) {
  const demoPhones = [
    '79002000101',
    '79002000102',
    '79002000103',
    '79002000104'
  ];

  await prisma.appointmentHistory.deleteMany({
    where: {
      clientPhone: { in: demoPhones }
    }
  });

  await prisma.appointment.deleteMany({
    where: {
      OR: [
        { clientPhone: { in: demoPhones } },
        { clientFingerprint: { startsWith: 'seed-demo-' } }
      ]
    }
  });

  const appointmentDefinitions = [
    {
      clientSurname: 'Смирнова',
      clientName: 'Ольга',
      clientPhone: '79002000101',
      clientIp: '10.0.0.11',
      clientFingerprint: 'seed-demo-1',
      masterPhone: '79001000101',
      serviceTitle: 'Женская стрижка',
      appointmentTime: makeTime(1, 10, 0),
      price: '1800',
      status: AppointmentStatus.Новый
    },
    {
      clientSurname: 'Егоров',
      clientName: 'Павел',
      clientPhone: '79002000102',
      clientIp: '10.0.0.12',
      clientFingerprint: 'seed-demo-2',
      masterPhone: '79001000102',
      serviceTitle: 'Мужская стрижка',
      appointmentTime: makeTime(1, 11, 0),
      price: '1400',
      status: AppointmentStatus.Подтвержден
    },
    {
      clientSurname: 'Фролова',
      clientName: 'Марина',
      clientPhone: '79002000103',
      clientIp: '10.0.0.13',
      clientFingerprint: 'seed-demo-3',
      masterPhone: '79001000103',
      serviceTitle: 'Окрашивание в один тон',
      appointmentTime: makeTime(2, 13, 0),
      price: '3500',
      status: AppointmentStatus.Подтвержден
    },
    {
      clientSurname: 'Крылова',
      clientName: 'Наталья',
      clientPhone: '79002000104',
      clientIp: '10.0.0.14',
      clientFingerprint: 'seed-demo-4',
      masterPhone: '79001000104',
      serviceTitle: 'Маникюр с гель-лаком',
      appointmentTime: makeTime(-2, 15, 0),
      price: '2200',
      status: AppointmentStatus.Завершен
    }
  ];

  for (const appointment of appointmentDefinitions) {
    const masterId = masterMap.get(appointment.masterPhone)?.id;
    const serviceId = serviceMap.get(appointment.serviceTitle)?.id;

    if (!masterId || !serviceId) {
      throw new Error(
        `Не удалось сопоставить мастера или услугу для ${appointment.clientPhone}`
      );
    }

    const created = await prisma.appointment.create({
      data: {
        clientSurname: appointment.clientSurname,
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        clientIp: appointment.clientIp,
        clientFingerprint: appointment.clientFingerprint,
        masterID: masterId,
        serviceId,
        appointmentTime: appointment.appointmentTime,
        price: appointment.price,
        status: appointment.status
      }
    });

    if (appointment.status === AppointmentStatus.Завершен) {
      await prisma.appointmentHistory.create({
        data: {
          appointmentId: created.id,
          clientSurname: appointment.clientSurname,
          clientName: appointment.clientName,
          clientPhone: appointment.clientPhone,
          masterID: masterId,
          serviceId,
          appointmentTime: appointment.appointmentTime,
          price: appointment.price
        }
      });
    }
  }
}

async function seedTimeOff(masterId: number) {
  await prisma.masterTimeOff.deleteMany({
    where: {
      masterId,
      comment: 'Сид: плановый выходной'
    }
  });

  await prisma.masterTimeOff.create({
    data: {
      masterId,
      startDate: makeTime(3, 0, 0),
      endDate: makeTime(3, 23, 59),
      type: TimeOffType.day_off,
      comment: 'Сид: плановый выходной'
    }
  });
}

async function main() {
  await upsertAdmin();
  const masterMap = await upsertMasters();
  const serviceMap = await upsertCategoriesAndServices();

  await seedSchedules([...masterMap.values()].map(item => item.id));
  await seedServicePrices(masterMap, serviceMap);
  await seedAppointments(masterMap, serviceMap);
  await seedTimeOff(masterMap.get('79001000103')!.id);

  console.log('Seed completed successfully');
  console.log('Admin login: admin / admin123');
  console.log(
    `Masters: ${mastersSeed.map(master => `${master.login} / ${master.password}`).join(', ')}`
  );
}

main()
  .catch(error => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
