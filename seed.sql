-- Отключаем проверку внешних ключей для быстрой вставки
SET session_replication_role = 'replica';

-- Очищаем таблицы в правильном порядке (от зависимых к родительским)
TRUNCATE TABLE appointment_history CASCADE;
TRUNCATE TABLE appointment CASCADE;
TRUNCATE TABLE master_time_off CASCADE;
TRUNCATE TABLE master_schedule CASCADE;
TRUNCATE TABLE service_price CASCADE;
TRUNCATE TABLE "user" CASCADE;
TRUNCATE TABLE master CASCADE;
TRUNCATE TABLE service CASCADE;
TRUNCATE TABLE category CASCADE;

-- Включаем обратно проверку внешних ключей
SET session_replication_role = 'origin';

-- Сброс счетчиков автоинкремента
ALTER SEQUENCE category_id_seq RESTART WITH 1;
ALTER SEQUENCE service_id_seq RESTART WITH 1;
ALTER SEQUENCE master_id_seq RESTART WITH 1;
ALTER SEQUENCE "user_id_seq" RESTART WITH 1;
ALTER SEQUENCE master_schedule_id_seq RESTART WITH 1;
ALTER SEQUENCE service_price_id_seq RESTART WITH 1;
ALTER SEQUENCE appointment_id_seq RESTART WITH 1;
ALTER SEQUENCE master_time_off_id_seq RESTART WITH 1;
ALTER SEQUENCE appointment_history_id_seq RESTART WITH 1;

-- 1. Заполнение категорий
INSERT INTO category (title, description, is_active) VALUES
('Стрижки', 'Профессиональные стрижки любой сложности', true),
('Маникюр', 'Уход за ногтями и кожей рук', true),
('Педикюр', 'Уход за ногтями и кожей ног', true),
('Уход за лицом', 'Косметологические процедуры для лица', true),
('Макияж', 'Дневной, вечерний, свадебный макияж', true),
('Массаж', 'Лечебный и расслабляющий массаж', true),
('Оформление бровей', 'Коррекция, окрашивание, ламинирование', true),
('Укладки', 'Создание причесок любой сложности', true),
('Окрашивание', 'Окрашивание волос любой сложности', true),
('СПА-процедуры', 'Релаксирующие и оздоровительные процедуры', true);

-- 2. Заполнение услуг
INSERT INTO service (title, description, duration, img, is_active, category_id) VALUES
-- Стрижки
('Мужская стрижка', 'Классическая мужская стрижка с учетом формы лица', 45, 'https://example.com/images/mens_haircut.jpg', true, 1),
('Женская стрижка', 'Модельная женская стрижка любой сложности', 60, 'https://example.com/images/womens_haircut.jpg', true, 1),
('Детская стрижка', 'Стрижка для детей от 3 до 12 лет', 30, 'https://example.com/images/kids_haircut.jpg', true, 1),
('Стрижка бороды', 'Моделирование и стрижка бороды', 30, 'https://example.com/images/beard_trim.jpg', true, 1),

-- Маникюр
('Классический маникюр', 'Обрезной маникюр с покрытием', 60, 'https://example.com/images/classic_manicure.jpg', true, 2),
('Аппаратный маникюр', 'Безопасный аппаратный маникюр', 50, 'https://example.com/images/hardware_manicure.jpg', true, 2),
('Покрытие гель-лак', 'Стойкое покрытие гель-лаком', 40, 'https://example.com/images/gel_polish.jpg', true, 2),

-- Педикюр
('Классический педикюр', 'Обрезной педикюр с покрытием', 90, 'https://example.com/images/classic_pedicure.jpg', true, 3),
('Аппаратный педикюр', 'Безопасный аппаратный педикюр', 80, 'https://example.com/images/hardware_pedicure.jpg', true, 3),

-- Уход за лицом
('Чистка лица', 'Глубокая чистка лица', 60, 'https://example.com/images/facial_cleaning.jpg', true, 4),
('Пилинг', 'Химический пилинг лица', 45, 'https://example.com/images/peeling.jpg', true, 4),

