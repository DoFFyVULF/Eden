"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Search,
  Filter,
  Lock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  ChevronDown,
  X,
  Edit,
  Save,
} from "lucide-react";

type EditPasswordMode = "admin" | "master";

export default function MasterUsersPage() {
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [form, setForm] = useState({ login: "", password: "", masterId: "" });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Состояния для модального окна изменения пароля
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
    showPassword: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchAllData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const [mastersRes, mastersUsersRes, adminsRes] = await Promise.all([
        masterService.getAll(),
        userService.getAllMastersUsers(),
        userService.getAllAdminsUsers(),
      ]);

      setMasters(mastersRes.filter(m => m.isActive));
      
      const combinedUsers = [
        ...(mastersUsersRes.data || []),
        ...(adminsRes.data || []),
      ];
      setUsers(combinedUsers);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const mastersLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    masters.forEach((m) => {
      lookup[String(m.id)] = `${m.surname} ${m.name}`;
    });
    return lookup;
  }, [masters]);

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

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((u) =>
      u.login.toLowerCase().includes(q) ||
      (u.role?.toLowerCase() || "").includes(q) ||
      (mastersLookup[String(u.masterId)]?.toLowerCase() || "").includes(q) ||
      u.name.toLowerCase().includes(q)
    );
  }, [users, searchQuery, mastersLookup]);

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
      await fetchAllData(false);
    } catch (err) {
      alert("Ошибка при создании");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Удалить учетную запись? Это действие нельзя отменить.")) return;
    try {
      await userService.deleteMasterUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Ошибка удаления");
    }
  };

  const openPasswordModal = (user: IUser) => {
    setEditingUser(user);
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
      showPassword: false,
    });
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setEditingUser(null);
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
      showPassword: false,
    });
  };

  const handlePasswordChange = async () => {
    if (!editingUser) return;

    // Валидация
    if (passwordForm.newPassword.length < 6) {
      alert("Пароль должен быть не менее 6 символов");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }

    setChangingPassword(true);
    try {
      // Определяем endpoint в зависимости от типа пользователя
      const isAdmin = editingUser.role === "admin";
      
      if (isAdmin) {
        // Для администраторов используем общий endpoint
        await userService.resetPassword(editingUser.id, passwordForm.newPassword);
      } else {
        // Для мастеров используем специальный endpoint
        await userService.resetUserPassword(editingUser.id, passwordForm.newPassword);
      }
      
      alert("Пароль успешно изменен");
      closePasswordModal();
      
      // Обновляем данные
      await fetchAllData(false);
    } catch (err) {
      console.error("Ошибка при изменении пароля:", err);
      alert("Ошибка при изменении пароля");
    } finally {
      setChangingPassword(false);
    }
  };

  const stats = useMemo(() => {
    const total = users.length;
    const admins = adminUsers.length;
    const masters = regularUsers.length;
    const activeCount = users.filter(u => u.isActive).length;
    return { total, admins, masters, activeCount };
  }, [users, adminUsers, regularUsers]);

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
      case "administrator":
        return "from-amber-500 to-orange-500 text-white";
      case "master":
        return "from-blue-500 to-cyan-500 text-white";
      default:
        return "from-gray-500 to-gray-600 text-white";
    }
  };

  const getMasterColor = (id: number) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-emerald-500 to-green-500",
      "from-amber-500 to-orange-500",
      "from-rose-500 to-red-500",
      "from-indigo-500 to-blue-500",
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-8xl mx-auto">
        {/* Заголовок и управление */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Управление доступом
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Администраторы и учетные записи сотрудников
                  </p>
                </div>
              </motion.div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
              >
                <Filter className="w-4 h-4" />
                Поиск
                {isFilterOpen ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fetchAllData(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-medium hover:bg-gray-50/80 transition-all duration-300 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Обновить
              </motion.button>
            </div>
          </div>

          {/* Панель поиска */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 mb-6">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Поиск по логину, роли или мастеру..."
                      className="w-full pl-12 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSearchQuery("")}
                      className="mt-4 flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 bg-red-50/50 hover:bg-red-50 rounded-xl border border-red-200/50 transition-all duration-300 text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      Очистить поиск
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Users className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.total}</div>
              <div className="text-indigo-100 font-medium">Всего пользователей</div>
              <div className="text-sm text-indigo-200/80 mt-2">Зарегистрировано в системе</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Crown className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.admins}</div>
              <div className="text-amber-100 font-medium">Администраторы</div>
              <div className="text-sm text-amber-200/80 mt-2">Полный доступ к системе</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <BadgeCheck className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <div className="text-4xl font-bold mb-2">{stats.masters}</div>
              <div className="text-blue-100 font-medium">Сотрудники</div>
              <div className="text-sm text-blue-200/80 mt-2">Учетные записи мастеров</div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Форма создания */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-200/50 p-6 shadow-lg backdrop-blur-sm h-fit sticky top-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Новый доступ</h2>
                  <p className="text-sm text-gray-500">Создать учетную запись мастера</p>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    Логин пользователя
                  </label>
                  <input
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                    placeholder="ivanov_pro"
                    value={form.login}
                    onChange={(e) => setForm({ ...form, login: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      Пароль для входа
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 placeholder-gray-500 transition-all duration-300 pr-12"
                      placeholder="Надежный пароль"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-gray-400" />
                    Привязать к сотруднику
                  </label>
                  <select
                    className="w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-gray-900 transition-all duration-300 appearance-none"
                    value={form.masterId}
                    onChange={(e) => setForm({ ...form, masterId: e.target.value })}
                  >
                    <option value="">Выберите мастера</option>
                    {masters.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.surname} {m.name} {m.specialization && `(${m.specialization})`}
                      </option>
                    ))}
                  </select>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Создать доступ
                </motion.button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    <span>Пароль должен быть не менее 6 символов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    <span>Сохраняйте пароли в безопасном месте</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Список пользователей */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-200/50 shadow-lg backdrop-blur-sm overflow-hidden"
            >
              {/* Заголовок списка */}
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Все пользователи</h2>
                      <p className="text-sm text-gray-500">
                        {filteredUsers.length} из {users.length} записей
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700">
                      {adminUsers.length} АДМИН
                    </span>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700">
                      {regularUsers.length} МАСТЕР
                    </span>
                  </div>
                </div>
              </div>

              {/* Тело списка */}
              <div className="divide-y divide-gray-100/50">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-500 font-medium">Загрузка пользователей...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {searchQuery ? "Ничего не найдено" : "Пользователей пока нет"}
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      {searchQuery 
                        ? "Попробуйте изменить параметры поиска" 
                        : "Создайте первую учетную запись для сотрудника"}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Очистить поиск
                      </button>
                    )}
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredUsers.map((user, index) => {
                      const isAdmin = adminUsers.includes(user);
                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-5 hover:bg-gray-50/50 transition-colors duration-200 group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              {/* Аватар */}
                              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getMasterColor(user.id)} flex items-center justify-center text-white font-bold text-lg`}>
                                {user.login[0]?.toUpperCase()}
                              </div>
                              
                              {/* Информация */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1.5">
                                  <h3 className="font-bold text-gray-900 text-lg">{user.login}</h3>
                                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${getRoleBadgeColor(user.role || '')}`}>
                                    {isAdmin ? "АДМИНИСТРАТОР" : "СОТРУДНИК"}
                                  </span>
                                  {isAdmin && (
                                    <Crown className="w-4 h-4 text-amber-500" />
                                  )}
                                </div>
                                
                                {user.masterId && mastersLookup[String(user.masterId)] && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="text-sm text-gray-600">
                                      Привязан к мастеру:{" "}
                                      <span className="font-semibold text-gray-900">
                                        {mastersLookup[String(user.masterId)]}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <Key className="w-3.5 h-3.5" />
                                    <span className="font-mono">••••••••</span>
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    ID: {user.id}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Действия */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openPasswordModal(user)}
                                className="p-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 hover:text-amber-700 rounded-xl border border-amber-200/50 transition-all duration-300"
                                title="Изменить пароль"
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              {!isAdmin && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => deleteUser(user.id)}
                                  className="p-2 bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 hover:text-rose-700 rounded-xl border border-rose-200/50 transition-all duration-300"
                                  title="Удалить"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Футер списка */}
              <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                      <span>Администраторы</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                      <span>Сотрудники</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span>
                      Показано: {filteredUsers.length} из {users.length}
                    </span>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Сбросить поиск
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Модальное окно изменения пароля */}
      <AnimatePresence>
        {isPasswordModalOpen && editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={closePasswordModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-gradient-to-br from-white to-gray-50/50 rounded-3xl shadow-2xl border border-gray-200/50 backdrop-blur-xl overflow-hidden"
            >
              {/* Градиентный заголовок */}
              <div className="relative px-6 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Lock className="w-12 h-12" />
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Изменение пароля
                      </h2>
                      <p className="text-white/80 text-xs mt-1">
                        Пользователь: {editingUser.login}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closePasswordModal}
                    className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Форма изменения пароля */}
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Новый пароль
                    </label>
                    <div className="relative">
                      <input
                        type={passwordForm.showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 placeholder-gray-500 transition-all duration-300 pr-12"
                        placeholder="Введите новый пароль"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ 
                          ...prev, 
                          newPassword: e.target.value 
                        }))}
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordForm(prev => ({ 
                          ...prev, 
                          showPassword: !prev.showPassword 
                        }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-1"
                      >
                        {passwordForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Минимум 6 символов
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Подтверждение пароля
                    </label>
                    <input
                      type={passwordForm.showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                      placeholder="Повторите пароль"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ 
                        ...prev, 
                        confirmPassword: e.target.value 
                      }))}
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>Убедитесь, что пароли совпадают</span>
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200/50 mt-6">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closePasswordModal}
                    className="flex-1 px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-300/50 text-gray-700 rounded-xl font-semibold hover:bg-gray-50/80 transition-all duration-300 shadow-sm text-sm"
                  >
                    Отмена
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePasswordChange}
                    disabled={changingPassword}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                  >
                    {changingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Изменить пароль
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}