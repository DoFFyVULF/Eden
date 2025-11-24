export const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы
    const cleaned = value.replace(/\D/g, '');
    
    // Форматируем номер: +7 (XXX) XXX-XX-XX
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 1) return `+7`;
    if (cleaned.length <= 4) return `+7 (${cleaned.slice(1, 4)}`;
    if (cleaned.length <= 7) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}`;
    if (cleaned.length <= 9) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}`;
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  };