-- Макияж
('Дневной макияж', 'Естественный дневной макияж', 40, 'https://example.com/images/day_makeup.jpg', true, 5),
('Вечерний макияж', 'Яркий вечерний макияж', 60, 'https://example.com/images/evening_makeup.jpg', true, 5),

-- Массаж
('Классический массаж', 'Общеукрепляющий массаж', 60, 'https://example.com/images/classic_massage.jpg', true, 6),
('Антицеллюлитный массаж', 'Моделирующий антицеллюлитный массаж', 45, 'https://example.com/images/anti_cellulite.jpg', true, 6),

-- Оформление бровей
('Коррекция бровей', 'Коррекция формы бровей', 30, 'https://example.com/images/eyebrow_correction.jpg', true, 7),
('Окрашивание бровей', 'Окрашивание бровей краской', 25, 'https://example.com/images/eyebrow_coloring.jpg', true, 7),

-- Укладки
('Вечерняя укладка', 'Создание вечерней прически', 50, 'https://example.com/images/evening_styling.jpg', true, 8),
('Кератиновое выпрямление', 'Выпрямление волос кератином', 120, 'https://example.com/images/keratin_treatment.jpg', true, 8),

-- Окрашивание
('Однотонное окрашивание', 'Равномерное окрашивание волос', 90, 'https://example.com/images/single_color.jpg', true, 9),
('Мелирование', 'Частичное осветление прядей', 120, 'https://example.com/images/highlights.jpg', true, 9),

-- СПА-процедуры
('Обертывание', 'Шоколадное или водорослевое обертывание', 60, 'https://example.com/images/wrapping.jpg', true, 10),
('СПА-программа', 'Комплексная СПА-программа', 120, 'https://example.com/images/spa.jpg', true, 10);

-- 3. Заполнение мастеров
INSERT INTO master (surname, name, middle_name, specialization, phone, is_active, photo) VALUES
('Иванова', 'Анна', 'Сергеевна', 'Парикмахер-стилист', '+7 901 123-45-67', true, 'https://example.com/masters/anna_ivanova.jpg'),
('Петрова', 'Елена', 'Михайловна', 'Мастер маникюра', '+7 902 234-56-78', true, 'https://example.com/masters/elena_petrova.jpg'),
('Сидорова', 'Мария', 'Александровна', 'Косметолог', '+7 903 345-67-89', true, 'https://example.com/masters/maria_sidorova.jpg'),
('Кузнецова', 'Ольга', 'Владимировна', 'Визажист', '+7 904 456-78-90', true, 'https://example.com/masters/olga_kuznetsova.jpg'),
('Смирнов', 'Дмитрий', 'Алексеевич', 'Массажист', '+7 905 567-89-01', true, 'https://example.com/masters/dmitry_smirnov.jpg'),
('Волкова', 'Наталья', 'Дмитриевна', 'Бровист', '+7 906 678-90-12', true, 'https://example.com/masters/natalia_volkova.jpg'),
('Соколов', 'Алексей', 'Игоревич', 'Парикмахер-колорист', '+7 909 789-01-23', true, 'https://example.com/masters/alexey_sokolov.jpg'),
('Лебедева', 'Татьяна', 'Павловна', 'Мастер педикюра', '+7 910 890-12-34', true, 'https://example.com/masters/tatyana_lebedev.jpg'),
('Новикова', 'Ирина', 'Андреевна', 'Стилист', '+7 911 901-23-45', true, 'https://example.com/masters/irina_novikova.jpg'),
('Козлов', 'Андрей', 'Викторович', 'СПА-специалист', '+7 912 012-34-56', true, 'https://example.com/masters/andrey_kozlov.jpg');

-- 4. Заполнение пользователей (включая администратора admin/admin123)
INSERT INTO "user" (name, login, password, role, master_id, is_active) VALUES
-- ГЛАВНЫЙ АДМИНИСТРАТОР с логином admin и паролем admin123
('Главный администратор', 'admin', crypt('admin123', gen_salt('bf')), 'admin', NULL, true),

