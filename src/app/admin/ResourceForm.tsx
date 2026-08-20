'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminResourceAction } from '@/lib/actions/admin-resources';

type Option = string | { value: string; label: string };
type Field = { name: string; label: string; type?: string; options?: Option[]; value?: string | number | boolean; placeholder?: string; required?: boolean };

const isImageField = (field: Field) => ['storage_path', 'image_path', 'featured_image_path'].includes(field.name);

export function ResourceForm({ resource, fields, id, title = 'Add item' }: { resource: string; fields: Field[]; id?: string; title?: string }) {
  const [open, setOpen] = useState(Boolean(id));
  const searchParams = useSearchParams();
  const saved = searchParams.get('saved') === '1';

  return (
    <div className="rounded-xl border border-sand bg-white p-5">
      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="font-medium text-ink">+ {title}</button>
      )}
      {open && (
        <>
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-ink">{title}</span>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink/60 hover:text-ink">Hide</button>
          </div>
          <form action={adminResourceAction} className="mt-5 grid gap-4 md:grid-cols-2">
            <input type="hidden" name="_resource" value={resource} />
            <input type="hidden" name="_id" value={id ?? ''} />
            {fields.map(f => (
              <label key={f.name} className="block text-sm text-ink/70 md:col-span-1">
                <span className="mb-1 block">{f.label}</span>
                {isImageField(f) ? (
                  <ImageField field={f} />
                ) : f.type === 'textarea' ? (
                  <textarea name={f.name} defaultValue={String(f.value ?? '')} required={f.required} placeholder={f.placeholder} className="min-h-28 w-full rounded-md border border-sand px-3 py-2" />
                ) : f.type === 'select' ? (
                  <select name={f.name} defaultValue={String(f.value ?? '')} className="w-full rounded-md border border-sand px-3 py-2">{f.options?.map(o => { const x = typeof o === 'string' ? { value: o, label: o } : o; return <option key={x.value} value={x.value}>{x.label}</option>; })}</select>
                ) : f.type === 'checkbox' ? (
                  <input type="checkbox" name={f.name} defaultChecked={Boolean(f.value)} className="h-4 w-4" />
                ) : (
                  <input name={f.name} type={f.type ?? 'text'} defaultValue={String(f.value ?? '')} required={f.required} placeholder={f.placeholder} className="w-full rounded-md border border-sand px-3 py-2" />
                )}
              </label>
            ))}
            <div className="md:col-span-2"><button className="rounded-md bg-reservoir px-4 py-2 text-sm font-medium text-white">Save</button></div>
          </form>
        </>
      )}
      {saved && !id && <p className="mt-3 text-sm font-medium text-green-700">Changes saved successfully.</p>}
    </div>
  );
}

function ImageField({ field }: { field: Field }) {
  const [url, setUrl] = useState(String(field.value ?? ''));
  const [preview, setPreview] = useState(String(field.value ?? ''));

  useEffect(() => () => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
  }, [preview]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setUrl('');
  }

  return (
    <div className="space-y-2">
      <input
        name={field.name}
        type="url"
        value={url}
        onChange={e => { setUrl(e.target.value); setPreview(e.target.value); }}
        placeholder="Paste an image URL (optional)"
        className="w-full rounded-md border border-sand px-3 py-2"
      />
      <div className="flex items-center gap-3">
        <input
          name={`${field.name}__file`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={e => handleFile(e.target.files?.[0])}
          className="min-w-0 flex-1 text-xs text-ink/60 file:mr-2 file:rounded-md file:border-0 file:bg-mist file:px-2.5 file:py-1.5 file:text-xs file:text-ink"
        />
        <span className="text-xs text-ink/40">or upload</span>
      </div>
      {preview && <img src={preview} alt="Preview" className="h-24 w-36 rounded-md border border-sand object-cover" />}
    </div>
  );
}
