"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { userService } from "@/services/user/user.service";
import { masterService } from "@/services/master/master.service";
import { IMaster } from "@/types/masters.type";
import { IUser } from "@/types/user.types";
import {
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  Users,
  ShieldCheck,
  Key,
  User as UserIcon,
  Crown,
  BadgeCheck,
} from "lucide-react";

export default function MasterUsersPage() {
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [form, setForm] = useState({ login: "", password: "", masterId: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Выносим загрузку данных в отдельную функцию, чтобы вызывать её при инициализации и после создания
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [mastersRes, mastersUsersRes, adminsRes] = await Promise.all([
        masterService.getAll(),
        userService.getAllMastersUsers(),
        userService.getAllAdminsUsers(), // Ваш новый метод
      ]);

      setMasters(mastersRes);

      // Объединяем пользователей-мастеров и администраторов в один массив
      // Проверяем наличие .data, так как axios возвращает объект ответа
      const combinedUsers = [
        ...(mastersUsersRes.data || []),
        ...(adminsRes.data || []),
      ];
      setUsers(combinedUsers);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Словарь имен мастеров
  const mastersLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    masters.forEach((m) => {
      lookup[String(m.id)] = `${m.surname} ${m.name}`;
    });
    return lookup;
  }, [masters]);

  // Фильтрация пользователей по ролям (регистронезависимая)
  const adminUsers = useMemo(() => {
    return users.filter((u) => {
      const role = u.role?.toLowerCase();
      return role === "admin" || role === "administrator";
    });
  }, [users]);

  const regularUsers = useMemo(() => {
    return users.filter((u) => {
      const role = u.role?.toLowerCase();
      return role !== "admin" && role !== "administrator";
    });
  }, [users]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.login || !form.password || !form.masterId) {
      alert("Заполните все поля");
      return;
    }

    try {
      await userService.createMasterUser({
        login: form.login,
        password: form.password,
        masterId: Number(form.masterId),
      });

      setForm({ login: "", password: "", masterId: "" });
      await fetchAllData(); // Обновляем весь список после создания
      alert("Доступ успешно создан");
    } catch (err) {
      alert("Ошибка при создании");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Удалить учетную запись?")) return;
    try {
      await userService.deleteMasterUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Ошибка удаления");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
      case "administrator":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "master":
        return <BadgeCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-black">
      <div className="max-w-5xl mx-auto">
        {/* Заголовок */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            Доступы и аккаунты
          </h1>
          <p className="text-gray-500 mt-2">
            Управление администраторами и учетными записями мастеров
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Форма создания (только для мастеров) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                Создать аккаунт мастера
              </h2>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 absolute left-3 top-4 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Введите логин например: ivanov_pro"
                      value={form.login}
                      onChange={(e) => setForm({ ...form, login: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                  <div className="relative">
                    <Key className="w-5 h-5 absolute left-3 top-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Введите пароль"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-4 text-gray-400 hover:text-blue-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Привязать к мастеру</label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
                    value={form.masterId}
                    onChange={(e) => setForm({ ...form, masterId: e.target.value })}
                  >
                    <option value="">Выберите сотрудника</option>
                    {masters.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.surname} {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all mt-2"
                >
                  Создать доступ
                </button>
              </form>
            </div>
          </div>

          {/* Список */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  Действующие аккаунты
                </h2>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                  Всего: {users.length}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-10 text-center text-gray-400 italic">Загрузка данных...</div>
                ) : users.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">Пользователи не найдены</div>
                ) : (
                  <>
                    {/* Секция АДМИНОВ */}
                    {adminUsers.length > 0 && (
                      <div className="p-4 bg-yellow-50/50 border-b border-yellow-100">
                        <h3 className="text-xs font-bold text-yellow-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                          <Crown className="w-3 h-3" /> Администраторы системы
                        </h3>
                        <div className="space-y-3">
                          {adminUsers.map((u) => (
                            <div key={u.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-yellow-200 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 border border-yellow-200">
                                  <Crown className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">{u.login}</div>
                                  <div className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded uppercase font-bold inline-block">
                                    {u.role}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Секция МАСТЕРОВ */}
                    <div className="p-4">
                      <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                        Аккаунты сотрудников
                      </h3>
                      <div className="space-y-2">
                        {regularUsers.map((u) => (
                          <div key={u.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors group border rounded-xl border-gray-100">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 uppercase">
                                {u.login[0]}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{u.login}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-bold">
                                    {u.role || "MASTER"}
                                  </span>
                                  {u.masterId && (
                                    <span className="text-xs text-gray-500">
                                      • {mastersLookup[String(u.masterId)] || "Мастер"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}