-- Остальные пользователи для мастеров
('Анна Иванова', 'anna.ivanova', crypt('password123', gen_salt('bf')), 'admin', 1, true),
('Елена Петрова', 'elena.petrova', crypt('password123', gen_salt('bf')), 'master', 2, true),
('Мария Сидорова', 'maria.sidorova', crypt('password123', gen_salt('bf')), 'admin', 3, true),
('Ольга Кузнецова', 'olga.kuznetsova', crypt('password123', gen_salt('bf')), 'master', 4, true),
('Дмитрий Смирнов', 'dmitry.smirnov', crypt('password123', gen_salt('bf')), 'master', 5, true),
('Наталья Волкова', 'natalia.volkova', crypt('password123', gen_salt('bf')), 'master', 6, true),
('Алексей Соколов', 'alexey.sokolov', crypt('password123', gen_salt('bf')), 'admin', 7, true),
('Татьяна Лебедева', 'tatyana.lebedev', crypt('password123', gen_salt('bf')), 'master', 8, true),
('Ирина Новикова', 'irina.novikova', crypt('password123', gen_salt('bf')), 'master', 9, true),
('Андрей Козлов', 'andrey.kozlov', crypt('password123', gen_salt('bf')), 'master', 10, true);

-- 5. Заполнение расписания мастеров
INSERT INTO master_schedule (master_id, day_of_week, start_time, end_time) VALUES
-- Понедельник (1) - Воскресенье (7)
(1, 1, '2024-01-01 09:00:00', '2024-01-01 18:00:00'),
(1, 2, '2024-01-02 09:00:00', '2024-01-02 18:00:00'),
(1, 3, '2024-01-03 10:00:00', '2024-01-03 19:00:00'),
(1, 4, '2024-01-04 09:00:00', '2024-01-04 18:00:00'),
(1, 5, '2024-01-05 09:00:00', '2024-01-05 17:00:00'),
(1, 6, '2024-01-06 10:00:00', '2024-01-06 15:00:00'),
(1, 7, '2024-01-07 00:00:00', '2024-01-07 00:00:00'), -- Выходной

(2, 1, '2024-01-01 10:00:00', '2024-01-01 19:00:00'),
(2, 2, '2024-01-02 10:00:00', '2024-01-02 19:00:00'),
(2, 3, '2024-01-03 09:00:00', '2024-01-03 18:00:00'),
(2, 4, '2024-01-04 10:00:00', '2024-01-04 19:00:00'),
(2, 5, '2024-01-05 10:00:00', '2024-01-05 18:00:00'),
(2, 6, '2024-01-06 09:00:00', '2024-01-06 14:00:00'),
(2, 7, '2024-01-07 00:00:00', '2024-01-07 00:00:00'),

(3, 1, '2024-01-01 08:00:00', '2024-01-01 17:00:00'),
(3, 2, '2024-01-02 08:00:00', '2024-01-02 17:00:00'),
(3, 3, '2024-01-03 12:00:00', '2024-01-03 21:00:00'),
(3, 4, '2024-01-04 08:00:00', '2024-01-04 17:00:00'),
(3, 5, '2024-01-05 08:00:00', '2024-01-05 16:00:00'),
(3, 6, '2024-01-06 09:00:00', '2024-01-06 14:00:00'),
(3, 7, '2024-01-07 00:00:00', '2024-01-07 00:00:00'),

(4, 1, '2024-01-01 10:00:00', '2024-01-01 19:00:00'),
(4, 2, '2024-01-02 10:00:00', '2024-01-02 19:00:00'),
(4, 3, '2024-01-03 10:00:00', '2024-01-03 19:00:00'),
(4, 4, '2024-01-04 12:00:00', '2024-01-04 21:00:00'),
(4, 5, '2024-01-05 10:00:00', '2024-01-05 18:00:00'),
(4, 6, '2024-01-06 10:00:00', '2024-01-06 15:00:00'),
(4, 7, '2024-01-07 00:00:00', '2024-01-07 00:00:00'),

