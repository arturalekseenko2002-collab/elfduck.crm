import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

const meta = {
  '/': { title: 'Дашборд', subtitle: 'Обзор бизнеса ElfDuck за период' },
  '/sales/orders': { title: 'Заказы', subtitle: 'Операционная таблица заказов' },
  '/sales/customers': { title: 'Клиенты', subtitle: 'База клиентов и сегментация' },
  '/sales/leads': { title: 'Лиды', subtitle: 'Воронка продаж' },
  '/marketing/partners': { title: 'Партнёры', subtitle: 'Партнёрская программа' },
  '/marketing/cashback': { title: 'Кэшбэк', subtitle: 'Программа лояльности' },
  '/marketing/push': { title: 'Push-рассылки', subtitle: 'Создание и аналитика кампаний' },
  '/analytics/products': { title: 'Товары', subtitle: 'Продажи и состояние склада' },
  '/analytics/locations': { title: 'Точки', subtitle: 'Сравнение точек продаж' },
};

export default function AppShell() {
  const loc = useLocation();
  const m = meta[loc.pathname] || { title: 'ElfDuck', subtitle: '' };
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader title={m.title} subtitle={m.subtitle} />
        <main className="flex-1 overflow-y-auto scrollbar-thin px-7 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}