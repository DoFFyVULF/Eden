import { IAppointment, AppointmentStatus } from "@/types/appointment.types";
import { KeyMetricsResponse, TimePeriod } from "@/types/analytics.types";

type ExcelWorkbook = any;
type ExcelWorksheet = any;

type AnalyticsExportOptions = {
  data: KeyMetricsResponse;
  reportTitle: string;
  filePrefix: string;
  periodLabel: string;
  comparisonData?: KeyMetricsResponse | null;
};

const COLORS = {
  ink: "1F2937",
  muted: "6B7280",
  line: "D8DEE9",
  paper: "F8FAFC",
  header: "27364A",
  accent: "2563EB",
  success: "059669",
  warning: "D97706",
  danger: "DC2626",
  purple: "7C3AED",
  cyan: "0891B2",
  white: "FFFFFF",
};

const money = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const number = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(Number(value) || 0);

const percent = (value: number) => `${(Number(value) || 0).toFixed(1)}%`;

const todayStamp = () => new Date().toISOString().split("T")[0];

const safeSheetName = (name: string) => name.slice(0, 31);

const normalizePeriod = (period: TimePeriod | string) => {
  const labels: Record<string, string> = {
    day: "День",
    week: "Неделя",
    month: "Месяц",
    quarter: "Квартал",
    year: "Год",
    custom: "Период",
  };
  return labels[period] || String(period);
};

async function createWorkbook() {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Eden";
  workbook.created = new Date();
  workbook.modified = new Date();
  return workbook;
}

function styleSheet(sheet: ExcelWorksheet) {
  sheet.views = [{ state: "frozen", ySplit: 5 }];
  sheet.properties.defaultRowHeight = 21;
  sheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };
}

function addTitle(sheet: ExcelWorksheet, title: string, subtitle: string) {
  sheet.mergeCells("A1:H1");
  sheet.getCell("A1").value = title;
  sheet.getCell("A1").font = {
    name: "Arial",
    size: 20,
    bold: true,
    color: { argb: COLORS.white },
  };
  sheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLORS.header },
  };
  sheet.getCell("A1").alignment = { vertical: "middle" };
  sheet.getRow(1).height = 34;

  sheet.mergeCells("A2:H2");
  sheet.getCell("A2").value = subtitle;
  sheet.getCell("A2").font = {
    name: "Arial",
    size: 10,
    color: { argb: COLORS.muted },
  };
  sheet.getRow(2).height = 24;
  sheet.addRow([]);
}

function addKpis(
  sheet: ExcelWorksheet,
  items: Array<{ label: string; value: string | number; color?: string }>,
) {
  const startRow = sheet.rowCount + 1;
  const pairs = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
  ];

  items.forEach((item, index) => {
    const [labelCol, valueCol] = pairs[index % pairs.length];
    const row = startRow + Math.floor(index / pairs.length) * 2;
    sheet.getCell(`${labelCol}${row}`).value = item.label;
    sheet.getCell(`${valueCol}${row}`).value = item.value;
    sheet.getCell(`${labelCol}${row}`).font = {
      size: 9,
      bold: true,
      color: { argb: COLORS.muted },
    };
    sheet.getCell(`${valueCol}${row}`).font = {
      size: 13,
      bold: true,
      color: { argb: item.color || COLORS.ink },
    };
    sheet.getCell(`${labelCol}${row}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.paper },
    };
    sheet.getCell(`${valueCol}${row}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.paper },
    };
  });

  sheet.addRow([]);
}