(5, 1, '2024-01-01 09:00:00', '2024-01-01 18:00:00'),
(5, 2, '2024-01-02 09:00:00', '2024-01-02 18:00:00'),
(5, 3, '2024-01-03 09:00:00', '2024-01-03 18:00:00'),
(5, 4, '2024-01-04 09:00:00', '2024-01-04 18:00:00'),
(5, 5, '2024-01-05 09:00:00', '2024-01-05 17:00:00'),
(5, 6, '2024-01-06 00:00:00', '2024-01-06 00:00:00'), -- Выходной
(5, 7, '2024-01-07 00:00:00', '2024-01-07 00:00:00'); -- Выходной

-- 6. Заполнение цен на услуги
INSERT INTO service_price (service_id, master_id, price, is_active, duration_override)
SELECT 
    s.id as service_id,
    m.id as master_id,
    (random() * (5000 - 500) + 500)::decimal(10,2) as price,
    true as is_active,
    CASE 
        WHEN random() > 0.7 THEN s.duration + (random() * 60 - 30)::int
        ELSE NULL
    END as duration_override
FROM service s
CROSS JOIN master m
WHERE random() < 0.4 -- 40% вероятность создания цены для каждой пары мастер-услуга
LIMIT 150;

-- 7. Заполнение записей (Appointment)
DO $$
DECLARE
    i INTEGER;
    master_record RECORD;
    service_record RECORD;
    price_value DECIMAL(10,2);
    statuses TEXT[] := ARRAY['Завершен', 'Подтвержден', 'Новый', 'Отменен'];
    status_index INTEGER;
    appointment_date TIMESTAMP;
BEGIN
    FOR i IN 1..200 LOOP
        -- Выбираем случайного мастера и услугу
        SELECT * INTO master_record FROM master ORDER BY random() LIMIT 1;
        SELECT * INTO service_record FROM service ORDER BY random() LIMIT 1;
        
        -- Получаем цену для этого мастера и услуги
        SELECT price INTO price_value FROM service_price 
        WHERE master_id = master_record.id AND service_id = service_record.id 
        LIMIT 1;
        
        -- Если цены нет, используем базовую цену
        IF price_value IS NULL THEN
            price_value := (random() * (5000 - 500) + 500)::decimal(10,2);
        END IF;
        
        -- Случайный статус
        status_index := floor(random() * array_length(statuses, 1)) + 1;
        
        -- Случайная дата (с января по декабрь 2024)
        appointment_date := '2024-01-01'::timestamp + 
                           (random() * 365 * interval '1 day') +
                           (random() * 12 * interval '1 hour');
        
        -- Вставляем запись
        INSERT INTO appointment (
            client_surname, client_name, client_phone, 
            master_id, service_id, appointment_time, 
            price, status, created_at, updated_at
        ) VALUES (
            CASE floor(random() * 10)::int
                WHEN 0 THEN 'Иванов' WHEN 1 THEN 'Петров' WHEN 2 THEN 'Сидоров'
                WHEN 3 THEN 'Смирнов' WHEN 4 THEN 'Кузнецов' WHEN 5 THEN 'Волков'
                WHEN 6 THEN 'Соколов' WHEN 7 THEN 'Лебедев' WHEN 8 THEN 'Козлов'
                ELSE 'Новиков'
            END,
            CASE floor(random() * 10)::int
                WHEN 0 THEN 'Александр' WHEN 1 THEN 'Дмитрий' WHEN 2 THEN 'Максим'
                WHEN 3 THEN 'Артем' WHEN 4 THEN 'Иван' WHEN 5 THEN 'Михаил'
                WHEN 6 THEN 'Егор' WHEN 7 THEN 'Никита' WHEN 8 THEN 'Андрей'
                ELSE 'Сергей'
            END,
            '+7 9' || floor(random() * 100000000)::text,
            master_record.id,
            service_record.id,
            appointment_date,
            price_value,
            statuses[status_index],
            appointment_date - interval '1 day',
            appointment_date + interval '1 day'
        );
    END LOOP;
