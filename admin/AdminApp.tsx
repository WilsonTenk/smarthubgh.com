import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, CheckCircle2, ChevronRight, ExternalLink, Eye, EyeOff,
  ImageOff, KeyRound, LayoutDashboard, Loader2, LogOut, Menu, Pencil, Plus, Search, ShieldCheck, Trash2, X
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { getAssetPath } from '../utils/assetPath';
import {
  ApiError, Item, Overview, changePassword, deleteItem, getOverview, getSession, listItems, login, logout, reorderItems, saveItem
} from './api';
import { CollectionConfig, Field, collections } from './collections';
import { FieldInput, dangerButton, ghostButton, iconButton, inputClass, primaryButton, secondaryButton } from './fields';
import './admin.css';

/* ------------------------------------------------------------------ helpers */

type Toast = { id: number; kind: 'error' | 'success'; text: string };
type Notify = (kind: Toast['kind'], text: string) => void;

/** True while an editor has unsaved changes; the sidebar asks before leaving. */
let hasUnsavedChanges = false;

const card = 'rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]';

function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · SMART Hub admin`;
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'noindex, nofollow';
  }, [title]);
}

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};

const initials = (name: string) => name.split(/[\s._@-]+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || '?';

/* ------------------------------------------------------------- small pieces */

function Toasts({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
      {toasts.map(toast => (
        <div key={toast.id} role={toast.kind === 'error' ? 'alert' : 'status'}
          className="admin-pop pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm text-white shadow-2xl shadow-slate-900/20">
          {toast.kind === 'error'
            ? <AlertTriangle size={18} className="mt-0.5 flex-none text-amber-300" />
            : <CheckCircle2 size={18} className="mt-0.5 flex-none text-brand-green" />}
          <p className="flex-1 leading-snug">{toast.text}</p>
          <button type="button" aria-label="Dismiss" className="-m-1 rounded-md p-1 text-slate-400 hover:text-white" onClick={() => dismiss(toast.id)}><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}

function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel, busy }: {
  title: string; body: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; busy?: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <div className="admin-fade fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center" onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="admin-pop w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={event => event.stopPropagation()}>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 size={20} /></span>
        <h2 id="confirm-title" className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" className={secondaryButton} onClick={onCancel}>Cancel</button>
          <button type="button" className={dangerButton} disabled={busy} onClick={onConfirm}>{busy && <Loader2 size={16} className="animate-spin" />}{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Thumb({ src, className = '', rounded = 'rounded-xl' }: { src?: string; className?: string; rounded?: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return <div className={`flex items-center justify-center bg-slate-100 text-slate-300 ${rounded} ${className}`}><ImageOff size={18} /></div>;
  }
  return <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} className={`bg-slate-100 object-cover ${rounded} ${className}`} />;
}

const Skeleton: React.FC<{ className: string }> = ({ className }) => <span className={`admin-skeleton block rounded-xl ${className}`} />;

/* --------------------------------------------------------------------- login */

function Login({ onLogin }: { onLogin: (user: string) => void }) {
  useDocumentTitle('Sign in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try { onLogin(await login(username, password)); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="admin-root grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-brand-navy lg:block">
        <img src={getAssetPath('/images/digi-4.jpg')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/55 to-brand-navy/10" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-11 w-11" />
            <span className="text-lg font-bold tracking-tight">SMART Hub GH</span>
          </div>
          <div className="max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-green ring-1 ring-white/15 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />Website admin
            </span>
            <p className="mt-5 text-3xl font-extrabold leading-tight tracking-tight">Share the stories of the young people you serve.</p>
            <p className="mt-3 text-base text-slate-300">Publish news, projects and photos to smarthubgh.com in a few clicks.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <form onSubmit={submit} className="admin-rise w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <BrandLogo className="h-10 w-10" />
            <span className="text-base font-bold text-slate-900">SMART Hub GH</span>
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1.5 text-slate-500">Sign in to manage the website.</p>

          {error && (
            <div role="alert" className="admin-pop mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
              <AlertTriangle size={16} className="mt-0.5 flex-none" />{error}
            </div>
          )}

          <label className="mb-1.5 mt-7 block text-sm font-semibold text-slate-700" htmlFor="admin-user">Username</label>
          <input id="admin-user" className={inputClass} autoComplete="username" autoFocus value={username} onChange={e => setUsername(e.target.value)} required />

          <label className="mb-1.5 mt-5 block text-sm font-semibold text-slate-700" htmlFor="admin-pass">Password</label>
          <div className="relative">
            <input id="admin-pass" type={show ? 'text' : 'password'} className={`${inputClass} pr-11`} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-700">
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <button type="submit" className={`${primaryButton} mt-7 w-full py-3`} disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}Sign in
          </button>
          <a href="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={15} />Back to the website</a>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- editor */

const FieldBlock: React.FC<{ field: Field; value: unknown; onChange: (v: unknown) => void; notify: Notify; hideLabel?: boolean }> = ({ field, value, onChange, notify, hideLabel }) => {
  const id = `field-${field.key}`;
  const inline = !['image', 'images', 'captionedImages', 'html'].includes(field.kind);
  return (
    <div className={field.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
      {field.big || hideLabel
        ? <label htmlFor={id} className="sr-only">{field.label}</label>
        : (
          <label htmlFor={inline ? id : undefined} className="mb-1.5 flex items-baseline gap-1 text-[13px] font-semibold text-slate-700">
            {field.label}{field.required && <span className="text-brand-blue">*</span>}
          </label>
        )}
      <FieldInput id={id} field={field} value={value} onError={message => notify('error', message)} onChange={onChange} />
      {field.help && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{field.help}</p>}
    </div>
  );
}

function Editor({ config, item, onClose, onSaved, notify }: {
  config: CollectionConfig; item: Item | null; onClose?: () => void; onSaved: (items: Item[], saved: Item) => void; notify: Notify;
}) {
  const initial = useMemo(() => (item ? { ...item } : { ...(config.newItem?.() || {}) }), [item, config]);
  const [draft, setDraft] = useState<Item>(initial);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const isNew = !item;
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const fields = useMemo(() => Object.fromEntries(config.fields.map(field => [field.key, field])), [config]);
  useDocumentTitle(isNew ? `New ${config.singular}` : config.title(initial) || config.label);

  useEffect(() => setDraft(initial), [initial]);
  useEffect(() => { hasUnsavedChanges = dirty; return () => { hasUnsavedChanges = false; }; }, [dirty]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const close = () => (dirty ? setLeaving(true) : onClose?.());
  const cancelLeave = useCallback(() => setLeaving(false), []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await saveItem(config.key, draft, item?.id ?? null);
      onSaved(result.items, result.item);
    } catch (e) {
      notify('error', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const renderGroup = (group: CollectionConfig['groups'][number]) => (
    <section key={group.title} className={`${card} p-5 md:p-6`}>
      <header className="mb-4">
        <h3 className="text-[15px] font-bold text-slate-900">{group.title}</h3>
        {group.description && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{group.description}</p>}
      </header>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        {group.fields.map(key => fields[key] && (
          <FieldBlock key={key} field={fields[key]} value={draft[key]} notify={notify} hideLabel={group.fields.length === 1}
            onChange={value => setDraft(current => ({ ...current, [key]: value }))} />
        ))}
      </div>
    </section>
  );

  const main = config.groups.filter(group => !group.side);
  const side = config.groups.filter(group => group.side);
  const viewUrl = !isNew && config.viewUrl ? config.viewUrl(initial) : null;

  return (
    <form onSubmit={submit} className="admin-rise">
      <div className="sticky top-[57px] z-20 -mx-4 mb-6 border-b border-slate-200/70 bg-[#f6f7fb]/85 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8 lg:top-0">
        <div className="flex items-center gap-3">
          {onClose && (
            <button type="button" onClick={close} className={`${iconButton} flex-none border border-slate-200 bg-white`} aria-label={`Back to ${config.label}`}>
              <ArrowLeft size={17} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">{onClose ? config.label : config.description}</p>
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 md:text-xl">
              {isNew ? `New ${config.singular}` : config.singleton ? config.label : config.title(draft) || `Untitled ${config.singular}`}
            </h1>
          </div>
          {dirty && <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Unsaved changes</span>}
          {viewUrl && <a href={viewUrl} target="_blank" rel="noreferrer" className={`${ghostButton} hidden md:inline-flex`}><ExternalLink size={15} />View</a>}
          <button type="submit" className={primaryButton} disabled={busy || (!isNew && !dirty)}>
            {busy && <Loader2 size={16} className="animate-spin" />}{isNew ? 'Publish' : 'Save'}
          </button>
        </div>
      </div>

      {side.length ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">{main.map(renderGroup)}</div>
          <aside className="space-y-6">{side.map(renderGroup)}</aside>
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">{main.map(renderGroup)}</div>
      )}

      {leaving && (
        <ConfirmDialog title="Discard your changes?" body="You have changes that are not saved. If you leave now they will be lost."
          confirmLabel="Discard changes" onCancel={cancelLeave} onConfirm={() => { setLeaving(false); onClose?.(); }} />
      )}
    </form>
  );
}

/* ---------------------------------------------------------------- list views */

type ListProps = {
  config: CollectionConfig; items: Item[]; onEdit: (item: Item) => void; onDelete: (item: Item) => void;
  onMove: (index: number, delta: number) => void; reorderable: boolean;
};

function OrderButtons({ index, count, onMove, dark }: { index: number; count: number; onMove: ListProps['onMove']; dark?: boolean }) {
  const cls = dark ? 'admin-photo-btn' : `${iconButton} h-8 w-8`;
  return (
    <>
      <button type="button" className={cls} aria-label="Move up" title="Move up" disabled={index === 0} onClick={event => { event.stopPropagation(); onMove(index, -1); }}><ArrowUp size={15} /></button>
      <button type="button" className={cls} aria-label="Move down" title="Move down" disabled={index === count - 1} onClick={event => { event.stopPropagation(); onMove(index, 1); }}><ArrowDown size={15} /></button>
    </>
  );
}

const hoverReveal = 'md:opacity-0 md:transition md:group-hover:opacity-100 md:group-focus-within:opacity-100';

function RowList({ config, items, onEdit, onDelete }: ListProps) {
  return (
    <ul className={`${card} divide-y divide-slate-100 overflow-hidden`}>
      {items.map(item => {
        const badge = config.badge?.(item);
        return (
          <li key={String(item.id)} className="group relative flex items-center gap-4 px-4 py-3.5 transition hover:bg-slate-50/80 md:px-5">
            <Thumb src={config.image?.(item)} className="h-14 w-14 flex-none md:h-16 md:w-24" />
            <button type="button" onClick={() => onEdit(item)} className="min-w-0 flex-1 text-left after:absolute after:inset-0 focus:outline-none">
              <p className="truncate font-semibold text-slate-900 group-hover:text-brand-blue">{config.title(item) || 'Untitled'}</p>
              <div className="mt-1 flex min-w-0 items-center gap-2 text-[13px] text-slate-500">
                {badge && <span className="hidden flex-none rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-brand-blue sm:inline">{badge}</span>}
                <span className="truncate">{config.subtitle?.(item)}</span>
              </div>
            </button>
            <div className={`relative z-10 flex flex-none items-center gap-0.5 ${hoverReveal}`}>
              {config.viewUrl && <a className={`${iconButton} max-sm:!hidden`} href={config.viewUrl(item)} target="_blank" rel="noreferrer" aria-label="View on website" title="View on website"><ExternalLink size={16} /></a>}
              <button type="button" className={`${iconButton} max-sm:!hidden`} aria-label="Edit" title="Edit" onClick={() => onEdit(item)}><Pencil size={16} /></button>
              <button type="button" className={`${iconButton} hover:!bg-red-50 hover:!text-red-600`} aria-label="Delete" title="Delete" onClick={() => onDelete(item)}><Trash2 size={16} /></button>
            </div>
            <ChevronRight size={18} className="hidden flex-none text-slate-300 max-sm:block" />
          </li>
        );
      })}
    </ul>
  );
}

function PhotoGrid({ config, items, onEdit, onDelete, onMove, reorderable }: ListProps) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((item, index) => (
        <li key={String(item.id)} className="group">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200/80">
            <button type="button" onClick={() => onEdit(item)} className="block h-full w-full" aria-label={`Edit ${config.title(item)}`}>
              <Thumb src={config.image?.(item)} rounded="" className="h-full w-full transition duration-500 group-hover:scale-[1.04]" />
            </button>
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent ${hoverReveal}`} />
            <div className={`absolute inset-x-0 bottom-0 flex items-center justify-between p-2 ${hoverReveal}`}>
              <span className="flex">{reorderable && <OrderButtons index={index} count={items.length} onMove={onMove} dark />}</span>
              <button type="button" className="admin-photo-btn hover:!bg-red-500/80" aria-label="Delete" title="Delete" onClick={() => onDelete(item)}><Trash2 size={15} /></button>
            </div>
          </div>
          <p className="mt-2 truncate px-0.5 text-[13px] font-medium text-slate-700">{config.title(item)}</p>
        </li>
      ))}
    </ul>
  );
}