function addTable(
  sheet: ExcelWorksheet,
  title: string,
  headers: string[],
  rows: Array<Array<string | number>>,
) {
  sheet.addRow([title]);
  const titleRow = sheet.lastRow;
  titleRow.font = { size: 13, bold: true, color: { argb: COLORS.ink } };
  sheet.addRow(headers);
  const headerRow = sheet.lastRow;
  headerRow.eachCell((cell: any) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.header },
    };
    cell.font = { bold: true, color: { argb: COLORS.white } };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: COLORS.line } },
      left: { style: "thin", color: { argb: COLORS.line } },
      bottom: { style: "thin", color: { argb: COLORS.line } },
      right: { style: "thin", color: { argb: COLORS.line } },
    };
  });

  rows.forEach((row, index) => {
    const excelRow = sheet.addRow(row);
    excelRow.eachCell((cell: any) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: index % 2 === 0 ? "FFFFFF" : "F5F7FB" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "EEF2F7" } },
        left: { style: "thin", color: { argb: "EEF2F7" } },
        bottom: { style: "thin", color: { argb: "EEF2F7" } },
        right: { style: "thin", color: { argb: "EEF2F7" } },
      };
      cell.alignment = { vertical: "middle", wrapText: true };
    });
  });

  sheet.addRow([]);
}

function addBarSection(
  sheet: ExcelWorksheet,
  title: string,
  rows: Array<{ label: string; value: number; display?: string; color?: string }>,
) {
  const prepared = rows
    .filter((item) => Number.isFinite(item.value))
    .sort((a, b) => b.value - a.value);

  if (!prepared.length) return;

  const max = Math.max(...prepared.map((item) => Math.abs(item.value)), 1);
  addTable(
    sheet,
    title,
    ["Показатель", "Значение", "График"],
    prepared.map((item) => {
      const blocks = Math.max(1, Math.round((Math.abs(item.value) / max) * 24));
      return [
        item.label,
        item.display ?? number(item.value),
        "█".repeat(blocks),
      ];
    }),
  );

  const firstDataRow = sheet.rowCount - prepared.length;
  prepared.forEach((item, index) => {
    const cell = sheet.getCell(`C${firstDataRow + index}`);
    cell.font = {
      name: "Consolas",
      size: 11,
      color: { argb: item.color || COLORS.accent },
    };
  });
}

function autoWidth(sheet: ExcelWorksheet) {
  sheet.columns.forEach((column: any) => {
    let width = 12;
    column.eachCell({ includeEmpty: true }, (cell: any) => {
      const text = cell.value == null ? "" : String(cell.value);
      width = Math.max(width, Math.min(text.length + 3, 44));
    });
    column.width = width;
  });
}

