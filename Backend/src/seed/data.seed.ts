import { PrismaService } from '../prisma.service';

export async function seedData(prisma: PrismaService) {
  const existingCategory = await prisma.category.findFirst();
  if (existingCategory) return;

  const categories = await prisma.category.createManyAndReturn({
    data: [
      {
        title: 'Стрижки',
        description: 'Все виды стрижек: женские, мужские, детские',
        isActive: true,
      },
      {
        title: 'Окрашивание',
        description: 'Окрашивание, мелирование, балаяж, шатуш',
        isActive: true,
      },
      {
        title: 'Укладка',
        description: 'Вечерние и повседневные укладки, брашинг',
        isActive: true,
      },
    ],
  });

  const categoryMap = Object.fromEntries(categories.map((c) => [c.title, c.id]));

  const masters = await prisma.master.createManyAndReturn({
    data: [
      {
        surname: 'Иванова',
        name: 'Елена',
        middlename: 'Сергеевна',
        specialization: 'Стилист-колорист',
        phone: '+7 (900) 111-22-33',
        isActive: true,
      },
      {
        surname: 'Петрова',
        name: 'Анна',
        middlename: 'Владимировна',
        specialization: 'Парикмахер-модельер',
        phone: '+7 (900) 444-55-66',
        isActive: true,
      },
      {
        surname: 'Сидорова',
        name: 'Ольга',
        middlename: 'Александровна',
        specialization: 'Мастер мужской стрижки',
        phone: '+7 (900) 777-88-99',
        isActive: true,
      },
    ],
  });

  const [elena, anna, olga] = masters;

  const services = await prisma.service.createManyAndReturn({
    data: [
      {
        title: 'Женская стрижка',
        description: 'Модельная женская стрижка с мытьём и укладкой',
        duration: 60,
        isActive: true,
        categoryId: categoryMap['Стрижки'],
      },
      {
        title: 'Мужская стрижка',
        description: 'Классическая и модельная мужская стрижка',
        duration: 40,
        isActive: true,
        categoryId: categoryMap['Стрижки'],
      },
      {
        title: 'Детская стрижка',
        description: 'Стрижка для детей до 12 лет',
        duration: 30,
        isActive: true,
        categoryId: categoryMap['Стрижки'],
      },
      {
        title: 'Окрашивание в один тон',
        description: 'Однотонное окрашивание волос',
        duration: 120,
        isActive: true,
        categoryId: categoryMap['Окрашивание'],
      },
      {
        title: 'Мелирование',
        description: 'Классическое и креативное мелирование',
        duration: 150,
        isActive: true,
        categoryId: categoryMap['Окрашивание'],
      },
      {
        title: 'Балаяж',
        description: 'Модное окрашивание балаяж',
        duration: 180,
        isActive: true,
        categoryId: categoryMap['Окрашивание'],
      },
      {
        title: 'Вечерняя укладка',
        description: 'Создание вечерней причёски и укладки',
        duration: 60,
        isActive: true,
        categoryId: categoryMap['Укладка'],
      },
      {
        title: 'Брашинг',
        description: 'Укладка феном с круглой расчёской',
        duration: 40,
        isActive: true,
        categoryId: categoryMap['Укладка'],
      },
    ],
  });

  const [
    womenHaircut,
    menHaircut,
    kidsHaircut,
    singleColor,
    highlighting,
    balayage,
    eveningStyle,
    brushing,
  ] = services;

  await prisma.servicePrice.createMany({
    data: [
      { serviceId: womenHaircut.id, masterID: elena.id, price: 2500, isActive: true },
      { serviceId: womenHaircut.id, masterID: anna.id, price: 2000, isActive: true },
      { serviceId: menHaircut.id, masterID: olga.id, price: 1500, isActive: true, durationOverride: 30 },
      { serviceId: menHaircut.id, masterID: anna.id, price: 1200, isActive: true },
      { serviceId: kidsHaircut.id, masterID: anna.id, price: 800, isActive: true, durationOverride: 25 },
      { serviceId: singleColor.id, masterID: elena.id, price: 5000, isActive: true },
      { serviceId: singleColor.id, masterID: anna.id, price: 4500, isActive: true },
      { serviceId: highlighting.id, masterID: elena.id, price: 7000, isActive: true },
      { serviceId: balayage.id, masterID: elena.id, price: 9000, isActive: true },
      { serviceId: eveningStyle.id, masterID: elena.id, price: 3000, isActive: true },
      { serviceId: eveningStyle.id, masterID: anna.id, price: 2500, isActive: true },
      { serviceId: brushing.id, masterID: anna.id, price: 1500, isActive: true },
      { serviceId: brushing.id, masterID: olga.id, price: 1200, isActive: true },
    ],
  });

  const baseDate = new Date('2026-06-15T00:00:00');

  const scheduleData = [];
  for (const master of masters) {
    for (let day = 1; day <= 5; day++) {
      scheduleData.push({
        masterID: master.id,
        dayOfWeek: day,
        startTime: new Date(baseDate.getTime() + day * 86400000 + 9 * 3600000),
        endTime: new Date(baseDate.getTime() + day * 86400000 + 18 * 3600000),
      });
    }
  }

  await prisma.masterSchedule.createMany({ data: scheduleData });

  await prisma.masterTimeOff.createMany({
    data: [
      {
        masterId: elena.id,
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-14'),
        type: 'vacation',
        comment: 'Очередной отпуск',
      },
      {
        masterId: olga.id,
        startDate: new Date('2026-06-25'),
        endDate: new Date('2026-06-26'),
        type: 'day_off',
        comment: 'Отгул по личным обстоятельствам',
      },
    ],
  });

  await prisma.appointment.createMany({
    data: [
      {
        clientSurname: 'Козлова',
        clientName: 'Мария',
        clientPhone: '+7 (911) 222-33-44',
        comment: 'Предпочитает тёплые оттенки',
        masterID: elena.id,
        serviceId: balayage.id,
        appointmentTime: new Date('2026-06-16T10:00:00'),
        price: 9000,
        status: 'Подтвержден',
      },
      {
        clientSurname: 'Новиков',
        clientName: 'Дмитрий',
        clientPhone: '+7 (911) 555-66-77',
        masterID: olga.id,
        serviceId: menHaircut.id,
        appointmentTime: new Date('2026-06-16T11:00:00'),
        price: 1500,
        status: 'Новый',
      },
      {
        clientSurname: 'Федорова',
        clientName: 'Ирина',
        clientPhone: '+7 (911) 888-99-00',
        masterID: anna.id,
        serviceId: womenHaircut.id,
        appointmentTime: new Date('2026-06-14T14:00:00'),
        price: 2000,
        status: 'Завершен',
      },
      {
        clientSurname: 'Смирнов',
        clientName: 'Алексей',
        clientPhone: '+7 (911) 123-45-67',
        comment: 'Позвонить за день до записи',
        masterID: anna.id,
        serviceId: brushing.id,
        appointmentTime: new Date('2026-06-17T15:00:00'),
        price: 1500,
        status: 'Новый',
      },
      {
        clientSurname: 'Волкова',
        clientName: 'Татьяна',
        clientPhone: '+7 (911) 987-65-43',
        masterID: elena.id,
        serviceId: eveningStyle.id,
        appointmentTime: new Date('2026-06-10T16:00:00'),
        price: 3000,
        status: 'Отменен',
      },
    ],
  });
}
