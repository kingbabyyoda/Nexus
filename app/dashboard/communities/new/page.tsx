import { redirect } from 'next/navigation';
import { createCommunity } from '@/lib/communities';

async function createCommunityAction(formData: FormData) {
  'use server';

  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();

  if (!name) {
    return;
  }

  await createCommunity(name, description);
  redirect('/dashboard');
}

export default function NewCommunityPage() {
  return (
    <main className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Communities</p>
        <h1 className="mt-2 text-4xl font-bold">Create a community</h1>
      </div>

      <form action={createCommunityAction} className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-300">
            Community name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Nexus Gaming"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="A place for Roblox events, staff tools, and member management."
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <button type="submit" className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
          Create community
        </button>
      </form>
    </main>
  );
}