function PeopleGrid({ config, items, onEdit, onDelete, onMove, reorderable }: ListProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <li key={String(item.id)} className={`${card} group relative flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lg`}>
          <Thumb src={config.image?.(item)} rounded="rounded-full" className="h-16 w-16 flex-none object-top ring-4 ring-slate-50" />
          <button type="button" onClick={() => onEdit(item)} className="min-w-0 flex-1 text-left after:absolute after:inset-0 focus:outline-none">
            <p className="truncate font-bold text-slate-900 group-hover:text-brand-blue">{config.title(item)}</p>
            <p className="truncate text-[13px] text-slate-500">{config.subtitle?.(item)}</p>
          </button>
          <div className={`relative z-10 flex flex-col items-center ${hoverReveal}`}>
            {reorderable && <OrderButtons index={index} count={items.length} onMove={onMove} />}
            <button type="button" className={`${iconButton} h-8 w-8 hover:!bg-red-50 hover:!text-red-600`} aria-label="Delete" title="Delete" onClick={() => onDelete(item)}><Trash2 size={15} /></button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function LogoGrid({ config, items, onEdit, onDelete, onMove, reorderable }: ListProps) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((item, index) => {
        const logo = config.image?.(item);
        return (
          <li key={String(item.id)} className={`${card} group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg`}>
            <button type="button" onClick={() => onEdit(item)} className="block w-full text-left focus:outline-none">
              <div className="flex h-28 items-center justify-center border-b border-slate-100 bg-slate-50/60 p-5">
                {logo ? <img src={logo} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-2xl font-extrabold text-slate-300">{initials(config.title(item))}</span>}
              </div>
              <p className="truncate px-4 py-3 text-sm font-semibold text-slate-800 group-hover:text-brand-blue">{config.title(item)}</p>
            </button>
            <div className={`absolute right-2 top-2 flex rounded-lg bg-white/95 shadow-sm ring-1 ring-slate-200 ${hoverReveal}`}>
              {reorderable && <OrderButtons index={index} count={items.length} onMove={onMove} />}
              <button type="button" className={`${iconButton} h-8 w-8 hover:!bg-red-50 hover:!text-red-600`} aria-label="Delete" title="Delete" onClick={() => onDelete(item)}><Trash2 size={15} /></button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ListSkeleton({ layout }: { layout: CollectionConfig['layout'] }) {
  if (layout === 'rows') {
    return (
      <div className={`${card} divide-y divide-slate-100`}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-16 w-24" />
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
          </div>
        ))}
      </div>
    );
  }
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">{[0, 1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} className="aspect-[4/3]" />)}</div>;
}

/* --------------------------------------------------------- collection panel */

const CollectionPanel: React.FC<{ config: CollectionConfig; notify: Notify; onChanged: () => void; startNew?: boolean; onStartedNew: () => void }> =
  ({ config, notify, onChanged, startNew, onStartedNew }) => {
  const [items, setItems] = useState<Item[] | null>(null);
  const [editing, setEditing] = useState<Item | 'new' | null>(null);
  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const fail = useCallback((message: string) => notify('error', message), [notify]);
  const cancelDelete = useCallback(() => setDeleting(null), []);
  useDocumentTitle(config.label);

  useEffect(() => {
    let alive = true;
    listItems(config.key).then(list => alive && setItems(list)).catch(e => { if (alive) { setItems([]); fail(e.message); } });
    return () => { alive = false; };
  }, [config, fail]);

  useEffect(() => {
    if (startNew) { setEditing('new'); onStartedNew(); }
  }, [startNew, onStartedNew]);

  useEffect(() => { window.scrollTo(0, 0); }, [editing]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item => [config.title(item), config.subtitle?.(item), config.badge?.(item)].join(' ').toLowerCase().includes(q));
  }, [items, query, config]);

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      setItems(await deleteItem(config.key, String(deleting.id)));
      notify('success', `Deleted “${config.title(deleting)}”.`);
      onChanged();
    } catch (e) { fail((e as Error).message); }
    finally { setBusy(false); setDeleting(null); }
  };

  const move = async (index: number, delta: number) => {
    if (!items) return;
    const next = [...items];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setItems(next);
    try { setItems(await reorderItems(config.key, next.map(item => String(item.id)))); }
    catch (e) { fail((e as Error).message); }
  };

  const saved = (list: Item[], item: Item) => {
    setItems(list);
    setEditing(null);
    notify('success', config.singleton ? 'Contact details saved. They are live on the website.' : `“${config.title(item)}” is saved and live on the website.`);
    onChanged();
  };

  if (!items) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between"><Skeleton className="h-9 w-48" /><Skeleton className="h-10 w-32" /></div>
        <ListSkeleton layout={config.layout} />
      </div>
    );
  }

  if (config.singleton) return <Editor config={config} item={items[0] || null} onSaved={saved} notify={notify} />;
  if (editing) return <Editor config={config} item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={saved} notify={notify} />;

  const Icon = config.icon;
  const reorderable = Boolean(config.sortable && !query.trim());
  const listProps: ListProps = { config, items: filtered, onEdit: setEditing, onDelete: setDeleting, onMove: move, reorderable };

  return (
    <div className="admin-rise">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-[28px]">{config.label}</h1>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>
        </div>
        <button type="button" className={primaryButton} onClick={() => setEditing('new')}><Plus size={17} />Add {config.singular}</button>
      </header>

      {items.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${config.label.toLowerCase()}`}
              aria-label={`Search ${config.label.toLowerCase()}`} className={`${inputClass} py-2 pl-10 text-sm`} />
          </div>
          <p className="text-[13px] text-slate-500">
            {query.trim() ? `${filtered.length} of ${items.length}` : `${items.length} ${config.singular}${items.length === 1 ? "" : "s"}`}
            <span className="hidden sm:inline">{config.sortable ? ' · use the arrows to set the order on the website' : ' · shown newest first on the website'}</span>
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div className={`${card} flex flex-col items-center px-6 py-16 text-center`}>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand-blue"><Icon size={26} /></span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">No {config.singular}s yet</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">{config.description}</p>
          <button type="button" className={`${primaryButton} mt-6`} onClick={() => setEditing('new')}><Plus size={17} />Add the first {config.singular}</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${card} px-6 py-12 text-center text-sm text-slate-500`}>Nothing matches “{query}”.</div>
      ) : config.layout === 'photos' ? <PhotoGrid {...listProps} />
        : config.layout === 'people' ? <PeopleGrid {...listProps} />
        : config.layout === 'logos' ? <LogoGrid {...listProps} />
        : <RowList {...listProps} />}

      {deleting && (
        <ConfirmDialog title={`Delete this ${config.singular}?`} body={`“${config.title(deleting)}” will be removed from the website straight away. This cannot be undone.`}
          confirmLabel="Delete" busy={busy} onCancel={cancelDelete} onConfirm={confirmDelete} />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ overview */

const tints: Record<string, string> = {
  blog: 'bg-blue-50 text-brand-blue',
  projects: 'bg-emerald-50 text-emerald-600',
  gallery: 'bg-amber-50 text-amber-600',
  leadership: 'bg-violet-50 text-violet-600',
  partners: 'bg-rose-50 text-rose-600'
};

function OverviewPanel({ user, overview, go, create }: { user: string; overview: Overview | null; go: (key: string) => void; create: (key: string) => void }) {
  useDocumentTitle('Overview');
  const blog = collections.find(c => c.key === 'blog')!;
  const recent = (overview?.blog || []).slice(0, 4);
  const stats = collections.filter(c => !c.singleton);

  return (
    <div className="admin-rise space-y-8">
      <header>
        <p className="text-sm font-medium text-slate-500">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 md:text-[32px]">{greeting()}, {user}</h1>
        <p className="mt-1.5 text-slate-500">Here's what's on smarthubgh.com right now.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(c => {
          const Icon = c.icon;
          const count = overview?.[c.key as keyof Overview]?.length;
          return (
            <button key={c.key} type="button" onClick={() => go(c.key)} className={`${card} group p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg md:p-5`}>
              <span className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tints[c.key]}`}><Icon size={19} /></span>
                <ArrowUpRight size={16} className="text-slate-300 transition group-hover:text-slate-600" />
              </span>
              <span className="mt-4 block text-[28px] font-extrabold leading-none tracking-tight text-slate-900">{overview ? count ?? 0 : <Skeleton className="h-7 w-10" />}</span>
              <span className="mt-1.5 block text-[13px] font-medium text-slate-500">{c.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className={`${card} overflow-hidden`}>
          <header className="flex items-center justify-between px-5 pb-2 pt-5 md:px-6">
            <h2 className="font-bold text-slate-900">Latest blog posts</h2>
            <button type="button" onClick={() => go('blog')} className="text-sm font-semibold text-brand-blue hover:underline">See all</button>
          </header>
          {overview ? (
            <ul className="divide-y divide-slate-100">
              {recent.map(post => (
                <li key={String(post.id)}>
                  <button type="button" onClick={() => go('blog')} className="flex w-full items-center gap-4 px-5 py-3 text-left transition hover:bg-slate-50 md:px-6">
                    <Thumb src={blog.image?.(post)} className="h-12 w-16 flex-none" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{blog.title(post)}</span>
                      <span className="block truncate text-xs text-slate-500">{blog.subtitle?.(post)}</span>
                    </span>
                  </button>
                </li>
              ))}
              {!recent.length && <li className="px-6 py-8 text-sm text-slate-500">No blog posts yet.</li>}
            </ul>
          ) : (
            <div className="space-y-3 p-6">{[0, 1, 2].map(i => <Skeleton key={i} className="h-12" />)}</div>
          )}
        </section>

        <section className={`${card} p-5 md:p-6`}>
          <h2 className="font-bold text-slate-900">Quick actions</h2>
          <div className="mt-4 space-y-2.5">
            {[
              { key: 'blog', label: 'Write a blog post', hint: 'Share news or a story' },
              { key: 'projects', label: 'Add a project', hint: 'Showcase new work' },
              { key: 'gallery', label: 'Upload photos', hint: 'Add to the gallery' }
            ].map(action => {
              const Icon = collections.find(c => c.key === action.key)!.icon;
              return (
                <button key={action.key} type="button" onClick={() => create(action.key)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-blue/40 hover:bg-blue-50/40">
                  <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-lg ${tints[action.key]}`}><Icon size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{action.label}</span>
                    <span className="block text-xs text-slate-500">{action.hint}</span>
                  </span>
                  <Plus size={17} className="text-slate-400 transition group-hover:text-brand-blue" />
                </button>
              );
            })}
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Open the website<ArrowUpRight size={16} />
          </a>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- account */

function AccountPanel({ user, notify }: { user: string; notify: Notify }) {
  useDocumentTitle('Account');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try { await changePassword(current, next); setCurrent(''); setNext(''); notify('success', 'Your password has been changed.'); }
    catch (e) { notify('error', (e as Error).message); }
    finally { setBusy(false); }
  };
  const strength = next.length === 0 ? 0 : next.length < 10 ? 1 : next.length < 14 ? 2 : 3;
  return (
    <div className="admin-rise max-w-xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-[28px]">Account</h1>
      <p className="mt-1 text-sm text-slate-500">Signed in as <span className="font-semibold text-slate-700">{user}</span>.</p>
      <form onSubmit={submit} className={`${card} mt-6 p-6`}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue"><KeyRound size={18} /></span>
          <div>
            <h2 className="font-bold text-slate-900">Change password</h2>
            <p className="text-xs text-slate-500">Use at least 10 characters. A short sentence works well.</p>
          </div>
        </div>
        <label className="mb-1.5 mt-6 block text-[13px] font-semibold text-slate-700" htmlFor="pw-current">Current password</label>
        <input id="pw-current" type="password" className={inputClass} autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} required />
        <label className="mb-1.5 mt-5 block text-[13px] font-semibold text-slate-700" htmlFor="pw-next">New password</label>
        <input id="pw-next" type="password" className={inputClass} autoComplete="new-password" minLength={10} value={next} onChange={e => setNext(e.target.value)} required />
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {[1, 2, 3].map(level => (
            <span key={level} className={`h-1 flex-1 rounded-full transition ${strength >= level ? (strength === 1 ? 'bg-amber-400' : 'bg-brand-green') : 'bg-slate-200'}`} />
          ))}
        </div>
        <button type="submit" className={`${primaryButton} mt-6`} disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />}Update password</button>
      </form>
    </div>
  );
}

