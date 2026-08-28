import React, { useState, useMemo, useEffect } from 'react';
import { Send, Save, Smartphone, Paperclip, Layers } from 'lucide-react';
import { pushCampaigns, pushTemplates, pushAudienceOptions, currency, num } from '@/lib/mockData';
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/shared/Badge';
import Pagination from '@/components/shared/Pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { usePeriod } from '@/lib/PeriodContext';
import { cn } from '@/lib/utils';

const TPL_PAGE_SIZE = 5;

export default function Push() {
  const [audience, setAudience] = useState('Все');
  const [statuses, setStatuses] = useState(new Set());
  const [categories, setCategories] = useState(new Set());
  const [locations, setLocations] = useState(new Set());
  const [minCheck, setMinCheck] = useState('');
  const [minCashback, setMinCashback] = useState('');
  const [favProduct, setFavProduct] = useState('');
  const [telegram, setTelegram] = useState('');

  const [title, setTitle] = useState('Вернуть спящих');
  const [body, setBody] = useState('Соскучились по вкусам? Вернись и получи −15% на ELF KING.');
  const [promo, setPromo] = useState('');
  const [activeTpl, setActiveTpl] = useState(null);

  const [templates, setTemplates] = useState(pushTemplates);
  const [tplPage, setTplPage] = useState(1);
  const [tplModalOpen, setTplModalOpen] = useState(false);
  const [tplName, setTplName] = useState('');

  const { period, range } = usePeriod();
  const [campPage, setCampPage] = useState(1);
  useEffect(() => { setCampPage(1); }, [period]);
  const filteredCampaigns = useMemo(() => {
    if (!range) return pushCampaigns;
    return pushCampaigns.filter((c) => {
      const d = new Date('2026-08-27T12:00:00'); d.setDate(d.getDate() - c.daysAgo);
      return d >= range.start && d <= range.end;
    });
  }, [range]);
  const campPageCount = Math.max(1, Math.ceil(filteredCampaigns.length / 10));
  const safeCampPage = Math.min(campPage, campPageCount);
  const campRows = filteredCampaigns.slice((safeCampPage - 1) * 10, safeCampPage * 10);

  const tplPageCount = Math.max(1, Math.ceil(templates.length / TPL_PAGE_SIZE));
  const safeTplPage = Math.min(tplPage, tplPageCount);
  const tplRows = templates.slice((safeTplPage - 1) * TPL_PAGE_SIZE, safeTplPage * TPL_PAGE_SIZE);

  const toggle = (set, val, setter) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };

  const recipients = useMemo(() => {
    let base = audience === 'Лиды' ? 38 : audience === 'Избранные' ? 42 : 284;
    if (statuses.size) {
      const f = { Активные: 0.62, Новые: 0.12, Спящие: 0.18 };
      base = Math.round(base * [...statuses].reduce((a, s) => a + (f[s] || 0), 0));
    }
    if (categories.size) base = Math.round(base * (0.35 * categories.size));
    if (locations.size) base = Math.round(base * (0.3 * locations.size));
    if (minCheck) base = Math.round(base * 0.6);
    if (minCashback) base = Math.round(base * 0.5);
    if (favProduct) base = Math.round(base * 0.4);
    if (telegram) base = 1;
    return Math.max(1, base);
  }, [audience, statuses, categories, locations, minCheck, minCashback, favProduct, telegram]);

  const applyTemplate = (t) => {
    setActiveTpl(t.id);
    setTitle(t.name);
    setBody(t.preview);
  };

  const openCreateTpl = () => {
    setTplName(title || '');
    setTplModalOpen(true);
  };

  const confirmCreateTpl = () => {
    const name = tplName.trim() || title || 'Без названия';
    const newTpl = { id: 't-' + Date.now(), name, preview: body, used: 0, conversion: 0, lastUsed: null };
    setTemplates((prev) => [newTpl, ...prev]);
    setTplPage(1);
    setTplModalOpen(false);
    setTplName('');
    toast({ title: 'Шаблон создан' });
  };

  const sendCampaign = () => {
    toast({ title: `Рассылка отправлена · ${num(recipients)} получателей` });
  };

  const analyticsColumns = [
    { key: 'name', header: 'Кампания', render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    { key: 'audience', header: 'Аудитория', render: (r) => <span className="text-muted-foreground">{r.audience}</span> },
    { key: 'sent', header: 'Получателей', align: 'right', render: (r) => <span className="text-muted-foreground">{num(r.sent)}</span> },
    { key: 'delivered', header: 'Доставлено', align: 'right', render: (r) => <span className="text-muted-foreground">{num(r.delivered)}</span> },
    { key: 'purchases', header: 'Покупки', align: 'right', render: (r) => <span className="text-muted-foreground">{r.purchases}</span> },
    { key: 'conversion', header: 'Конверсия', align: 'right', render: (r) => <span className="font-medium text-[hsl(255_100%_72%)]">{r.conversion}%</span> },
    { key: 'revenue', header: 'Выручка', align: 'right', render: (r) => <span className="font-medium text-foreground">{currency(r.revenue)}</span> },
    { key: 'status', header: 'Статус', render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Row 1 — Audience / Message / Preview (equal height) */}
      <div className="grid grid-cols-3 gap-5">
        {/* Audience */}
        <div className="flex h-full flex-col rounded-2xl surface-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-[14px] font-semibold text-foreground">Аудитория</h3>
            <div className="flex items-center gap-1.5 rounded-lg bg-[hsl(255_100%_68%/0.1)] px-2.5 py-1 text-[12px] font-medium text-[hsl(255_100%_75%)]">
              <Send className="h-3.5 w-3.5" /> {num(recipients)} получателей
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <Section label="Аудитория">
              <div className="flex flex-wrap gap-2">
                {pushAudienceOptions.audience.map((a) => (
                  <Chip key={a} active={audience === a} onClick={() => setAudience(a)}>{a}</Chip>
                ))}
              </div>
            </Section>

            <Section label="Статус клиента">
              <div className="flex flex-wrap gap-2">
                {pushAudienceOptions.status.map((s) => (
                  <Chip key={s} active={statuses.has(s)} onClick={() => toggle(statuses, s, setStatuses)}>{s}</Chip>
                ))}
              </div>
            </Section>

            <Section label="Категория">
              <div className="flex flex-wrap gap-2">
                {pushAudienceOptions.category.map((c) => (
                  <Chip key={c} active={categories.has(c)} onClick={() => toggle(categories, c, setCategories)}>{c}</Chip>
                ))}
              </div>
            </Section>

            <Section label="Точка покупки">
              <div className="flex flex-wrap gap-2">
                {pushAudienceOptions.location.map((l) => (
                  <Chip key={l} active={locations.has(l)} onClick={() => toggle(locations, l, setLocations)}>{l}</Chip>
                ))}
              </div>
            </Section>

            <Section label="Доп. фильтры">
              <div className="grid grid-cols-2 gap-2">
                <input value={minCheck} onChange={(e) => setMinCheck(e.target.value)} placeholder="Ср. чек >" className="input-base" />
                <input value={minCashback} onChange={(e) => setMinCashback(e.target.value)} placeholder="Кэшбэк >" className="input-base" />
                <input value={favProduct} onChange={(e) => setFavProduct(e.target.value)} placeholder="Любимый товар" className="input-base" />
                <input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@telegram / клиент" className="input-base" />
              </div>
            </Section>
          </div>
        </div>

        {/* Message */}
        <div className="flex h-full flex-col rounded-2xl surface-card p-5">
          <h3 className="font-heading text-[14px] font-semibold text-foreground">Сообщение</h3>
          <div className="mt-4 space-y-3">
            <Field label="Заголовок">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-base" />
            </Field>
            <Field label="Текст">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="input-base resize-none" />
            </Field>
            <Field label="Промокод">
              <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="ELFKING15" className="input-base" />
            </Field>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground">
              <Paperclip className="h-3.5 w-3.5" /> Медиа
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex h-full flex-col rounded-2xl surface-card p-5">
          <h3 className="font-heading text-[14px] font-semibold text-foreground">Предпросмотр</h3>
          <div className="mt-5 flex justify-center">
            <div className="relative w-full max-w-[220px] rounded-[28px] border border-border bg-[hsl(232_26%_6%)] p-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
              <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-border" />
              <div className="flex items-center gap-2 text-[10px] text-muted-2">
                <Smartphone className="h-3 w-3" /> ElfDuck · сейчас
              </div>
              <div className="mt-2 rounded-xl bg-[hsl(234_22%_11%)] p-3">
                <div className="text-[12px] font-semibold text-foreground">{title || 'Заголовок'}</div>
                <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{body || 'Текст сообщения'}</div>
                {promo && <div className="mt-2 inline-block rounded bg-[hsl(255_100%_68%/0.15)] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(255_100%_75%)]">{promo}</div>}
              </div>
            </div>
          </div>
          <div className="mt-auto space-y-2 pt-5">
            <button
              onClick={openCreateTpl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <Save className="h-4 w-4" /> Создать шаблон
            </button>
            <button
              onClick={sendCampaign}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[hsl(255_100%_68%)] to-[hsl(280_90%_60%)] px-4 py-2 text-[13px] font-medium text-white shadow-[0_4px_20px_-6px_hsl(255_100%_68%)]"
            >
              <Send className="h-4 w-4" /> Отправить ({num(recipients)})
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 — Templates */}
      <div className="rounded-2xl surface-card p-2">
        <div className="flex items-center gap-2 px-4 py-3">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-medium text-foreground">Шаблоны</span>
          <span className="text-[12px] text-muted-2">· {templates.length}</span>
        </div>
        <div className="space-y-2 px-2 pb-2">
          {tplRows.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t)}
              className={cn(
                'w-full rounded-lg border p-3 text-left transition-all',
                activeTpl === t.id
                  ? 'border-[hsl(255_100%_68%/0.4)] bg-[hsl(255_100%_68%/0.08)]'
                  : 'border-border-soft bg-[hsl(232_26%_6%)] hover:border-[hsl(255_100%_68%/0.25)]'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-foreground">{t.name}</span>
                <span className="text-[11px] text-[hsl(255_100%_72%)]">{t.conversion}% конв.</span>
              </div>
              <div className="mt-1 text-[12px] text-muted-foreground">{t.preview}</div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-2">
                <span>Использован: {t.used} раз</span>
                {t.lastUsed && <span>· Последний: {t.lastUsed}</span>}
              </div>
            </button>
          ))}
        </div>
        <Pagination
          page={safeTplPage}
          pageCount={tplPageCount}
          total={templates.length}
          pageSize={TPL_PAGE_SIZE}
          onPageChange={setTplPage}
        />
      </div>

      {/* Row 3 — Campaign effectiveness */}
      <div className="rounded-2xl surface-card p-2">
        <div className="px-4 py-3 text-[13px] font-medium text-foreground">Эффективность рассылок</div>
        <DataTable columns={analyticsColumns} rows={campRows} dense />
        <Pagination
          page={safeCampPage}
          pageCount={campPageCount}
          total={filteredCampaigns.length}
          pageSize={10}
          onPageChange={setCampPage}
        />
      </div>

      {/* Create template modal */}
      <Dialog open={tplModalOpen} onOpenChange={setTplModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Новый шаблон</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-2">Название шаблона</label>
              <input
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                placeholder="Например: Новый вкус недели"
                className="input-base mt-1.5"
                autoFocus
              />
            </div>
            <div className="rounded-lg border border-border-soft bg-[hsl(232_26%_6%)] p-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-2">Содержимое</div>
              <div className="mt-1 text-[13px] font-medium text-foreground">{title || 'Заголовок'}</div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">{body || 'Текст сообщения'}</div>
              {promo && <div className="mt-1 text-[11px] text-[hsl(255_100%_72%)]">Промокод: {promo}</div>}
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setTplModalOpen(false)}
              className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Отмена
            </button>
            <button
              onClick={confirmCreateTpl}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[hsl(255_100%_68%)] to-[hsl(280_90%_60%)] px-4 py-2 text-[13px] font-medium text-white shadow-[0_4px_20px_-6px_hsl(255_100%_68%)]"
            >
              Создать
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-2">{label}</div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-[12px] transition-all',
        active
          ? 'border-[hsl(255_100%_68%/0.4)] bg-[hsl(255_100%_68%/0.14)] text-foreground'
          : 'border-border text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-muted-2">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}