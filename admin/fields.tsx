import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bold, Code2, Heading2, ImagePlus, Italic, Link2, List, Loader2, PenLine, Pilcrow, Trash2, UploadCloud, X } from 'lucide-react';
import { uploadImage } from './api';
import type { Field } from './collections';

export const inputClass = 'admin-input w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10';
const buttonBase = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';
export const primaryButton = `${buttonBase} bg-brand-blue text-white shadow-[0_6px_16px_-6px_rgba(0,85,255,0.6)] hover:bg-[#0047d6]`;
export const secondaryButton = `${buttonBase} border border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:bg-slate-50`;
export const ghostButton = `${buttonBase} text-slate-600 hover:bg-slate-100 hover:text-slate-900`;
export const dangerButton = `${buttonBase} bg-red-600 text-white hover:bg-red-700`;
export const iconButton = 'inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30';

type OnError = (message: string) => void;

function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

const isImage = (file: File) => /^image\/(jpeg|png|webp|gif)$/.test(file.type);

/** Click-or-drop area that uploads images and reports their URLs. */
function Dropzone({ multiple, onUploaded, onError, compact, bare, children }: {
  multiple?: boolean; onUploaded: (urls: string[]) => void; onError: OnError; compact?: boolean; bare?: boolean; children?: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  const upload = async (list: FileList | File[] | null) => {
    const files = Array.from(list || []).filter(isImage).slice(0, multiple ? 30 : 1);
    if (!files.length) { if (list && Array.from(list).length) onError('Please choose JPG, PNG, WebP or GIF images.'); return; }
    const urls: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        setBusy(files.length > 1 ? `Uploading ${index + 1} of ${files.length}…` : 'Uploading…');
        urls.push(await uploadImage(file));
      }
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setBusy(null);
      if (input.current) input.current.value = '';
      if (urls.length) onUploaded(urls);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !busy && input.current?.click()}
      onKeyDown={event => { if ((event.key === 'Enter' || event.key === ' ') && !busy) { event.preventDefault(); input.current?.click(); } }}
      onDragOver={event => { event.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={event => { event.preventDefault(); setOver(false); upload(event.dataTransfer.files); }}
      className={bare ? "inline-flex cursor-pointer items-center rounded-lg bg-white px-3 py-2 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/20" : `group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/15 ${compact ? 'px-4 py-5' : 'px-6 py-9'} ${over ? 'border-brand-blue bg-blue-50/70' : 'border-slate-200 bg-slate-50/60 hover:border-brand-blue/50 hover:bg-blue-50/40'}`}
    >
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple={multiple} hidden onChange={event => upload(event.target.files)} />
      {busy ? (
        <>
          <Loader2 size={bare ? 14 : 22} className="animate-spin text-brand-blue" />
          {!bare && <p className="mt-2 text-sm font-semibold text-slate-700">{busy}</p>}
        </>
      ) : children || (
        <>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-blue shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105">
            <UploadCloud size={20} />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            <span className="text-brand-blue">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP or GIF · up to 12 MB{multiple ? ' · several at once' : ''}</p>
        </>
      )}
    </div>
  );
}

function ImageField({ value, onChange, onError }: { value: string; onChange: (v: string) => void; onError: OnError }) {
  const [showUrl, setShowUrl] = useState(false);
  return (
    <div className="space-y-2.5">
      {value ? (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-[repeating-conic-gradient(#f1f5f9_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
          <img src={value} alt="" className="max-h-72 w-full object-contain" />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-slate-900/60 to-transparent p-3 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <Dropzone onUploaded={urls => onChange(urls[0])} onError={onError} bare>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700"><ImagePlus size={14} />Replace</span>
            </Dropzone>
            <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50">
              <Trash2 size={14} />Remove
            </button>
          </div>
        </div>
      ) : (
        <Dropzone onUploaded={urls => onChange(urls[0])} onError={onError} />
      )}
      {showUrl || (value && !value.startsWith('/uploads/'))
        ? <input className={`${inputClass} text-xs text-slate-500`} value={value} placeholder="/images/photo.jpg" aria-label="Image address" onChange={event => onChange(event.target.value)} />
        : <button type="button" className="text-xs font-medium text-slate-500 hover:text-brand-blue" onClick={() => setShowUrl(true)}>Use an existing image address instead</button>}
    </div>
  );
}

function ImagesField({ value, onChange, onError }: { value: string[]; onChange: (v: string[]) => void; onError: OnError }) {
  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {value.map((src, index) => (
            <li key={`${src}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
              <img src={src} alt="" className="h-full w-full object-cover" />
              {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm">First</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-slate-900/70 to-transparent p-1.5 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                <span className="flex">
                  <button type="button" className="admin-photo-btn" aria-label="Move earlier" disabled={index === 0} onClick={() => onChange(move(value, index, -1))}><ArrowLeft size={14} /></button>
                  <button type="button" className="admin-photo-btn" aria-label="Move later" disabled={index === value.length - 1} onClick={() => onChange(move(value, index, 1))}><ArrowRight size={14} /></button>
                </span>
                <button type="button" className="admin-photo-btn hover:!text-red-300" aria-label="Remove photo" onClick={() => onChange(value.filter((_, i) => i !== index))}><Trash2 size={14} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dropzone multiple compact={value.length > 0} onUploaded={urls => onChange([...value, ...urls])} onError={onError} />
    </div>
  );
}

type Captioned = { src: string; alt: string; caption?: string };

function CaptionedImagesField({ value, onChange, onError }: { value: Captioned[]; onChange: (v: Captioned[]) => void; onError: OnError }) {
  const update = (index: number, patch: Partial<Captioned>) => onChange(value.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  return (
    <div className="space-y-3">
      {value.map((image, index) => (
        <div key={`${image.src}-${index}`} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5">
          <img src={image.src} alt="" className="h-[88px] w-28 flex-none rounded-lg object-cover ring-1 ring-slate-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <input className={`${inputClass} py-2 text-sm`} placeholder="Caption (optional)" value={image.caption || ''} onChange={event => update(index, { caption: event.target.value })} />
            <input className={`${inputClass} py-2 text-sm`} placeholder="Describe the photo" value={image.alt} onChange={event => update(index, { alt: event.target.value })} />
          </div>
          <div className="flex flex-col">
            <button type="button" className={`${iconButton} h-7 w-7`} aria-label="Move earlier" disabled={index === 0} onClick={() => onChange(move(value, index, -1))}><ArrowLeft size={14} className="rotate-90" /></button>
            <button type="button" className={`${iconButton} h-7 w-7`} aria-label="Move later" disabled={index === value.length - 1} onClick={() => onChange(move(value, index, 1))}><ArrowRight size={14} className="rotate-90" /></button>
            <button type="button" className={`${iconButton} h-7 w-7 hover:text-red-600`} aria-label="Remove photo" onClick={() => onChange(value.filter((_, i) => i !== index))}><X size={14} /></button>
          </div>
        </div>
      ))}
      <Dropzone multiple compact={value.length > 0} onUploaded={urls => onChange([...value, ...urls.map(src => ({ src, alt: '' }))])} onError={onError} />
    </div>
  );
}

const escapeHtml = (text: string) => text.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

/** Turns pasted plain text into paragraphs: a blank line starts a new paragraph. */
const textToHtml = (text: string) => text.split(/\n\s*\n/).map(block => block.trim()).filter(Boolean)
  .map(block => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`).join('');

type Tool = { icon: React.ReactNode; title: string; command: string; arg?: string; block?: string };

const tools: Tool[] = [
  { icon: <Heading2 size={16} />, title: 'Heading', command: 'formatBlock', arg: 'h2', block: 'h2' },
  { icon: <Pilcrow size={16} />, title: 'Normal text', command: 'formatBlock', arg: 'p', block: 'p' },
  { icon: <Bold size={16} />, title: 'Bold', command: 'bold' },
  { icon: <Italic size={16} />, title: 'Italic', command: 'italic' },
  { icon: <List size={16} />, title: 'Bulleted list', command: 'insertUnorderedList' },
  { icon: <Link2 size={16} />, title: 'Link', command: 'createLink' }
];

/** Visual article editor, with an HTML view for fine-tuning. */
function HtmlField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState(false);
  const [active, setActive] = useState<Record<string, boolean>>({});

  // Only push outside changes into the editor, so typing never moves the cursor.
  useEffect(() => {
    const el = editor.current;
    if (el && !source && el.innerHTML !== value) el.innerHTML = value;
  }, [value, source]);

  const sync = () => {
    const el = editor.current;
    if (!el) return;
    const html = el.innerHTML === '<br>' ? '' : el.innerHTML;
    if (html !== value) onChange(html);
  };

  const refreshActive = () => {
    const block = String(document.queryCommandValue('formatBlock') || '').toLowerCase();
    setActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      h2: block === 'h2'
    });
  };

  const run = (tool: Tool) => {
    editor.current?.focus();
    if (tool.command === 'createLink') {
      const url = window.prompt('Link address (https://…)');
      if (!url) return;
      document.execCommand('createLink', false, url);
    } else {
      document.execCommand(tool.command, false, tool.arg ? `<${tool.arg}>` : undefined);
    }
    sync();
    refreshActive();
  };

  const paste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    // Paste as clean text so formatting from Word or WhatsApp doesn't come along.
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    const html = /\n\s*\n/.test(text) ? textToHtml(text) : escapeHtml(text).replace(/\n/g, '<br>');
    document.execCommand('insertHTML', false, html);
    sync();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/10">
      <div className="sticky top-0 flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/90 px-2 py-1.5">
        {!source && tools.map(tool => {
          const on = tool.block ? active[tool.block] : active[tool.command];
          return (
            <button key={tool.title} type="button" title={tool.title} aria-label={tool.title} aria-pressed={on || undefined}
              onMouseDown={event => event.preventDefault()} onClick={() => run(tool)}
              className={`${iconButton} h-8 w-8 ${on ? '!bg-blue-100 !text-brand-blue' : ''}`}>{tool.icon}</button>
          );
        })}
        <div className="ml-auto flex rounded-lg bg-slate-200/60 p-0.5 text-xs font-semibold">
          <button type="button" onClick={() => setSource(false)} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 ${!source ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><PenLine size={13} />Visual</button>
          <button type="button" onClick={() => setSource(true)} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 ${source ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><Code2 size={13} />HTML</button>
        </div>
      </div>
      {source
        ? <textarea aria-label="Article HTML" className="block min-h-[420px] w-full resize-y border-0 bg-slate-950 px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-slate-200 focus:outline-none" value={value} onChange={event => onChange(event.target.value)} />
        : (
          <div ref={editor} role="textbox" aria-multiline="true" aria-label="Article" contentEditable suppressContentEditableWarning
            data-placeholder="Start writing your story… You can paste text from Word or WhatsApp."
            onInput={sync} onBlur={sync} onPaste={paste} onKeyUp={refreshActive} onMouseUp={refreshActive}
            className="admin-preview admin-editable max-h-[70vh] min-h-[420px] overflow-y-auto px-6 py-5 focus:outline-none" />
        )}
    </div>
  );
}

export function FieldInput({ field, value, onChange, onError, id }: { id?: string; field: Field; value: unknown; onChange: (v: unknown) => void; onError: OnError }) {
  const str = value === undefined || value === null ? '' : String(value);
  switch (field.kind) {
    case 'textarea':
      return <textarea id={id} className={`${inputClass} min-h-[112px] resize-y leading-relaxed`} value={str} placeholder={field.placeholder} onChange={event => onChange(event.target.value)} />;
    case 'html':
      return <HtmlField value={str} onChange={onChange} />;
    case 'select':
      return (
        <select id={id} className={`${inputClass} admin-select`} value={str} onChange={event => onChange(event.target.value)}>
          {field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      );
    case 'number':
      return <input id={id} className={inputClass} type="number" step="0.1" value={str} placeholder={field.placeholder} onChange={event => onChange(event.target.value)} />;
    case 'image':
      return <ImageField value={str} onChange={onChange} onError={onError} />;
    case 'images':
      return <ImagesField value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} onError={onError} />;
    case 'captionedImages':
      return <CaptionedImagesField value={Array.isArray(value) ? (value as Captioned[]) : []} onChange={onChange} onError={onError} />;
    default:
      return (
        <input id={id} value={str} placeholder={field.placeholder} onChange={event => onChange(event.target.value)}
          className={field.big ? `${inputClass} py-3 text-xl font-bold tracking-tight md:text-2xl` : inputClass} />
      );
  }
}