/* ----------------------------------------------------------------- app shell */

const sections = ['overview', ...collections.map(c => c.key), 'account'];
const readHash = () => {
  const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
  return sections.includes(hash) ? hash : 'overview';
};

const AdminApp: React.FC = () => {
  const [user, setUser] = useState<string | null | undefined>(undefined);
  const [startupError, setStartupError] = useState('');
  const [section, setSection] = useState<string>(readHash);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [pendingNew, setPendingNew] = useState<string | null>(null);

  const dismiss = useCallback((id: number) => setToasts(list => list.filter(toast => toast.id !== id)), []);
  const notify = useCallback<Notify>((kind, text) => {
    const id = Date.now() + Math.random();
    setToasts(list => [...list.slice(-2), { id, kind, text }]);
    window.setTimeout(() => dismiss(id), kind === 'error' ? 7000 : 4000);
  }, [dismiss]);

  const refreshOverview = useCallback(() => { getOverview().then(setOverview).catch(() => setOverview({})); }, []);

  useEffect(() => {
    getSession().then(setUser).catch((e: ApiError) => { setUser(null); setStartupError(e.message); });
  }, []);
  useEffect(() => { if (user) refreshOverview(); }, [user, refreshOverview]);
  useEffect(() => {
    const onHash = () => setSection(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((key: string) => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Leave without saving?')) return;
    hasUnsavedChanges = false;
    setDrawer(false);
    if (window.location.hash.slice(1) !== key) window.history.pushState(null, '', `#${key}`);
    setSection(key);
    window.scrollTo(0, 0);
  }, []);
  const create = useCallback((key: string) => { setPendingNew(key); go(key); }, [go]);
  const clearPending = useCallback(() => setPendingNew(null), []);

  if (user === undefined) {
    return <div className="admin-root flex min-h-screen items-center justify-center bg-[#f6f7fb]"><Loader2 className="animate-spin text-brand-blue" /></div>;
  }

  if (startupError) {
    return (
      <div className="admin-root flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4">
        <div className={`${card} admin-rise max-w-md p-8`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600"><AlertTriangle size={20} /></span>
          <h1 className="mt-4 text-lg font-bold text-slate-900">The admin isn't available yet</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{startupError}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">If this is a new installation, open <a className="font-semibold text-brand-blue underline" href="/api/install.php">the setup page</a> to finish.</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login onLogin={setUser} />;

  const active = collections.find(c => c.key === section);
  const signOut = async () => { try { await logout(); } finally { setUser(null); } };

  const navButton = (key: string, label: string, Icon: React.ComponentType<{ size?: number }>, count?: number) => {
    const selected = section === key;
    return (
      <button key={key} type="button" onClick={() => go(key)} aria-current={selected ? 'page' : undefined}
        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${selected ? 'bg-blue-50 text-brand-blue' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
        <span className={selected ? 'text-brand-blue' : 'text-slate-400 group-hover:text-slate-600'}><Icon size={18} /></span>
        <span className="flex-1 text-left">{label}</span>
        {count !== undefined && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${selected ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 text-slate-500'}`}>{count}</span>}
      </button>
    );
  };

  const countOf = (key: string) => overview?.[key as keyof Overview]?.length;

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <BrandLogo className="h-10 w-10 ring-1 ring-slate-200" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-extrabold tracking-tight text-slate-900">SMART Hub</p>
          <p className="text-xs font-medium text-slate-500">Website admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3" aria-label="Admin sections">
        <div className="space-y-1">{navButton('overview', 'Overview', LayoutDashboard)}</div>
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Content</p>
          <div className="space-y-1">
            {collections.filter(c => ['blog', 'projects', 'gallery'].includes(c.key)).map(c => navButton(c.key, c.label, c.icon, countOf(c.key)))}
          </div>
        </div>
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Organisation</p>
          <div className="space-y-1">
            {collections.filter(c => ['leadership', 'partners', 'settings'].includes(c.key)).map(c => navButton(c.key, c.label, c.icon, c.singleton ? undefined : countOf(c.key)))}
          </div>
        </div>
      </nav>
      <div className="border-t border-slate-100 p-3">
        <button type="button" onClick={() => go('account')} className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${section === 'account' ? 'bg-blue-50' : 'hover:bg-slate-100'}`}>
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-green text-xs font-bold text-white">{initials(user)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-900">{user}</span>
            <span className="flex items-center gap-1 text-xs text-slate-500"><ShieldCheck size={12} />Administrator</span>
          </span>
        </button>
        <button type="button" onClick={signOut} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600">
          <LogOut size={16} />Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-root min-h-screen bg-[#f6f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-slate-200/80 bg-white lg:block">{nav}</aside>

      {drawer && (
        <div className="admin-fade fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setDrawer(false)}>
          <aside className="admin-slide h-full w-[280px] max-w-[85vw] bg-white shadow-2xl" onClick={event => event.stopPropagation()}>{nav}</aside>
        </div>
      )}

      <div className="lg:pl-[264px]">
        <div className="sticky top-0 z-30 flex h-[57px] items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md lg:hidden">
          <button type="button" className={iconButton} aria-label="Open menu" onClick={() => setDrawer(true)}><Menu size={20} /></button>
          <BrandLogo className="h-8 w-8" />
          <span className="flex-1 truncate text-sm font-bold">{active?.label || (section === 'account' ? 'Account' : 'Overview')}</span>
          <a href="/" target="_blank" rel="noreferrer" className={iconButton} aria-label="Open the website"><ExternalLink size={18} /></a>
        </div>

        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:px-8 lg:pt-8">
          {section === 'overview' && <OverviewPanel user={user} overview={overview} go={go} create={create} />}
          {section === 'account' && <AccountPanel user={user} notify={notify} />}
          {active && (
            <CollectionPanel key={active.key} config={active} notify={notify} onChanged={refreshOverview}
              startNew={pendingNew === active.key} onStartedNew={clearPending} />
          )}
        </main>
      </div>

      <Toasts toasts={toasts} dismiss={dismiss} />
    </div>
  );
};

export default AdminApp;
