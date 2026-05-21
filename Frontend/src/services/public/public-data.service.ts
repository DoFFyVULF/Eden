import { axiosClassic } from "@/api/interceptors";
import {
  IPublicAppointmentPageData,
  IPublicServicesPageData,
} from "@/types/public-data.types";

const SESSION_TTL_MS = 5 * 60 * 1000;
const SERVICES_CACHE_KEY = "public-services-page-data";
const APPOINTMENT_CACHE_KEY = "public-appointment-page-data";

type CacheEntry<T> = {
  fetchedAt: number;
  data: T;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();
const pendingRequests = new Map<string, Promise<unknown>>();

function readCache<T>(key: string): T | null {
  const inMemory = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (inMemory && Date.now() - inMemory.fetchedAt < SESSION_TTL_MS) {
    return inMemory.data;
  }

  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - parsed.fetchedAt >= SESSION_TTL_MS) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    memoryCache.set(key, parsed);
    return parsed.data;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  const entry: CacheEntry<T> = {
    fetchedAt: Date.now(),
    data,
  };

  memoryCache.set(key, entry);

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(key, JSON.stringify(entry));
  }
}

async function getOrLoad<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const cached = readCache<T>(key);
  if (cached) return cached;

  const existingRequest = pendingRequests.get(key) as Promise<T> | undefined;
  if (existingRequest) return existingRequest;

  const request = loader()
    .then((data) => {
      writeCache(key, data);
      return data;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, request);
  return request;
}

export const publicDataService = {
  getCachedServicesPageData(): IPublicServicesPageData | null {
    return readCache<IPublicServicesPageData>(SERVICES_CACHE_KEY);
  },

  getCachedAppointmentPageData(): IPublicAppointmentPageData | null {
    return readCache<IPublicAppointmentPageData>(APPOINTMENT_CACHE_KEY);
  },

  async getServicesPageData(): Promise<IPublicServicesPageData> {
    return getOrLoad(SERVICES_CACHE_KEY, async () => {
      const { data } = await axiosClassic.get<IPublicServicesPageData>(
        "/public/services",
      );
      return data;
    });
  },

  async getAppointmentPageData(): Promise<IPublicAppointmentPageData> {
    return getOrLoad(APPOINTMENT_CACHE_KEY, async () => {
      const { data } = await axiosClassic.get<IPublicAppointmentPageData>(
        "/public/appointment",
      );
      return data;
    });
  },
};