END $$;

-- 8. Заполнение истории записей
INSERT INTO appointment_history (
    appointment_id, client_surname, client_name, client_phone,
    master_id, service_id, appointment_time, price, completed_at
)
SELECT 
    a.id,
    a.client_surname,
    a.client_name,
    a.client_phone,
    a.master_id,
    a.service_id,
    a.appointment_time,
    a.price,
    a.appointment_time + (random() * interval '2 hours') as completed_at
FROM appointment a
WHERE a.status = 'Завершен';

-- 9. Заполнение отгулов мастеров
INSERT INTO master_time_off (master_id, start_date, end_date, type, comment, created_at, updated_at)
SELECT
    m.id as master_id,
    ('2024-' || 
     floor(random() * 12 + 1)::text || '-' ||
     floor(random() * 28 + 1)::text)::date as start_date,
    ('2024-' || 
     floor(random() * 12 + 1)::text || '-' ||
     floor(random() * 28 + 5)::text)::date as end_date,
    CASE floor(random() * 4)::int
        WHEN 0 THEN 'vacation'
        WHEN 1 THEN 'sick_leave'
        WHEN 2 THEN 'day_off'
        ELSE 'other'
    END as type,
    CASE 
        WHEN random() > 0.5 THEN 'По согласованию с администрацией'
        ELSE NULL
    END as comment,
    now() - (random() * interval '90 days'),
    now() - (random() * interval '30 days')
FROM master m
CROSS JOIN generate_series(1, floor(random() * 3 + 1)::int) -- 1-3 отгула на мастера
WHERE random() > 0.3; -- 70% мастеров имеют отгулы

-- Выводим статистику заполнения
DO $$
DECLARE
    category_count INTEGER;
    service_count INTEGER;
    master_count INTEGER;
    user_count INTEGER;
    schedule_count INTEGER;
    price_count INTEGER;
    appointment_count INTEGER;
    history_count INTEGER;
    timeoff_count INTEGER;
    admin_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO category_count FROM category;
    SELECT COUNT(*) INTO service_count FROM service;
    SELECT COUNT(*) INTO master_count FROM master;
    SELECT COUNT(*) INTO user_count FROM "user";
    SELECT COUNT(*) INTO schedule_count FROM master_schedule;
    SELECT COUNT(*) INTO price_count FROM service_price;
    SELECT COUNT(*) INTO appointment_count FROM appointment;
    SELECT COUNT(*) INTO history_count FROM appointment_history;
    SELECT COUNT(*) INTO timeoff_count FROM master_time_off;
    
    -- Проверяем наличие администратора
    SELECT EXISTS(SELECT 1 FROM "user" WHERE login = 'admin') INTO admin_exists;
    
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'База данных успешно заполнена!';
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'Категорий: %', category_count;
    RAISE NOTICE 'Услуг: %', service_count;
    RAISE NOTICE 'Мастеров: %', master_count;
    RAISE NOTICE 'Пользователей: %', user_count;
    RAISE NOTICE 'Записей в расписании: %', schedule_count;
    RAISE NOTICE 'Цен на услуги: %', price_count;
    RAISE NOTICE 'Записей клиентов: %', appointment_count;
    RAISE NOTICE 'Записей в истории: %', history_count;
    RAISE NOTICE 'Отгулов мастеров: %', timeoff_count;
    RAISE NOTICE '=========================================';
    
    IF admin_exists THEN
        RAISE NOTICE '✅ Администратор создан:';
        RAISE NOTICE '   Логин: admin';
        RAISE NOTICE '   Пароль: admin123';
    ELSE
        RAISE NOTICE '❌ Администратор НЕ создан!';
    END IF;
    RAISE NOTICE '=========================================';
END $$;