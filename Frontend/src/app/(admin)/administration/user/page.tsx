"use client";

import { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";

export default function MasterUsersPage() {
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [form, setForm] = useState({ login: "", password: "", masterId: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([masterService.getAll(), userService.getAllMastersUsers()])
      .then(([mastersRes, usersRes]) => {
        setMasters(mastersRes);
        setUsers(usersRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Создаем словарь имен мастеров для быстрого поиска
  const mastersLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    masters.forEach((m) => {
      lookup[String(m.id)] = `${m.surname} ${m.name}`;
    });
    return lookup;
  }, [masters]);

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
      const res = await userService.getAllMastersUsers();
      setUsers(res.data);
      alert("Доступ успешно создан");
    } catch (err) {
      alert("Ошибка при создании");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Удалить учетную запись этого мастера?")) return;
    try {
      await userService.deleteMasterUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      alert("Ошибка удаления");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-black">
      <div className="max-w-5xl mx-auto">
        {/* Заголовок */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            Доступы мастеров
          </h1>
          <p className="text-gray-500 mt-2">
            Управление логинами и паролями для входа сотрудников в систему
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Форма создания */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                Создать аккаунт
              </h2>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Логин
                  </label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 absolute left-3 top-4 text-gray-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Напр: ivanov_pro"
                      value={form.login}
                      onChange={(e) =>
                        setForm({ ...form, login: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пароль
                  </label>
                  <div className="relative">
                    <Key className="w-5 h-5 absolute left-3 top-4 text-gray-400" />

                    <input
                      // Динамически меняем тип поля
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />

                    {/* Кнопка-глаз */}
                    <button
                      type="button" // Важно: type="button", чтобы не срабатывал submit формы
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-4 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Привязать к мастеру
                  </label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
                    value={form.masterId}
                    onChange={(e) =>
                      setForm({ ...form, masterId: e.target.value })
                    }
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
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mt-2"
                >
                  Создать доступ
                </button>
              </form>
            </div>
          </div>

          {/* Список пользователей */}
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
                  <div className="p-10 text-center text-gray-400">
                    Загрузка...
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                    <p className="text-gray-500">Пользователи еще не созданы</p>
                  </div>
                ) : (
                  users.map((u) => (
                    <div
                      key={u.id}
                      className="flex justify-between items-center p-5 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                          {u.login[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {u.login}
                          </div>
                          <div className="text-xs text-blue-600 font-medium uppercase tracking-wider">
                            {mastersLookup[String(u.masterId)] ||
                              `Мастер ID: ${u.masterId}`}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Удалить аккаунт"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
