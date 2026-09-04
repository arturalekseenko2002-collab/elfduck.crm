import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Save, Smartphone, Paperclip, Layers } from 'lucide-react';
import { currency, num } from '@/lib/mockData';
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/shared/Badge';
import Pagination from '@/components/shared/Pagination';
import MetricGrid from '@/components/shared/MetricGrid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { usePeriod } from '@/lib/PeriodContext';
import { cn } from '@/lib/utils';

const TPL_PAGE_SIZE = 5;

const CRM_API_URL = String(
  import.meta.env.VITE_CRM_API_URL || ''
).replace(/\/+$/, '');

const PERIOD_MAP = {
  'Сегодня': 'today',
  'Неделя': 'week',
  'Месяц': 'month',
  '3 мес': '3m',
  '3 месяца': '3m',
  '6 мес': '6m',
  '6 месяцев': '6m',
  'Всё': 'all',
  'Все время': 'all',
  'Всё время': 'all',
};

async function crmFetch(path, options = {}) {
  const response = await fetch(
    `${CRM_API_URL}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (
    !response.ok ||
    data?.ok === false
  ) {
    throw new Error(
      data?.error ||
        data?.message ||
        'CRM_REQUEST_FAILED'
    );
  }

  return data;
}

function buildPeriodQuery(period, range) {
  const standardPeriod =
    PERIOD_MAP[String(period || '')];

  if (standardPeriod) {
    return new URLSearchParams({
      period: standardPeriod,
    }).toString();
  }

  if (
    range?.start &&
    range?.end
  ) {
    const toDateOnly = (value) => {
      const date = new Date(value);

      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, '0');

      const day =
        String(
          date.getDate()
        ).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    return new URLSearchParams({
      from: toDateOnly(
        range.start
      ),
      to: toDateOnly(
        range.end
      ),
    }).toString();
  }

  return 'period=month';
}

function CampaignMobileRow({ r }) {
  return (
    <div className="rounded-xl border border-border-soft bg-[hsl(232_26%_6%)] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-foreground">{r.name}</div>
          <div className="text-[11px] text-muted-2">Аудитория: {r.audience}</div>
        </div>
        <Badge status={r.status} />
      </div>
      <div className="mt-3 border-t border-border-soft pt-3">
<MetricGrid cols={3} items={[

  { label: 'Получателей', value: num(r.recipients) },

  { label: 'Отправлено', value: num(r.sent) },

  { label: 'Покупки', value: num(r.purchases) },

]} />
        <div className="mt-2.5">
          <MetricGrid cols={2} items={[
            { label: 'Конверсия', value: `${r.conversion}%`, className: 'text-[hsl(255_100%_72%)]' },
            { label: 'Выручка', value: currency(r.revenue), className: 'text-foreground' },
          ]} />
        </div>
      </div>
    </div>
  );
}

export default function Push() {
  const [audience, setAudience] = useState('all');
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

  const [tplPage, setTplPage] = useState(1);
  const [tplModalOpen, setTplModalOpen] = useState(false);
  const [tplName, setTplName] = useState('');

  const { period, range } = usePeriod();

const periodQuery = useMemo(
  () =>
    buildPeriodQuery(
      period,
      range
    ),
  [period, range]
);

const {
  data: metaData,
  // isLoading: metaLoading,
} = useQuery({
  queryKey: [
    'crm-push-meta',
  ],
  queryFn: () =>
    crmFetch(
      '/crm/push/meta'
    ),
  staleTime:
    5 * 60 * 1000,
});

const pushMeta = {
  audiences:
    metaData?.audiences || [],

  statuses:
    metaData?.statuses || [],

  categories:
    metaData?.categories || [],

  locations:
    metaData?.locations || [],

  products:
    metaData?.products || [],
};

const {
  data: templatesData,
  // isLoading: templatesLoading,
} = useQuery({
  queryKey: [
    'crm-push-templates',
  ],

  queryFn: () =>
    crmFetch(
      '/crm/push/templates'
    ),
});

const templates =
  templatesData?.templates ||
  [];

const {
  data: campaignsData,
  // isLoading: campaignsLoading,
} = useQuery({
  queryKey: [
    'crm-push-campaigns',
    periodQuery,
  ],

  queryFn: () =>
    crmFetch(
      `/crm/push/campaigns?${periodQuery}`
    ),
});

const campaigns =
  campaignsData?.campaigns ||
  [];

  const audiencePayload =
  useMemo(
    () => ({
      audience,

      statuses:
        Array.from(
          statuses
        ),

      categoryKeys:
        Array.from(
          categories
        ),

      locationKeys:
        Array.from(
          locations
        ),

      minCheck:
        Number(
          minCheck || 0
        ),

      minCashback:
        Number(
          minCashback || 0
        ),

      favProduct:
        String(
          favProduct || ''
        ).trim(),

      telegram:
        String(
          telegram || ''
        ).trim(),
    }),
    [
      audience,
      statuses,
      categories,
      locations,
      minCheck,
      minCashback,
      favProduct,
      telegram,
    ]
  );

const [
  debouncedAudiencePayload,
  setDebouncedAudiencePayload,
] = useState(
  audiencePayload
);

useEffect(() => {
  const timer =
    setTimeout(() => {
      setDebouncedAudiencePayload(
        audiencePayload
      );
    }, 350);

  return () =>
    clearTimeout(timer);
}, [audiencePayload]);

const {
  data: audiencePreview,
  isFetching:
    audiencePreviewLoading,
} = useQuery({
  queryKey: [
    'crm-push-audience-preview',
    periodQuery,
    debouncedAudiencePayload,
  ],

  queryFn: () =>
    crmFetch(
      `/crm/push/audience-preview?${periodQuery}`,
      {
        method: 'POST',

        body:
          JSON.stringify(
            debouncedAudiencePayload
          ),
      }
    ),
});

const recipients =
  Number(
    audiencePreview?.total ||
      0
  );

  const [
  campPage,
  setCampPage,
] = useState(1);

useEffect(() => {
  setCampPage(1);
}, [period, range]);

const filteredCampaigns =
  campaigns;

const campPageCount =
  Math.max(
    1,
    Math.ceil(
      filteredCampaigns.length /
        10
    )
  );

const safeCampPage =
  Math.min(
    campPage,
    campPageCount
  );

const campRows =
  filteredCampaigns.slice(
    (safeCampPage - 1) *
      10,

    safeCampPage * 10
  );
  

  const tplPageCount = Math.max(1, Math.ceil(templates.length / TPL_PAGE_SIZE));
  const safeTplPage = Math.min(tplPage, tplPageCount);
  const tplRows = templates.slice((safeTplPage - 1) * TPL_PAGE_SIZE, safeTplPage * TPL_PAGE_SIZE);

  const toggle = (set, val, setter) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };


const applyTemplate = (t) => {
  setActiveTpl(t.id);

  setTitle(
    t.title ||
      t.name ||
      ''
  );

  setBody(
    t.text ||
      t.preview ||
      ''
  );

  setPromo(
    t.promo || ''
  );
};

  const openCreateTpl = () => {
    setTplName(title || '');
    setTplModalOpen(true);
  };

const confirmCreateTpl = () => {
  toast({
    title:
      'Создание шаблонов подключим после авторизации CRM',
  });
};

  const sendCampaign = () => {
  toast({
    title:
      'Отправка пока заблокирована',
    description:
      'Сначала подключим безопасную авторизацию CRM.',
  });
};

  const analyticsColumns = [
    { key: 'name', header: 'Кампания', render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    { key: 'audience', header: 'Аудитория', render: (r) => <span className="text-muted-foreground">{r.audience}</span> },
{
  key: 'recipients',
  header: 'Получателей',
  align: 'right',
  render: (r) => (
    <span className="text-muted-foreground">
      {num(r.recipients)}
    </span>
  ),
},
{
  key: 'sent',
  header: 'Отправлено',
  align: 'right',
  render: (r) => (
    <span className="text-muted-foreground">
      {num(r.sent)}
    </span>
  ),
},
    { key: 'purchases', header: 'Покупки', align: 'right', render: (r) => <span className="text-muted-foreground">{r.purchases}</span> },
    { key: 'conversion', header: 'Конверсия', align: 'right', render: (r) => <span className="font-medium text-[hsl(255_100%_72%)]">{r.conversion}%</span> },
    { key: 'revenue', header: 'Выручка', align: 'right', render: (r) => <span className="font-medium text-foreground">{currency(r.revenue)}</span> },
    { key: 'status', header: 'Статус', render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Row 1 — Audience / Message / Preview (equal height) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Audience */}
        <div className="flex h-full flex-col rounded-2xl surface-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-[14px] font-semibold text-foreground">Аудитория</h3>
            <div className="flex items-center gap-1.5 rounded-lg bg-[hsl(255_100%_68%/0.1)] px-2.5 py-1 text-[12px] font-medium text-[hsl(255_100%_75%)]">
              <Send className="h-3.5 w-3.5" />
{audiencePreviewLoading
  ? '…'
  : num(recipients)}{' '}
получателей
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <Section label="Аудитория">
              <div className="flex flex-wrap gap-2">
{pushMeta.audiences.map(
  (item) => (
    <Chip
      key={item.key}
      active={
        audience ===
        item.key
      }
      onClick={() =>
        setAudience(
          item.key
        )
      }
    >
      {item.label}
    </Chip>
  )
)}
              </div>
            </Section>

            <Section label="Статус клиента">
              <div className="flex flex-wrap gap-2">
{pushMeta.statuses.map(
  (item) => (
    <Chip
      key={item.key}
      active={
        statuses.has(
          item.key
        )
      }
      onClick={() =>
        toggle(
          statuses,
          item.key,
          setStatuses
        )
      }
    >
      {item.label}
    </Chip>
  )
)}
              </div>
            </Section>

            <Section label="Категория">
              <div className="flex flex-wrap gap-2">
{pushMeta.categories.map(
  (item) => (
    <Chip
      key={item.key}
      active={
        categories.has(
          item.key
        )
      }
      onClick={() =>
        toggle(
          categories,
          item.key,
          setCategories
        )
      }
    >
      {item.label}
    </Chip>
  )
)}
              </div>
            </Section>

            <Section label="Точка покупки">
              <div className="flex flex-wrap gap-2">
{pushMeta.locations.map(
  (item) => (
    <Chip
      key={item.key}
      active={
        locations.has(
          item.key
        )
      }
      onClick={() =>
        toggle(
          locations,
          item.key,
          setLocations
        )
      }
    >
      {item.label}
    </Chip>
  )
)}
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
              <Send className="h-4 w-4" />
Отправить (
{audiencePreviewLoading
  ? '…'
  : num(recipients)}
)
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
        <div className="hidden md:block">
          <DataTable columns={analyticsColumns} rows={campRows} dense />
        </div>
        <div className="space-y-2.5 p-1 md:hidden">
          {campRows.map((r) => (
            <CampaignMobileRow key={r.id} r={r} />
          ))}
        </div>
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
        <DialogContent className="max-w-md w-[calc(100%-1.5rem)]">
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