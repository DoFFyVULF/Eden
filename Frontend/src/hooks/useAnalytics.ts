import { useState, useCallback } from 'react';
import { analyticsService } from '@/services/analytics/analytics.service';
import { AnalyticsRequest, TimePeriod, KeyMetricsResponse } from '@/types/analytics.types';

export const useAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeyMetrics = useCallback(async (params?: AnalyticsRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getKeyMetrics(params);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки аналитики';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDashboardSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getDashboardSummary();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки сводки';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQuickStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getQuickStats();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки статистики';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTopMasters = useCallback(async (limit?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getTopMasters(limit);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки топ мастеров';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPopularServices = useCallback(async (limit?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getPopularServices(limit);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки популярных услуг';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    clearError,
    fetchKeyMetrics,
    fetchDashboardSummary,
    fetchQuickStats,
    fetchTopMasters,
    fetchPopularServices,
    formatCurrency: analyticsService.formatCurrency,
    formatPercent: analyticsService.formatPercent,
    formatNumber: analyticsService.formatNumber,
    getPeriodDisplayName: analyticsService.getPeriodDisplayName
  };
};