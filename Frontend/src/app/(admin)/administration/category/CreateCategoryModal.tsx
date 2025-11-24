import { useState, useCallback, useEffect } from "react";
import { categoryService } from "@/services/category/category.service";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (category: { id: number; title: string; isActive: boolean }) => void;
}

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCategoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setIsActive(true);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setError("Название категории обязательно");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const newCategory = await categoryService.create({
          title: trimmedTitle,
          isActive,
        });

        onSuccess?.(newCategory);
        onClose();
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Не удалось создать категорию";
        setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      } finally {
        setIsLoading(false);
      }
    },
    [title, isActive, onClose, onSuccess]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 text-black flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Новая категория
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl"
            aria-label="Закрыть"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Название категории *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название категории"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <span className="block text-sm font-medium text-gray-900">
                  Статус категории
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {isActive
                    ? "Категория будет видна клиентам"
                    : "Категория скрыта"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive ? "bg-blue-600" : "bg-gray-300"
                }`}
                aria-pressed={isActive}
                aria-label={
                  isActive
                    ? "Деактивировать категорию"
                    : "Активировать категорию"
                }
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Описание (опционально)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Введите описание категории"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Пока не сохраняется — реализация требует обновления DTO и
                модели.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Создание..." : "Создать категорию"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}