async function saveWorkbook(workbook: ExcelWorkbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

export async function exportAnalyticsWorkbook({
  data,
  reportTitle,
  filePrefix,
  periodLabel,
  comparisonData,
}: AnalyticsExportOptions) {
  const workbook = await createWorkbook();
  const period = normalizePeriod(data.period);
  const subtitle = `${periodLabel || period} · сформировано ${new Date().toLocaleString("ru-RU")}`;

  const overview = workbook.addWorksheet("Обзор");
  styleSheet(overview);
  addTitle(overview, reportTitle, subtitle);
  addKpis(overview, [
    { label: "Выручка", value: money(data.financial.totalRevenue), color: COLORS.success },
    { label: "Средний чек", value: money(data.financial.averageCheck), color: COLORS.accent },
    { label: "Клиенты", value: number(data.clients.totalClients), color: COLORS.purple },
    { label: "Записи", value: number(data.appointments.totalAppointments), color: COLORS.cyan },
    { label: "Мастера", value: number(data.masters.mastersCount), color: COLORS.warning },
    { label: "Услуги", value: number(data.services.servicesCount), color: COLORS.ink },
    { label: "Рост выручки", value: percent(data.financial.revenueGrowth), color: data.financial.revenueGrowth >= 0 ? COLORS.success : COLORS.danger },
    { label: "Конверсия записей", value: percent(data.appointments.conversionRate), color: COLORS.accent },
  ]);
  addTable(overview, "Ключевые показатели", ["Раздел", "Показатель", "Значение"], [
    ["Финансы", "Месячный доход", money(data.financial.monthlyIncome)],
    ["Клиенты", "Новые клиенты", number(data.clients.newClients)],
    ["Клиенты", "Повторные клиенты", number(data.clients.returningClients)],
    ["Клиенты", "Удержание", percent(data.clients.retentionRate)],
    ["Записи", "Новые", number(data.appointments.newAppointments)],
    ["Записи", "Подтвержденные", number(data.appointments.confirmedAppointments)],
    ["Записи", "Завершенные", number(data.appointments.completedAppointments)],
    ["Записи", "Отмененные", number(data.appointments.cancelledAppointments)],
  ]);
  autoWidth(overview);

  const finance = workbook.addWorksheet("Финансы");
  styleSheet(finance);
  addTitle(finance, "Финансовая аналитика", subtitle);
  addBarSection(
    finance,
    "Динамика выручки",
    data.financial.revenueByMonth.map((item) => ({
      label: item.month,
      value: item.revenue,
      display: money(item.revenue),
      color: COLORS.success,
    })),
  );
  addBarSection(
    finance,
    "Выручка по мастерам",
    data.financial.revenueByMaster.map((item) => ({
      label: item.masterName,
      value: item.revenue,
      display: money(item.revenue),
      color: COLORS.accent,
    })),
  );
  autoWidth(finance);

  const clients = workbook.addWorksheet("Клиенты");
  styleSheet(clients);
  addTitle(clients, "Клиентская аналитика", subtitle);
  addKpis(clients, [
    { label: "Всего клиентов", value: number(data.clients.totalClients), color: COLORS.purple },
    { label: "Новые", value: number(data.clients.newClients), color: COLORS.accent },
    { label: "Повторные", value: number(data.clients.returningClients), color: COLORS.success },
    { label: "Удержание", value: percent(data.clients.retentionRate), color: COLORS.warning },
  ]);
  addBarSection(
    clients,
    "Рост клиентской базы",
    data.clients.clientsByMonth.map((item) => ({
      label: item.month,
      value: item.clients,
      display: number(item.clients),
      color: COLORS.purple,
    })),
  );
  autoWidth(clients);

  const appointments = workbook.addWorksheet("Записи");
  styleSheet(appointments);
  addTitle(appointments, "Аналитика записей", subtitle);
  addBarSection(appointments, "Статусы записей", [
    { label: "Новые", value: data.appointments.newAppointments, color: COLORS.warning },
    { label: "Подтвержденные", value: data.appointments.confirmedAppointments, color: COLORS.accent },
    { label: "Завершенные", value: data.appointments.completedAppointments, color: COLORS.success },
    { label: "Отмененные", value: data.appointments.cancelledAppointments, color: COLORS.danger },
  ]);
  autoWidth(appointments);

  const masters = workbook.addWorksheet("Мастера");
  styleSheet(masters);
  addTitle(masters, "Аналитика мастеров", subtitle);
  addTable(
    masters,
    "Эффективность мастеров",
    ["Мастер", "Записей", "Выручка", "Средняя выручка"],
    data.masters.topMasters.map((item) => [
      item.masterName,
      number(item.appointmentsCount),
      money(item.totalRevenue),
      money(item.averageRevenuePerAppointment || 0),
    ]),
  );
  addBarSection(
    masters,
    "Выручка мастеров",
    data.masters.topMasters.map((item) => ({
      label: item.masterName,
      value: item.totalRevenue,
      display: money(item.totalRevenue),
      color: COLORS.warning,
    })),
  );
  autoWidth(masters);

  const services = workbook.addWorksheet("Услуги");
  styleSheet(services);
  addTitle(services, "Аналитика услуг", subtitle);
  addTable(
    services,
    "Популярные услуги",
    ["Услуга", "Записей", "Выручка", "Средняя цена"],
    data.services.popularServices.map((item) => [
      item.serviceName,
      number(item.appointmentsCount),
      money(item.totalRevenue),
      money(item.averagePrice),
    ]),
  );
  addBarSection(
    services,
    "Популярность услуг",
    data.services.popularServices.map((item) => ({
      label: item.serviceName,
      value: item.appointmentsCount,
      display: number(item.appointmentsCount),
      color: COLORS.cyan,
    })),
  );
  autoWidth(services);

  if (comparisonData) {
    const comparison = workbook.addWorksheet("Сравнение");
    styleSheet(comparison);
    addTitle(comparison, "Сравнение периодов", subtitle);
    addTable(comparison, "Текущий период против предыдущего", ["Показатель", "Текущий", "Предыдущий", "Изменение"], [
      [
        "Выручка",
        money(data.financial.totalRevenue),
        money(comparisonData.financial.totalRevenue),
        money(data.financial.totalRevenue - comparisonData.financial.totalRevenue),
      ],
      [
        "Клиенты",
        number(data.clients.totalClients),
        number(comparisonData.clients.totalClients),
        number(data.clients.totalClients - comparisonData.clients.totalClients),
      ],
      [
        "Записи",
        number(data.appointments.totalAppointments),
        number(comparisonData.appointments.totalAppointments),
        number(data.appointments.totalAppointments - comparisonData.appointments.totalAppointments),
      ],
      [
        "Средний чек",
        money(data.financial.averageCheck),
        money(comparisonData.financial.averageCheck),
        money(data.financial.averageCheck - comparisonData.financial.averageCheck),
      ],
    ]);
    autoWidth(comparison);
  }

  await saveWorkbook(workbook, `${filePrefix}-${todayStamp()}.xlsx`);
}

export async function exportAppointmentsHistoryWorkbook(
  appointments: IAppointment[],
  filePrefix = "appointments-history",
) {
  const workbook = await createWorkbook();
  const subtitle = `${appointments.length} записей · сформировано ${new Date().toLocaleString("ru-RU")}`;
  const revenueStatuses = [AppointmentStatus.Завершен, AppointmentStatus.Подтвержден];
  const revenue = appointments.reduce(
    (sum, item) => sum + (revenueStatuses.includes(item.status) ? Number(item.price) || 0 : 0),
    0,
  );

  const sheet = workbook.addWorksheet("История");
  styleSheet(sheet);
  addTitle(sheet, "История записей", subtitle);
  addKpis(sheet, [
    { label: "Записей в экспорте", value: number(appointments.length), color: COLORS.accent },
    { label: "Выручка", value: money(revenue), color: COLORS.success },
    {
      label: "Средний чек",
      value: money(appointments.length ? Math.round(revenue / appointments.length) : 0),
      color: COLORS.warning,
    },
    {
      label: "Завершенных",
      value: number(appointments.filter((item) => item.status === AppointmentStatus.Завершен).length),
      color: COLORS.success,
    },
  ]);
  addTable(
    sheet,
    "Детализация",
    ["Дата", "Время", "Статус", "Клиент", "Телефон", "Услуга", "Мастер", "Цена"],
    appointments.map((item) => {
      const date = new Date(item.appointmentTime);
      return [
        date.toLocaleDateString("ru-RU"),
        date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        item.status,
        `${item.clientSurname} ${item.clientName}`.trim(),
        item.clientPhone,
        item.service.title,
        `${item.master.surname} ${item.master.name}`.trim(),
        money(Number(item.price) || 0),
      ];
    }),
  );
  autoWidth(sheet);

  const charts = workbook.addWorksheet("Графики");
  styleSheet(charts);
  addTitle(charts, "Графики по истории записей", subtitle);

  const statusMap = new Map<string, number>();
  const serviceMap = new Map<string, number>();
  const masterMap = new Map<string, number>();

  appointments.forEach((item) => {
    statusMap.set(item.status, (statusMap.get(item.status) || 0) + 1);
    serviceMap.set(item.service.title, (serviceMap.get(item.service.title) || 0) + 1);
    masterMap.set(
      `${item.master.surname} ${item.master.name}`.trim(),
      (masterMap.get(`${item.master.surname} ${item.master.name}`.trim()) || 0) + 1,
    );
  });

  addBarSection(
    charts,
    "Статусы",
    Array.from(statusMap.entries()).map(([label, value]) => ({ label, value })),
  );
  addBarSection(
    charts,
    "Услуги",
    Array.from(serviceMap.entries()).map(([label, value]) => ({ label, value, color: COLORS.cyan })),
  );
  addBarSection(
    charts,
    "Мастера",
    Array.from(masterMap.entries()).map(([label, value]) => ({ label, value, color: COLORS.warning })),
  );
  autoWidth(charts);

  await saveWorkbook(workbook, `${filePrefix}-${todayStamp()}.xlsx`);
}
