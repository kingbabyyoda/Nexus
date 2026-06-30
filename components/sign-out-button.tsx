'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="block w-full rounded-2xl px-4 py-3 text-left hover:bg-slate-800"
    >
      Sign out
    </button>
  );
}
