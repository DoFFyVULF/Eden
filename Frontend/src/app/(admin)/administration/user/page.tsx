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
  ChevronUp,
  X,
  Edit,
  Save,
  SlidersHorizontal,
} from "lucide-react";

export default function MasterUsersPage() {
  const [masters, setMasters] = useState<IMaster[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [form, setForm] = useState({ login: "", password: "", masterId: "" });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);

  // Состояния для модального окна изменения пароля
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
    showPassword: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const checkDarkMode = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

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

    const selectedMaster = masters.find(m => m.id === Number(form.masterId))

    const fullname = selectedMaster ? `${selectedMaster.surname} ${selectedMaster.name}`.trim() : "";

    try {
      await userService.createMasterUser({
        login: form.login,
        password: form.password,
        masterId: Number(form.masterId),
        name: fullname || '',
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
    const mastersCount = regularUsers.length;
    const activeCount = users.filter(u => u.isActive).length;
    return { total, admins, masters: mastersCount, activeCount };
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

  // Стили
  const glassCls = isDark
    ? "bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
    : "bg-white border border-gray-200/70 shadow-sm";

  const STAT_CARDS = [
    {
      num: stats.total,
      label: "Всего пользователей",
      sub: "зарегистрировано в системе",
      icon: <Users size={22} />,
      gradient: "from-indigo-500 to-purple-600",
      glow: "shadow-indigo-500/25",
    },
    {
      num: stats.admins,
      label: "Администраторы",
      sub: "полный доступ",
      icon: <Crown size={22} />,
      gradient: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/25",
    },
    {
      num: stats.masters,
      label: "Сотрудники",
      sub: "учетные записи мастеров",
      icon: <BadgeCheck size={22} />,
      gradient: "from-blue-500 to-cyan-500",
      glow: "shadow-blue-500/25",
    },
    {
      num: stats.activeCount,
      label: "Активных",
      sub: "в данный момент",
      icon: <CheckCircle size={22} />,
      gradient: "from-emerald-500 to-green-500",
      glow: "shadow-emerald-500/25",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-9xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p
                className={`text-xs font-semibold tracking-widest uppercase mb-2 ${
                  isDark ? "text-white/30" : "text-gray-400"
                }`}
              >
                Безопасность
              </p>
              <h1
                className={`text-4xl md:text-5xl font-black leading-none tracking-tight ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Управление доступом
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-white/40" : "text-gray-400"
                }`}
              >
                {stats.total} пользователей · {stats.admins} администраторов · {stats.masters} сотрудников
              </p>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fetchAllData(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.1] text-white/60 hover:text-white/80 hover:bg-white/[0.1]"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <RefreshCw
                  size={15}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                Обновить
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
                isDark
                  ? `bg-white/[0.07] border border-white/[0.1] backdrop-blur-xl shadow-lg ${s.glow}`
                  : "bg-white border border-gray-200/70 shadow-sm hover:shadow-md"
              }`}
            >
              <div
                className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${s.gradient} opacity-${isDark ? "15" : "8"} blur-xl`}
              />

              <div className="relative">
                <div
                  className={`inline-flex p-2 rounded-xl mb-3 bg-gradient-to-br ${s.gradient} shadow-lg ${s.glow}`}
                >
                  <span className="text-white">{s.icon}</span>
                </div>
                <div
                  className={`text-3xl font-black leading-none mb-1 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {s.num}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    isDark ? "text-white/70" : "text-gray-700"
                  }`}
                >
                  {s.label}
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-white/35" : "text-gray-400"
                  }`}
                >
                  {s.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SEARCH & FILTER */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className={`rounded-2xl p-4 mb-6 transition-all duration-300 ${glassCls}`}
        >
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search
                size={16}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? "text-white/30" : "text-gray-400"
                }`}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по логину, роли или мастеру..."
                className={`w-full h-11 pl-10 pr-4 rounded-xl text-sm border outline-none transition-all ${
                  isDark
                    ? "bg-white/[0.07] border-white/[0.1] text-white/90 placeholder-white/25 focus:border-white/20 focus:bg-white/[0.09]"
                    : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-lg ${
                    isDark ? "text-white/40 hover:text-white/60" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`h-11 flex items-center gap-2 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                isFilterOpen
                  ? isDark
                    ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-300"
                    : "bg-indigo-50 border-indigo-300 text-indigo-600"
                  : isDark
                    ? "bg-white/[0.07] border-white/[0.1] text-white/60 hover:text-white/80"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-white shadow-sm"
              }`}
            >
              <SlidersHorizontal size={15} />
              Фильтры
              {isFilterOpen ? (
                <ChevronUp size={13} />
              ) : (
                <ChevronDown size={13} />
              )}
            </motion.button>

            {/* Clear all */}
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchQuery("")}
                className={`h-11 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  isDark
                    ? "bg-rose-500/10 border-rose-400/20 text-rose-400 hover:bg-rose-500/15"
                    : "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
                }`}
              >
                <X size={15} />
              </motion.button>
            )}
          </div>

          {/* Expanded filters info */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div
                  className={`pt-3 border-t ${isDark ? "border-white/[0.07]" : "border-gray-100"}`}
                >
                  <p
                    className={`text-xs font-semibold mb-2.5 ${
                      isDark ? "text-white/30" : "text-gray-400"
                    }`}
                  >
                    Информация:
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Администраторы — полный доступ
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                      <span className={isDark ? "text-white/60" : "text-gray-600"}>
                        Сотрудники — доступ к записям
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Форма создания */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl p-6 transition-all duration-300 h-fit sticky top-6 ${glassCls}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 ${isDark ? "shadow-lg shadow-emerald-500/25" : ""}`}>
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Новый доступ
                  </h2>
                  <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>
                    Создать учетную запись мастера
                  </p>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                  <label className={`text-sm font-semibold flex items-center gap-2 ${
                    isDark ? "text-white/70" : "text-gray-700"
                  }`}>
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    Логин пользователя
                  </label>
                  <input
                    className={`w-full px-4 py-3.5 rounded-xl text-sm border outline-none transition-all ${
                      isDark
                        ? "bg-white/[0.07] border-white/[0.1] text-white/90 placeholder-white/25 focus:border-white/20 focus:bg-white/[0.09]"
                        : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                    }`}
                    placeholder="ivanov_pro"
                    value={form.login}
                    onChange={(e) => setForm({ ...form, login: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-semibold flex items-center gap-2 ${
                    isDark ? "text-white/70" : "text-gray-700"
                  }`}>
                    <Lock className="w-4 h-4 text-gray-400" />
                    Пароль для входа
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`w-full px-4 py-3.5 rounded-xl text-sm border outline-none transition-all pr-12 ${
                        isDark
                          ? "bg-white/[0.07] border-white/[0.1] text-white/90 placeholder-white/25 focus:border-white/20 focus:bg-white/[0.09]"
                          : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      }`}
                      placeholder="Надежный пароль"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                        isDark ? "text-white/40 hover:text-white/60" : "text-gray-400 hover:text-emerald-600"
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-semibold flex items-center gap-2 ${
                    isDark ? "text-white/70" : "text-gray-700"
                  }`}>
                    <BadgeCheck className="w-4 h-4 text-gray-400" />
                    Привязать к сотруднику
                  </label>
                  <select
                    className={`w-full px-4 py-3.5 rounded-xl text-sm border outline-none appearance-none transition-all ${
                      isDark
                        ? "bg-white/[0.07] border-white/[0.1] text-white/90 focus:border-white/20"
                        : "bg-gray-50 border-gray-200 text-gray-700 focus:border-emerald-300 focus:bg-white"
                    }`}
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
                  className={`w-full px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
                    isDark
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40"
                      : "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-emerald-500/20 hover:shadow-emerald-500/35"
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  Создать доступ
                </motion.button>
              </form>

              <div className={`mt-6 pt-6 border-t ${isDark ? "border-white/[0.07]" : "border-gray-200/50"}`}>
                <div className={`text-xs space-y-1 ${
                  isDark ? "text-white/30" : "text-gray-500"
                }`}>
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
              className={`rounded-2xl transition-all duration-300 overflow-hidden ${glassCls}`}
            >
              {/* Заголовок списка */}
              <div className={`p-6 border-b ${isDark ? "border-white/[0.07]" : "border-gray-200/50"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 ${isDark ? "shadow-lg shadow-indigo-500/25" : ""}`}>
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        Все пользователи
                      </h2>
                      <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>
                        {filteredUsers.length} из {users.length} записей
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 ${
                      isDark ? "text-amber-700" : "text-amber-700"
                    }`}>
                      {adminUsers.length} АДМИН
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 ${
                      isDark ? "text-blue-700" : "text-blue-700"
                    }`}>
                      {regularUsers.length} МАСТЕР
                    </span>
                  </div>
                </div>
              </div>

              {/* Тело списка */}
              <div className={`divide-y ${isDark ? "divide-white/[0.07]" : "divide-gray-100/50"}`}>
                {loading ? (
                  <div className="p-12 text-center">
                    <div className={`w-10 h-10 rounded-full border-3 border-t-transparent animate-spin mx-auto mb-4 ${
                      isDark ? "border-purple-400" : "border-indigo-400"
                    }`} style={{ borderWidth: 3 }} />
                    <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>
                      Загрузка пользователей...
                    </p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
                      isDark ? "bg-white/[0.07]" : "bg-gray-100"
                    }`}>
                      <Search size={26} className={isDark ? "text-white/25" : "text-gray-300"} />
                    </div>
                    <p className={`text-lg font-bold mb-1 ${
                      isDark ? "text-white/70" : "text-gray-600"
                    }`}>
                      {searchQuery ? "Ничего не найдено" : "Пользователей пока нет"}
                    </p>
                    <p className={`text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}>
                      {searchQuery 
                        ? "Попробуйте изменить параметры поиска" 
                        : "Создайте первую учетную запись для сотрудника"}
                    </p>
                    {searchQuery && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        onClick={() => setSearchQuery("")}
                        className={`mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                          isDark
                            ? "border-white/10 text-white/50 hover:bg-white/[0.07]"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        Сбросить поиск
                      </motion.button>
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
                          transition={{ delay: Math.min(index * 0.04, 0.3) }}
                          className={`p-5 transition-colors duration-200 group ${
                            isDark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              {/* Аватар */}
                              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getMasterColor(user.id)} flex items-center justify-center text-white font-bold text-lg`}>
                                {user.login[0]?.toUpperCase()}
                              </div>
                              
                              {/* Информация */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                  <h3 className={`font-bold text-lg ${
                                    isDark ? "text-white" : "text-gray-900"
                                  }`}>
                                    {user.login}
                                  </h3>
                                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${getRoleBadgeColor(user.role || '')}`}>
                                    {isAdmin ? "АДМИНИСТРАТОР" : "СОТРУДНИК"}
                                  </span>
                                  {isAdmin && (
                                    <Crown className="w-4 h-4 text-amber-500" />
                                  )}
                                </div>
                                
                                {user.masterId && mastersLookup[String(user.masterId)] && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`text-sm ${
                                      isDark ? "text-white/60" : "text-gray-600"
                                    }`}>
                                      Привязан к мастеру:{" "}
                                      <span className={`font-semibold ${
                                        isDark ? "text-white" : "text-gray-900"
                                      }`}>
                                        {mastersLookup[String(user.masterId)]}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-4 text-sm">
                                  <div className={`flex items-center gap-1.5 ${
                                    isDark ? "text-white/40" : "text-gray-500"
                                  }`}>
                                    <Key className="w-3.5 h-3.5" />
                                    <span className="font-mono">••••••••</span>
                                  </div>
                                  <div className={`text-xs ${
                                    isDark ? "text-white/20" : "text-gray-400"
                                  }`}>
                                    ID: {user.id}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Действия */}
                            <div className={`flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                              isDark ? "bg-white/[0.03] p-1 rounded-xl" : ""
                            }`}>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openPasswordModal(user)}
                                className={`p-2 rounded-xl border transition-all duration-300 ${
                                  isDark
                                    ? "bg-amber-500/10 border-amber-400/20 text-amber-400 hover:bg-amber-500/15"
                                    : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 hover:text-amber-700 border-amber-200/50"
                                }`}
                                title="Изменить пароль"
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                              {!isAdmin && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => deleteUser(user.id)}
                                  className={`p-2 rounded-xl border transition-all duration-300 ${
                                    isDark
                                      ? "bg-rose-500/10 border-rose-400/20 text-rose-400 hover:bg-rose-500/15"
                                      : "bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 hover:text-rose-700 border-rose-200/50"
                                  }`}
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
              <div className={`p-4 border-t ${isDark ? "border-white/[0.07] bg-white/[0.02]" : "border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white/30"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                      <span className={isDark ? "text-white/40" : "text-gray-500"}>
                        Администраторы
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                      <span className={isDark ? "text-white/40" : "text-gray-500"}>
                        Сотрудники
                      </span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-4 ${isDark ? "text-white/30" : "text-gray-400"}`}>
                    <span>
                      Показано: {filteredUsers.length} из {users.length}
                    </span>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className={`font-medium flex items-center gap-1 transition-colors ${
                          isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
                        }`}
                      >
                        <X className="w-3 h-3" />
                        Сбросить
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
              className={`relative w-full max-w-md rounded-2xl overflow-hidden ${
                isDark
                  ? "bg-gray-900 border border-white/[0.1] shadow-2xl"
                  : "bg-white border border-gray-200/70 shadow-2xl"
              }`}
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
                    <label className={`text-sm font-semibold mb-2 block ${
                      isDark ? "text-white/70" : "text-gray-700"
                    }`}>
                      Новый пароль
                    </label>
                    <div className="relative">
                      <input
                        type={passwordForm.showPassword ? "text" : "password"}
                        className={`w-full px-4 py-3.5 rounded-xl text-sm border outline-none transition-all pr-12 ${
                          isDark
                            ? "bg-white/[0.07] border-white/[0.1] text-white/90 placeholder-white/25 focus:border-white/20 focus:bg-white/[0.09]"
                            : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                        }`}
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
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                          isDark ? "text-white/40 hover:text-white/60" : "text-gray-400 hover:text-indigo-600"
                        }`}
                      >
                        {passwordForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className={`text-xs mt-1 ${
                      isDark ? "text-white/30" : "text-gray-500"
                    }`}>
                      Минимум 6 символов
                    </div>
                  </div>

                  <div>
                    <label className={`text-sm font-semibold mb-2 block ${
                      isDark ? "text-white/70" : "text-gray-700"
                    }`}>
                      Подтверждение пароля
                    </label>
                    <input
                      type={passwordForm.showPassword ? "text" : "password"}
                      className={`w-full px-4 py-3.5 rounded-xl text-sm border outline-none transition-all ${
                        isDark
                          ? "bg-white/[0.07] border-white/[0.1] text-white/90 placeholder-white/25 focus:border-white/20 focus:bg-white/[0.09]"
                          : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                      }`}
                      placeholder="Повторите пароль"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ 
                        ...prev, 
                        confirmPassword: e.target.value 
                      }))}
                    />
                  </div>

                  <div className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-amber-400" : "text-amber-600"
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    <span>Убедитесь, что пароли совпадают</span>
                  </div>
                </div>

                {/* Кнопки */}
                <div className={`flex flex-col sm:flex-row gap-3 pt-6 border-t mt-6 ${
                  isDark ? "border-white/[0.07]" : "border-gray-200/50"
                }`}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closePasswordModal}
                    className={`flex-1 px-4 py-3.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      isDark
                        ? "bg-white/[0.07] border-white/[0.1] text-white/60 hover:text-white/80 hover:bg-white/[0.1]"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    Отмена
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePasswordChange}
                    disabled={changingPassword}
                    className={`flex-1 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
                      isDark
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/20 hover:shadow-indigo-500/35 disabled:opacity-50"
                    }`}
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