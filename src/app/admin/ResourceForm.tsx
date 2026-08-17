'use client';
import { useState } from 'react';
import { adminResourceAction } from '@/lib/actions/admin-resources';

type Option = string | { value:string; label:string };
type Field = { name:string; label:string; type?:string; options?:Option[]; value?:string|number|boolean; placeholder?:string; required?:boolean };
export function ResourceForm({ resource, fields, id, title='Add item' }: { resource:string; fields:Field[]; id?:string; title?:string }) {
  const [open,setOpen]=useState(Boolean(id));
  return <div className="rounded-xl border border-sand bg-white p-5">
    <button type="button" onClick={()=>setOpen(v=>!v)} className="font-medium text-ink">{open ? 'Hide' : '+'} {title}</button>
    {open && <form action={adminResourceAction} className="mt-5 grid gap-4 md:grid-cols-2">
      <input type="hidden" name="_resource" value={resource}/><input type="hidden" name="_id" value={id ?? ''}/>
      {fields.map(f=><label key={f.name} className="block text-sm text-ink/70 md:col-span-1">
        <span className="mb-1 block">{f.label}</span>
        {f.type==='textarea' ? <textarea name={f.name} defaultValue={String(f.value ?? '')} required={f.required} placeholder={f.placeholder} className="min-h-28 w-full rounded-md border border-sand px-3 py-2"/> : f.type==='select' ? <select name={f.name} defaultValue={String(f.value ?? '')} className="w-full rounded-md border border-sand px-3 py-2">{f.options?.map(o=>{const x=typeof o==='string'?{value:o,label:o}:o; return <option key={x.value} value={x.value}>{x.label}</option>})}</select> : f.type==='checkbox' ? <input type="checkbox" name={f.name} defaultChecked={Boolean(f.value)} className="h-4 w-4"/> : <input name={f.name} type={f.type ?? 'text'} defaultValue={String(f.value ?? '')} required={f.required} placeholder={f.placeholder} className="w-full rounded-md border border-sand px-3 py-2"/>}
      </label>)}
      <div className="md:col-span-2"><button className="rounded-md bg-reservoir px-4 py-2 text-sm font-medium text-white">Save</button></div>
    </form>}
  </div>
}
