const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedData() {
  const categoryCount = await prisma.category.count();
  if (categoryCount > 0) {
    console.log('⏭️ Database already has data, skipping data seed');
    return;
  }
  const [catStrizhki, catOkr, catUklad, catUhod] = await Promise.all([
    prisma.category.create({
      data: {
        title: 'Стрижки',
        description: 'Все виды стрижек',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        title: 'Окрашивание',
        description: 'Окрашивание волос любой сложности',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        title: 'Укладка и стайлинг',
        description: 'Укладки на все случаи жизни',
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        title: 'Уход за волосами',
        description: 'Восстанавливающие и питательные процедуры',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created 4 categories');
  const [
    svc1, svc2, svc3, svc4, svc5, svc6, svc7, svc8, svc9, svc10, svc11, svc12, svc13, svc14,
  ] = await Promise.all([
    prisma.service.create({ data: { title: 'Стрижка женская', description: 'Женская стрижка любой сложности', duration: 60, categoryId: catStrizhki.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Стрижка мужская', description: 'Мужская стрижка', duration: 45, categoryId: catStrizhki.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Стрижка челки', description: 'Корекция челки', duration: 15, categoryId: catStrizhki.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Стрижка по форме', description: 'Модельная стрижка', duration: 90, categoryId: catStrizhki.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Окрашивание корней', description: 'Окрашивание отросших корней', duration: 60, categoryId: catOkr.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Окрашивание полное', description: 'Полное окрашивание', duration: 120, categoryId: catOkr.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Мелирование', description: 'Классическое мелирование', duration: 150, categoryId: catOkr.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Тонирование', description: 'Тонирование волос', duration: 45, categoryId: catOkr.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Укладка феном', description: 'Брашинг', duration: 40, categoryId: catUklad.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Укладка плойкой', description: 'Укладка щипцами', duration: 60, categoryId: catUklad.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Вечерняя укладка', description: 'Свадебная и вечерняя', duration: 75, categoryId: catUklad.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Кератин', description: 'Выпрямление кератином', duration: 120, categoryId: catUhod.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Ботокс волос', description: 'Восстановление ботоксом', duration: 90, categoryId: catUhod.id, isActive: true } }),
    prisma.service.create({ data: { title: 'Ламинирование', description: 'Ламинирование волос', duration: 60, categoryId: catUhod.id, isActive: true } }),
  ]);
  console.log('✅ Created 14 services');
  const [m1, m2, m3] = await Promise.all([
    prisma.master.create({ data: { surname: 'Иванова', name: 'Елена', middlename: 'Александровна', specialization: 'Стилист-колорист', phone: '+79001234567', isActive: true } }),
    prisma.master.create({ data: { surname: 'Петрова', name: 'Мария', middlename: 'Сергеевна', specialization: 'Мастер универсал', phone: '+79001234568', isActive: true } }),
    prisma.master.create({ data: { surname: 'Козлова', name: 'Анна', middlename: 'Дмитриевна', specialization: 'Парикмахер-стилист', phone: '+79001234569', isActive: true } }),
  ]);
  console.log('✅ Created 3 masters');

  async function createPrices(masterId, prices) {
    await Promise.all(
      prices.map(([sid, p]) =>
        prisma.servicePrice.create({ data: { masterID: masterId, serviceId: sid, price: p, isActive: true } })
      )
    );
  }
  await createPrices(m1.id, [
    [svc1.id, 1500], [svc2.id, 1000], [svc3.id, 500], [svc4.id, 2500],
    [svc5.id, 2000], [svc6.id, 4500], [svc7.id, 5000], [svc8.id, 1500],
    [svc9.id, 800], [svc10.id, 1200], [svc11.id, 2000], [svc12.id, 4000],
    [svc13.id, 3500], [svc14.id, 2500],
  ]);
  await createPrices(m2.id, [
    [svc1.id, 1200], [svc2.id, 900], [svc3.id, 400], [svc4.id, 2000],
    [svc5.id, 1800], [svc6.id, 4000], [svc7.id, 4500], [svc8.id, 1200],
    [svc9.id, 800], [svc10.id, 1000], [svc11.id, 1800], [svc12.id, 3500],
    [svc13.id, 3000], [svc14.id, 2000],
  ]);
  await createPrices(m3.id, [
    [svc1.id, 1400], [svc2.id, 950], [svc3.id, 450], [svc4.id, 2200],
    [svc5.id, 1800], [svc6.id, 4000], [svc7.id, 4500], [svc8.id, 1300],
    [svc9.id, 900], [svc10.id, 1100], [svc11.id, 2200], [svc12.id, 3800],
    [svc13.id, 3200], [svc14.id, 2200],
  ]);
  console.log('✅ Created 42 service prices');

  const toDate = (h) => new Date('1970-01-01T' + String(h).padStart(2, '0') + ':00:00');
  for (let day = 1; day <= 6; day++) {
    await prisma.masterSchedule.create({ data: { masterID: m1.id, dayOfWeek: day, startTime: toDate(9), endTime: toDate(18) } });
    await prisma.masterSchedule.create({ data: { masterID: m2.id, dayOfWeek: day, startTime: toDate(10), endTime: toDate(19) } });
    await prisma.masterSchedule.create({ data: { masterID: m3.id, dayOfWeek: day, startTime: toDate(9), endTime: toDate(18) } });
  }
  console.log('✅ Created master schedules');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const fmt = (d, h) => { const r = new Date(d); r.setHours(h, 0, 0, 0); return r; };
  const [a1, a2, a3, a4, a5, a6] = await Promise.all([
    prisma.appointment.create({ data: { clientSurname: 'Смирнова', clientName: 'Ольга', clientPhone: '+79011112233', masterID: m1.id, serviceId: svc6.id, appointmentTime: fmt(today, 10), price: 4500, status: 'Подтвержден' } }),
    prisma.appointment.create({ data: { clientSurname: 'Кузнецова', clientName: 'Наталья', clientPhone: '+79011112244', masterID: m2.id, serviceId: svc1.id, appointmentTime: fmt(today, 14), price: 1200, status: 'Новый' } }),
    prisma.appointment.create({ data: { clientSurname: 'Попова', clientName: 'Екатерина', clientPhone: '+79011112255', masterID: m3.id, serviceId: svc11.id, appointmentTime: fmt(tomorrow, 11), price: 2200, status: 'Новый' } }),
    prisma.appointment.create({ data: { clientSurname: 'Васильева', clientName: 'Татьяна', clientPhone: '+79011112266', masterID: m1.id, serviceId: svc7.id, appointmentTime: fmt(tomorrow, 15), price: 5000, status: 'Подтвержден' } }),
    prisma.appointment.create({ data: { clientSurname: 'Новикова', clientName: 'Ирина', clientPhone: '+79011112277', masterID: m2.id, serviceId: svc12.id, appointmentTime: fmt(dayAfter, 12), price: 3500, status: 'Новый' } }),
    prisma.appointment.create({ data: { clientSurname: 'Морозова', clientName: 'Анна', clientPhone: '+79011112288', masterID: m3.id, serviceId: svc4.id, appointmentTime: fmt(nextWeek, 10), price: 2200, status: 'Новый' } }),
  ]);
  console.log('✅ Created 6 upcoming appointments');

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const [c1, c2] = await Promise.all([
    prisma.appointment.create({ data: { clientSurname: 'Федорова', clientName: 'Марина', clientPhone: '+79011112299', masterID: m1.id, serviceId: svc1.id, appointmentTime: fmt(yesterday, 10), price: 1500, status: 'Завершен' } }),
    prisma.appointment.create({ data: { clientSurname: 'Соколова', clientName: 'Дарья', clientPhone: '+79011112300', masterID: m3.id, serviceId: svc9.id, appointmentTime: fmt(yesterday, 13), price: 900, status: 'Завершен' } }),
  ]);
  const twoAgo = new Date(today);
  twoAgo.setDate(twoAgo.getDate() - 2);
  await prisma.appointment.create({ data: { clientSurname: 'Лебедева', clientName: 'Светлана', clientPhone: '+79011112301', masterID: m2.id, serviceId: svc13.id, appointmentTime: fmt(twoAgo, 11), price: 3000, status: 'Отменен' } });
  console.log('✅ Created completed+cancelled appointments');
  await prisma.appointmentHistory.createMany({
    data: [
      { appointmentId: c1.id, clientSurname: 'Федорова', clientName: 'Марина', clientPhone: '+79011112299', masterID: m1.id, serviceId: svc1.id, appointmentTime: fmt(yesterday, 10), price: 1500 },
      { appointmentId: c2.id, clientSurname: 'Соколова', clientName: 'Дарья', clientPhone: '+79011112300', masterID: m3.id, serviceId: svc9.id, appointmentTime: fmt(yesterday, 13), price: 900 },
    ],
  });
  console.log('✅ Created 2 appointment history records');

  const vac = new Date(today);
  vac.setDate(vac.getDate() + 14);
  const vacEnd = new Date(vac);
  vacEnd.setDate(vacEnd.getDate() + 6);
  const sick = new Date(today);
  sick.setDate(sick.getDate() + 3);
  const sickEnd = new Date(sick);
  sickEnd.setDate(sickEnd.getDate() + 1);
  await prisma.masterTimeOff.createMany({
    data: [
      { masterId: m1.id, startDate: vac, endDate: vacEnd, type: 'vacation', comment: 'Ежегодный отпуск' },
      { masterId: m3.id, startDate: sick, endDate: sickEnd, type: 'sick_leave', comment: 'Больничный' },
    ],
  });
  console.log('✅ Created 2 time-off entries');
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
