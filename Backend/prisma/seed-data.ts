/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient, Prisma } from '../generated/prisma/client';

const prisma = new PrismaClient();

// ============================================================
// SEED: Demo data (runs only if DB is empty)
// ============================================================
async function seedData() {
  const categoryCount = await prisma.category.count();
  if (categoryCount > 0) {
    console.log('⏭️ Database already has data, skipping data seed');
    return;
  }

  // --- Categories ---
  const categoryStrizhki = await prisma.category.create({
    data: { title: 'Стрижки', description: 'Все виды стрижек', isActive: true },
  });
  const categoryOkrashivanie = await prisma.category.create({
    data: { title: 'Окрашивание', description: 'Окрашивание волос любой сложности', isActive: true },
  });
  const categoryUkladka = await prisma.category.create({
    data: { title: 'Укладка и стайлинг', description: 'Укладки на все случаи жизни', isActive: true },
  });
  const categoryUhod = await prisma.category.create({
    data: { title: 'Уход за волосами', description: 'Восстанавливающие и питательные процедуры', isActive: true },
  });

  console.log('✅ Created 4 categories');

  // --- Services ---
  const serviceStrizhkaZh = await prisma.service.create({
    data: { title: 'Стрижка женская', description: 'Женская стрижка любой сложности', duration: 60, categoryId: categoryStrizhki.id, isActive: true },
  });
  const serviceStrizhkaMuzh = await prisma.service.create({
    data: { title: 'Стрижка мужская', description: 'Мужская стрижка', duration: 45, categoryId: categoryStrizhki.id, isActive: true },
  });
  const serviceStrizhkaChelki = await prisma.service.create({
    data: { title: 'Стрижка чёлки', description: 'Коррекция чёлки', duration: 15, categoryId: categoryStrizhki.id, isActive: true },
  });
  const serviceStrizhkaForme = await prisma.service.create({
    data: { title: 'Стрижка по форме', description: 'Модельная стрижка по форме лица', duration: 90, categoryId: categoryStrizhki.id, isActive: true },
  });

  const serviceOkraskKorney = await prisma.service.create({
    data: { title: 'Окрашивание корней', description: 'Окрашивание отросших корней', duration: 60, categoryId: categoryOkrashivanie.id, isActive: true },
  });
  const serviceOkraskPolnoe = await prisma.service.create({
    data: { title: 'Окрашивание полное', description: 'Полное окрашивание волос', duration: 120, categoryId: categoryOkrashivanie.id, isActive: true },
  });
  const serviceMelirovanie = await prisma.service.create({
    data: { title: 'Мелирование', description: 'Мелирование волос', duration: 150, categoryId: categoryOkrashivanie.id, isActive: true },
  });
  const serviceTonirovanie = await prisma.service.create({
    data: { title: 'Тонирование', description: 'Тонирование волос', duration: 45, categoryId: categoryOkrashivanie.id, isActive: true },
  });

  const serviceUkladkaFenom = await prisma.service.create({
    data: { title: 'Укладка феном', description: 'Укладка волос феном', duration: 40, categoryId: categoryUkladka.id, isActive: true },
  });
  const serviceUkladkaPloykoy = await prisma.service.create({
    data: { title: 'Укладка плойкой', description: 'Укладка плойкой и щипцами', duration: 60, categoryId: categoryUkladka.id, isActive: true },
  });
  const serviceUkladkaVechnernyaya = await prisma.service.create({
    data: { title: 'Вечерняя укладка', description: 'Вечерняя и свадебная укладка', duration: 75, categoryId: categoryUkladka.id, isActive: true },
  });

  const serviceKeratin = await prisma.service.create({
    data: { title: 'Кератин', description: 'Кератиновое выпрямление волос', duration: 120, categoryId: categoryUhod.id, isActive: true },
  });
  const serviceBotox = await prisma.service.create({
    data: { title: 'Ботокс волос', description: 'Ботоксное восстановление волос', duration: 90, categoryId: categoryUhod.id, isActive: true },
  });
  const serviceLaminirovanie = await prisma.service.create({
    data: { title: 'Ламинирование', description: 'Ламинирование волос', duration: 60, categoryId: categoryUhod.id, isActive: true },
  });

  const allServices = [
    serviceStrizhkaZh,
    serviceStrizhkaMuzh,
    serviceStrizhkaChelki,
    serviceStrizhkaForme,
    serviceOkraskKorney,
    serviceOkraskPolnoe,
    serviceMelirovanie,
    serviceTonirovanie,
    serviceUkladkaFenom,
    serviceUkladkaPloykoy,
    serviceUkladkaVechnernyaya,
    serviceKeratin,
    serviceBotox,
    serviceLaminirovanie,
  ];

  console.log(`✅ Created ${allServices.length} services`);

  // --- Masters ---
  const masterElena = await prisma.master.create({
    data: {
      surname: 'Иванова',
      name: 'Елена',
      middlename: 'Александровна',
      specialization: 'Стилист-колорист',
      phone: '+79001234567',
      isActive: true,
    },
  });
  const masterMariya = await prisma.master.create({
    data: {
      surname: 'Петрова',
      name: 'Мария',
      middlename: 'Сергеевна',
      specialization: 'Мастер универсал',
      phone: '+79001234568',
      isActive: true,
    },
  });
  const masterAnna = await prisma.master.create({
    data: {
      surname: 'Козлова',
      name: 'Анна',
      middlename: 'Дмитриевна',
      specialization: 'Парикмахер-стилист',
      phone: '+79001234569',
      isActive: true,
    },
  });

  const allMasters = [masterElena, masterMariya, masterAnna];

  console.log(`✅ Created ${allMasters.length} masters`);

  // --- Service Prices ---
  const elenaPrices: [number, number][] = [
    [serviceStrizhkaZh.id, 1500],
    [serviceStrizhkaMuzh.id, 1000],
    [serviceStrizhkaChelki.id, 500],
    [serviceStrizhkaForme.id, 2500],
    [serviceOkraskKorney.id, 2000],
    [serviceOkraskPolnoe.id, 4500],
    [serviceMelirovanie.id, 5000],
    [serviceTonirovanie.id, 1500],
    [serviceUkladkaFenom.id, 800],
    [serviceUkladkaPloykoy.id, 1200],
    [serviceUkladkaVechnernyaya.id, 2000],
    [serviceKeratin.id, 4000],
    [serviceBotox.id, 3500],
    [serviceLaminirovanie.id, 2500],
  ];

  const mariyaPrices: [number, number][] = [
    [serviceStrizhkaZh.id, 1200],
    [serviceStrizhkaMuzh.id, 900],
    [serviceStrizhkaChelki.id, 400],
    [serviceStrizhkaForme.id, 2000],
    [serviceOkraskKorney.id, 1800],
    [serviceOkraskPolnoe.id, 4000],
    [serviceMelirovanie.id, 4500],
    [serviceTonirovanie.id, 1200],
    [serviceUkladkaFenom.id, 800],
    [serviceUkladkaPloykoy.id, 1000],
    [serviceUkladkaVechnernyaya.id, 1800],
    [serviceKeratin.id, 3500],
    [serviceBotox.id, 3000],
    [serviceLaminirovanie.id, 2000],
  ];

  const annaPrices: [number, number][] = [
    [serviceStrizhkaZh.id, 1400],
    [serviceStrizhkaMuzh.id, 950],
    [serviceStrizhkaChelki.id, 450],
    [serviceStrizhkaForme.id, 2200],
    [serviceOkraskKorney.id, 1800],
    [serviceOkraskPolnoe.id, 4000],
    [serviceMelirovanie.id, 4500],
    [serviceTonirovanie.id, 1300],
    [serviceUkladkaFenom.id, 900],
    [serviceUkladkaPloykoy.id, 1100],
    [serviceUkladkaVechnernyaya.id, 2200],
    [serviceKeratin.id, 3800],
    [serviceBotox.id, 3200],
    [serviceLaminirovanie.id, 2200],
  ];

  const createPrices = async (masterId: number, prices: [number, number][]) => {
    await Promise.all(
      prices.map(([serviceId, price]) =>
        prisma.servicePrice.create({
          data: { masterID: masterId, serviceId, price, isActive: true },
        }),
      ),
    );
  };

  await createPrices(masterElena.id, elenaPrices);
  await createPrices(masterMariya.id, mariyaPrices);
  await createPrices(masterAnna.id, annaPrices);

  console.log(`✅ Created ${elenaPrices.length + mariyaPrices.length + annaPrices.length} service prices`);

  // --- Master Schedules ---
  // ✅ ИСПРАВЛЕНИЕ: Добавляем правильную типизацию для массива
  const scheduleData: Prisma.MasterScheduleCreateManyInput[] = [];
  
  const baseDate = new Date('1970-01-01');
  
  for (const master of allMasters) {
    for (let day = 1; day <= 6; day++) {
      let startH = 9;
      let endH = 18;
      
      if (master.id === masterMariya.id) {
        startH = 10;
        endH = 19;
      }
      
      scheduleData.push({
        masterID: master.id,
        dayOfWeek: day,
        startTime: new Date(baseDate.getTime() + day * 86400000 + startH * 3600000),
        endTime: new Date(baseDate.getTime() + day * 86400000 + endH * 3600000),
      });
    }
  }

  await prisma.masterSchedule.createMany({
    data: scheduleData,
  });

  console.log('✅ Created master schedules (Mon-Sat for each master)');

  // --- Sample Appointments ---
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const todayAt10 = new Date(today);
  todayAt10.setHours(10, 0, 0, 0);
  const todayAt14 = new Date(today);
  todayAt14.setHours(14, 0, 0, 0);
  const tomorrowAt11 = new Date(tomorrow);
  tomorrowAt11.setHours(11, 0, 0, 0);
  const tomorrowAt15 = new Date(tomorrow);
  tomorrowAt15.setHours(15, 0, 0, 0);
  const dayAfterAt12 = new Date(dayAfterTomorrow);
  dayAfterAt12.setHours(12, 0, 0, 0);
  const nextWeekAt10 = new Date(nextWeek);
  nextWeekAt10.setHours(10, 0, 0, 0);

  await prisma.appointment.createMany({
    data: [
      {
        clientSurname: 'Смирнова',
        clientName: 'Ольга',
        clientPhone: '+79011112233',
        masterID: masterElena.id,
        serviceId: serviceOkraskPolnoe.id,
        appointmentTime: todayAt10,
        price: 4500,
        status: 'Подтвержден',
      },
      {
        clientSurname: 'Кузнецова',
        clientName: 'Наталья',
        clientPhone: '+79011112244',
        masterID: masterMariya.id,
        serviceId: serviceStrizhkaZh.id,
        appointmentTime: todayAt14,
        price: 1200,
        status: 'Новый',
      },
      {
        clientSurname: 'Попова',
        clientName: 'Екатерина',
        clientPhone: '+79011112255',
        masterID: masterAnna.id,
        serviceId: serviceUkladkaVechnernyaya.id,
        appointmentTime: tomorrowAt11,
        price: 2200,
        status: 'Новый',
      },
      {
        clientSurname: 'Васильева',
        clientName: 'Татьяна',
        clientPhone: '+79011112266',
        masterID: masterElena.id,
        serviceId: serviceMelirovanie.id,
        appointmentTime: tomorrowAt15,
        price: 5000,
        status: 'Подтвержден',
      },
      {
        clientSurname: 'Новикова',
        clientName: 'Ирина',
        clientPhone: '+79011112277',
        masterID: masterMariya.id,
        serviceId: serviceKeratin.id,
        appointmentTime: dayAfterAt12,
        price: 3500,
        status: 'Новый',
      },
      {
        clientSurname: 'Морозова',
        clientName: 'Анна',
        clientPhone: '+79011112288',
        masterID: masterAnna.id,
        serviceId: serviceStrizhkaForme.id,
        appointmentTime: nextWeekAt10,
        price: 2200,
        status: 'Новый',
      },
    ],
  });

  console.log('✅ Created 6 sample appointments');

  // --- Completed appointment (history) ---
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayAt10 = new Date(yesterday);
  yesterdayAt10.setHours(10, 0, 0, 0);
  const yesterdayAt13 = new Date(yesterday);
  yesterdayAt13.setHours(13, 0, 0, 0);

  const completedAppt1 = await prisma.appointment.create({
    data: {
      clientSurname: 'Федорова',
      clientName: 'Марина',
      clientPhone: '+79011112299',
      masterID: masterElena.id,
      serviceId: serviceStrizhkaZh.id,
      appointmentTime: yesterdayAt10,
      price: 1500,
      status: 'Завершен',
    },
  });

  const completedAppt2 = await prisma.appointment.create({
    data: {
      clientSurname: 'Соколова',
      clientName: 'Дарья',
      clientPhone: '+79011112300',
      masterID: masterAnna.id,
      serviceId: serviceUkladkaFenom.id,
      appointmentTime: yesterdayAt13,
      price: 900,
      status: 'Завершен',
    },
  });

  // --- Cancelled appointment ---
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoAt11 = new Date(twoDaysAgo);
  twoDaysAgoAt11.setHours(11, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      clientSurname: 'Лебедева',
      clientName: 'Светлана',
      clientPhone: '+79011112301',
      masterID: masterMariya.id,
      serviceId: serviceBotox.id,
      appointmentTime: twoDaysAgoAt11,
      price: 3000,
      status: 'Отменен',
    },
  });

  console.log('✅ Created completed and cancelled appointments');

  // --- Appointment History ---
  await prisma.appointmentHistory.createMany({
    data: [
      {
        appointmentId: completedAppt1.id,
        clientSurname: 'Федорова',
        clientName: 'Марина',
        clientPhone: '+79011112299',
        masterID: masterElena.id,
        serviceId: serviceStrizhkaZh.id,
        appointmentTime: yesterdayAt10,
        price: 1500,
      },
      {
        appointmentId: completedAppt2.id,
        clientSurname: 'Соколова',
        clientName: 'Дарья',
        clientPhone: '+79011112300',
        masterID: masterAnna.id,
        serviceId: serviceUkladkaFenom.id,
        appointmentTime: yesterdayAt13,
        price: 900,
      },
    ],
  });

  console.log('✅ Created 2 appointment history records');

  // --- Master Time Off ---
  const vacationStart = new Date(today);
  vacationStart.setDate(vacationStart.getDate() + 14);
  const vacationEnd = new Date(vacationStart);
  vacationEnd.setDate(vacationEnd.getDate() + 6);

  const sickLeaveStart = new Date(today);
  sickLeaveStart.setDate(sickLeaveStart.getDate() + 3);
  const sickLeaveEnd = new Date(sickLeaveStart);
  sickLeaveEnd.setDate(sickLeaveEnd.getDate() + 1);

  await prisma.masterTimeOff.createMany({
    data: [
      {
        masterId: masterElena.id,
        startDate: vacationStart,
        endDate: vacationEnd,
        type: 'vacation',
        comment: 'Ежегодный отпуск',
      },
      {
        masterId: masterAnna.id,
        startDate: sickLeaveStart,
        endDate: sickLeaveEnd,
        type: 'sick_leave',
        comment: 'Больничный',
      },
    ],
  });

  console.log('✅ Created 2 master time-off entries');
}

async function main() {
  console.log('🌱 Starting data seed...');
  await seedData();
  console.log('🎉 Data seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
