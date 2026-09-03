import React from 'react';
import { Package, Droplet, Zap, Layers } from 'lucide-react';
import { currency, num } from '@/lib/mockData';
import Delta from '@/components/shared/Delta';
import MetricGrid from '@/components/shared/MetricGrid';

const catIcon = {
  'Одноразки': Zap,
  'Жидкости': Droplet,
  'Поды': Package,
  'Картриджи': Layers,
};

const productImageByKey = {
  'vozol-prime-30-ml': '/products/vozol-prime-30-ml.png',
  'chaser-for-pods-30-ml': '/products/chaser-for-pods-30-ml.png',
  'elf-duck-moon-40k': '/products/elf-duck-moon-40k.png',
  'elfliq-30-ml': '/products/elfliq-30-ml.png',
  'oxva-pod': '/products/oxva-pod.png',
  'puffy-30-ml': '/products/puffy-30-ml.png',
  'xros-5-mini-pod': '/products/xros-5-mini-pod.png',
  'xros-cartridge': '/products/xros-cartridge.png',
  'elf-duck-bc-45000': '/products/elf-duck-bc-45000.png',
  'cartridge-oxva': '/products/cartridge-oxva.png',
  'chaser-black-30-ml-2': '/products/chaser-black-30-ml-2.png',
  'chaser-black-30-ml': '/products/chaser-black-30-ml.png',
  'chaser-special-30-ml': '/products/chaser-special-30-ml.png',
  'elf-duck-1500-2': '/products/elf-duck-1500-2.png',
  'elf-duck-1500': '/products/elf-duck-1500.png',
  'elf-duck-3000': '/products/elf-duck-3000.png',
  'elf-duck-bc-20k': '/products/elf-duck-bc-20k.png',
  'elf-duck-combo-30k-pro': '/products/elf-duck-combo-30k-pro.png',
  'elf-duck-d3-25k': '/products/elf-duck-d3-25k.png',
  'elf-duck-gh-33000-pro': '/products/elf-duck-gh-33000-pro.png',
  'elf-duck-ice-king-30k': '/products/elf-duck-ice-king-30k.png',
  'elf-duck-planet-25k': '/products/elf-duck-planet-25k.png',
  'elf-duck-trio-40k': '/products/elf-duck-trio-40k.png',
  'ethereum-30-ml': '/products/ethereum-30-ml.png',
  'puffy-30-ml-70-mg': '/products/puffy-30-ml-70-mg.png',
  'xros-5-pod': '/products/xros-5-pod.png',
  'yami-30ml': '/products/yami-30ml.png',
};

export default function ProductMobileRow({ p }) {
  const lowStock = p.days <= 2;
  const Icon = catIcon[p.category] || Package;
  const imageSrc =
  productImageByKey[p.productKey] ||
  p.imageUrl ||
  '';

  return (
    <div className="rounded-xl border border-border-soft bg-[hsl(232_26%_6%)] p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[hsl(234_22%_18%)] to-[hsl(234_22%_10%)]">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={p.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <Icon className="h-4 w-4 text-[hsl(255_100%_72%)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-foreground">{p.name}</div>
          <div className="text-[11px] text-muted-2">{p.category}</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="whitespace-nowrap text-[14px] font-semibold tabular-nums text-foreground">{currency(p.revenue)}</div>
          <div className="flex justify-end"><Delta value={p.trend} suffix="%" /></div>
        </div>
      </div>
      <div className="mt-3 border-t border-border-soft pt-3">
        <MetricGrid cols={3} items={[
          { label: 'Продано', value: `${num(p.sold)} шт.` },
          { label: 'Остаток', value: `${p.stock} шт.`, className: lowStock ? 'text-[hsl(36_90%_62%)]' : 'text-muted-foreground' },
          { label: 'Дн. запаса', value: p.days, className: lowStock ? 'text-[hsl(36_90%_62%)]' : 'text-muted-foreground' },
        ]} />
        <div className="mt-2.5">
          <MetricGrid cols={2} items={[
            { label: 'Повторные', value: `${p.repeat}%` },
            { label: 'Стоимость остатка', value: currency(p.stockValue) },
          ]} />
        </div>
      </div>
    </div>
  );
}