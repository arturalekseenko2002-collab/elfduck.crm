import React, { createContext, useContext, useMemo, useState } from 'react';

const PeriodContext = createContext(null);

const TODAY = new Date('2026-08-27T12:00:00');

export function PeriodProvider({ children }) {
  const [period, setPeriod] = useState('Месяц');
  const [customRange, setCustomRange] = useState(null);

  const range = useMemo(() => {
    if (period === 'Всё время') return null;
    if (period === 'Свой период') return customRange;
    const end = new Date(TODAY); end.setHours(23, 59, 59, 0);
    const start = new Date(TODAY); start.setHours(0, 0, 0, 0);
    switch (period) {
      case 'Сегодня': break;
      case 'Неделя': start.setDate(start.getDate() - 7); break;
      case 'Месяц': start.setDate(start.getDate() - 30); break;
      case '3 мес': start.setDate(start.getDate() - 90); break;
      case '6 мес': start.setDate(start.getDate() - 180); break;
      default: return null;
    }
    return { start, end };
  }, [period, customRange]);

  const value = useMemo(() => ({ period, setPeriod, range, setCustomRange }), [period, range]);
  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export function usePeriod() {
  return useContext(PeriodContext) || { period: 'Месяц', setPeriod: () => {}, range: null, setCustomRange: () => {} };
}