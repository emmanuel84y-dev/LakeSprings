import { getAdminResource } from '@/lib/data/admin-resources';
import { ResourceForm } from '../ResourceForm';
import { ResourceDelete } from '../ResourceDelete';

const regularCategories = ['hotel', 'rooms', 'restaurant', 'pool', 'facilities', 'events', 'exterior'];

export default async function Gallery() {
  const rows = await getAdminResource('gallery', 'display_order', true);
  const settingOne = rows.find((r: any) => r.category === 'setting_1');
  const settingTwo = rows.find((r: any) => r.category === 'setting_2');
  const regularRows = rows.filter((r: any) => !['setting_1', 'setting_2'].includes(r.category));

  const settingFields = (category: string, current: any, order: number) => [
    { name: 'storage_path', label: 'Image', value: current?.storage_path ?? '', placeholder: 'Upload an image below' },
    { name: 'category', label: '', type: 'hidden', value: category },
    { name: 'caption', label: 'Caption', value: current?.caption ?? '', placeholder: 'Optional caption' },
    { name: 'display_order', label: 'Display order', type: 'number', value: current?.display_order ?? order },
  ];

  return (
    <div>
      <p className="eyebrow">Content</p>
      <h1 className="mt-1 font-display text-3xl">Gallery</h1>
      <p className="mt-2 text-sm text-ink/60">Upload and manage the hotel photography used across the website.</p>

      <section className="mt-6 rounded-xl border border-sand bg-mist/50 p-5">
        <p className="eyebrow">Homepage</p>
        <h2 className="mt-1 font-display text-2xl text-ink">The Setting</h2>
        <p className="mt-2 text-sm text-ink/60">These two images appear beside “Beside still water, in the middle of the city” on the homepage.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <ResourceForm resource="gallery" id={settingOne?.id} title={settingOne ? 'Replace Setting Image 1' : 'Upload Setting Image 1'} fields={settingFields('setting_1', settingOne, -2)} />
          <ResourceForm resource="gallery" id={settingTwo?.id} title={settingTwo ? 'Replace Setting Image 2' : 'Upload Setting Image 2'} fields={settingFields('setting_2', settingTwo, -1)} />
        </div>
      </section>

      <div className="mt-6">
        <ResourceForm
          resource="gallery"
          title="Add gallery item"
          fields={[
            { name: 'storage_path', label: 'Image', placeholder: 'Upload an image below' },
            { name: 'category', label: 'Category', type: 'select', options: regularCategories, value: 'hotel' },
            { name: 'caption', label: 'Caption' },
            { name: 'display_order', label: 'Display order', type: 'number', value: 0 },
          ]}
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-sand bg-white">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-sand">
            {regularRows.map((r: any) => (
              <tr key={r.id}>
                <td className="px-5 py-3 font-mono text-xs">{r.storage_path}</td>
                <td className="px-5 py-3">{r.category}</td>
                <td className="px-5 py-3"><ResourceDelete resource="gallery" id={r.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
