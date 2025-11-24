"use client";
import { useState, useEffect } from 'react';
import EmployeesCard from "@/app/components/ui/admin/employees/employeesCard";
import { masterService } from '@/services/master/master.service';
import { IMaster } from '@/types/masters.type';
import { formatPhoneNumber } from '@/app/lib/formatPhoneNumber';

export default function Employees() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Загрузка данных
  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      setLoading(true);
      const data = await masterService.getAll();
      setMasters(data);
    } catch (error) {
      console.error('Ошибка загрузки мастеров:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация мастеров
  const filteredMasters = masters.filter(master => {
    const matchesSearch = 
      master.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      master.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      master.middlename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      master.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (master.phone && master.phone.includes(searchTerm)); // проверка на существование phone

    const matchesSpecialization = 
      !specializationFilter || 
      master.specialization.toLowerCase().includes(specializationFilter.toLowerCase());

    const matchesStatus = 
      !statusFilter || 
      (statusFilter === 'active' && master.isActive) ||
      (statusFilter === 'inactive' && !master.isActive);

    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  // Статистика
  const totalMasters = masters.length;
  const activeMasters = masters.filter(master => master.isActive).length;
  const inactiveMasters = masters.filter(master => !master.isActive).length;

  const handleCreateMaster = async (masterData: any) => {
    try {
      // Очищаем номер телефона от форматирования перед отправкой
      const cleanedPhone = masterData.phone.replace(/\D/g, '');
      await masterService.create({
        ...masterData,
        phone: cleanedPhone
      });
      await loadMasters();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Ошибка создания мастера:', error);
      throw error;
    }
  };

  const handleDeleteMaster = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этого мастера?')) {
      try {
        await masterService.delete(id);
        await loadMasters();
      } catch (error) {
        console.error('Ошибка удаления мастера:', error);
        alert('Ошибка при удалении мастера');
      }
    }
  };

  const handleUpdateMaster = async (id: number, masterData: any) => {
    try {
      // Очищаем номер телефона от форматирования перед отправкой
      if (masterData.phone) {
        masterData.phone = masterData.phone.replace(/\D/g, '');
      }
      
      await masterService.update(id, masterData);
      await loadMasters();
    } catch (error) {
      console.error('Ошибка обновления мастера:', error);
      alert('Ошибка при обновлении данных мастера');
    }
  };

  const handleToggleStatus = async (master: IMaster) => {
    try {
      await masterService.update(master.id!, { isActive: !master.isActive });
      await loadMasters();
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      alert('Ошибка при изменении статуса мастера');
    }
  };

  // Безопасное форматирование телефона
  const safeFormatPhone = (phone: string | undefined): string => {
    if (!phone) return 'Не указан';
    return formatPhoneNumber(phone);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="">
        {/* Заголовок и управление */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Управление сотрудниками
              </h1>
              <p className="text-gray-600">
                Создавайте и управляйте профилями мастеров и сотрудников
              </p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Новый сотрудник
            </button>
          </div>

          {/* Фильтры и поиск */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Поиск по имени, фамилии, специализации или телефону..."
                    className="w-full pl-10 pr-4 py-3 border text-black border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select 
                className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
              >
                <option value="">Все специализации</option>
                <option value="парикмахер">Парикмахер</option>
                <option value="массажист">Массажист</option>
                <option value="косметолог">Косметолог</option>
                <option value="маникюр">Мастер маникюра</option>
                <option value="визажист">Визажист</option>
                <option value="стилист">Стилист</option>
              </select>
              <select 
                className="px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="inactive">Неактивные</option>
              </select>
            </div>

            {/* Сортировка */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 font-medium mr-2">Сортировка:</span>
              {["имени", "специализации", "дате добавления", "статусу"].map((field) => (
                <button
                  key={field}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors duration-200"
                >
                  По {field}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Статистика в карточках */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
            <div className="text-3xl font-bold mb-2">{totalMasters}</div>
            <div className="text-blue-100">Всего сотрудников</div>
            <div className="text-sm text-blue-200 mt-1">
              Зарегистрировано в системе
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
            <div className="text-3xl font-bold mb-2">{activeMasters}</div>
            <div className="text-green-100">Активные</div>
            <div className="text-sm text-green-200 mt-1">
              Сейчас работают
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
            <div className="text-3xl font-bold mb-2">
              {masters.length > 0 ? Math.round(masters.reduce((acc, master) => acc + 4.8, 0) / masters.length * 10) / 10 : 0}
            </div>
            <div className="text-purple-100">Средний рейтинг</div>
            <div className="text-sm text-purple-200 mt-1">
              По отзывам клиентов
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:-translate-y-2 transition-all duration-200">
            <div className="text-3xl font-bold mb-2">{inactiveMasters}</div>
            <div className="text-orange-100">Неактивные</div>
            <div className="text-sm text-orange-200 mt-1">
              Недоступны для записи
            </div>
          </div>
        </div>

        {/* Контент страницы */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Список сотрудников</h2>
            <span className="text-sm text-gray-500">
              Показано: {filteredMasters.length} из {totalMasters}
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Загрузка данных...</p>
            </div>
          ) : filteredMasters.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-lg mb-2">
                {masters.length === 0 ? 'Список сотрудников пуст' : 'Мастеры не найдены'}
              </p>
              <p className="text-sm mb-4">
                {masters.length === 0 
                  ? 'Создайте первого сотрудника, чтобы начать работу' 
                  : 'Попробуйте изменить параметры поиска или фильтры'
                }
              </p>
              {masters.length === 0 && (
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Создать сотрудника
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMasters.map((master) => (
                <div key={master.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {master.photo ? (
                        <img 
                          src={master.photo} 
                          alt={`${master.name} ${master.surname}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        `${master.name[0]}${master.surname[0]}`
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {master.surname} {master.name} {master.middlename}
                      </h3>
                      <p className="text-gray-600 text-sm">{master.specialization}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {safeFormatPhone(master.phone)}
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        master.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {master.isActive ? 'Активен' : 'Неактивен'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggleStatus(master)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        master.isActive 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {master.isActive ? 'Деактивировать' : 'Активировать'}
                    </button>
                    <button 
                      onClick={() => handleDeleteMaster(master.id!)}
                      className="py-2 px-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно создания сотрудника */}
      {isCreateModalOpen && (
        <EmployeesCard 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateMaster}
        />
      )}
    </div>
  );
}