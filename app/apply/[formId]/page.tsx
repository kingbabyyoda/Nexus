import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getApplicationFormById, submitApplication } from '@/lib/applications';

function normalizeQuestions(questions: unknown) {
  if (!Array.isArray(questions)) return [];
  return questions as Array<{
    id: string;
    label: string;
    type: 'short' | 'paragraph' | 'multiple_choice' | 'checkbox' | 'dropdown';
    options?: string[];
  }>;
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const session = await getServerSession(authOptions);
  const form = await getApplicationFormById(formId);

  if (!form) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-bold">Application not found</h1>
          <p className="mt-3 text-sm text-slate-400">That application form does not exist.</p>
          <Link href="/" className="mt-6 inline-block rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
            Go home
          </Link>
        </div>
      </main>
    );
  }

  const questions = normalizeQuestions(form.questions);

  async function submitApplicationAction(formData: FormData) {
    'use server';

    const serverSession = await getServerSession(authOptions);
    if (!serverSession?.user?.id) {
      redirect(`/login?callbackUrl=${encodeURIComponent(`/apply/${formId}`)}`);
    }

    const answers: Record<string, string | string[] | boolean> = {};

    for (const question of questions) {
      if (question.type === 'checkbox') {
        answers[question.id] = formData.getAll(question.id).map((value) => String(value));
      } else {
        answers[question.id] = String(formData.get(question.id) || '').trim();
      }
    }

    await submitApplication({
      communityId: form.communityId,
      formId: form.id,
      applicantUserId: serverSession.user.id,
      answers,
    });

    redirect('/dashboard/applications');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16 text-slate-100">
      <div className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Application</p>
        <h1 className="mt-4 text-3xl font-bold">{form.title}</h1>
        <p className="mt-3 text-sm text-slate-400">{form.community.name}</p>
        <p className="mt-4 text-sm text-slate-300">{form.description || 'Fill out the questions below to apply.'}</p>

        {form.status !== 'published' ? (
          <div className="mt-6 rounded-2xl border border-amber-900 bg-amber-950/30 p-4 text-sm text-amber-100">
            This form is currently in draft mode.
          </div>
        ) : null}

        {!session ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-300">Sign in to submit this application.</p>
            <Link
              href={`/api/auth/signin/discord?callbackUrl=${encodeURIComponent(`/apply/${formId}`)}`}
              className="mt-4 inline-block rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950"
            >
              Continue with Discord
            </Link>
          </div>
        ) : (
          <form action={submitApplicationAction} className="mt-6 space-y-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              Signed in as {session.user?.name || session.user?.email || 'member'}
            </div>

            {questions.length === 0 ? (
              <p className="text-sm text-slate-400">This form has no questions yet.</p>
            ) : (
              questions.map((question) => (
                <div key={question.id} className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <label className="block text-sm font-semibold text-white" htmlFor={question.id}>
                    {question.label}
                  </label>

                  {question.type === 'paragraph' ? (
                    <textarea
                      id={question.id}
                      name={question.id}
                      rows={5}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none"
                    />
                  ) : question.type === 'multiple_choice' || question.type === 'dropdown' ? (
                    <select
                      id={question.id}
                      name={question.id}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select an option
                      </option>
                      {(question.options || []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : question.type === 'checkbox' ? (
                    <div className="space-y-2">
                      {(question.options || []).length > 0 ? (
                        question.options!.map((option) => (
                          <label key={option} className="flex items-center gap-3 text-sm text-slate-300">
                            <input type="checkbox" name={question.id} value={option} className="h-4 w-4" />
                            {option}
                          </label>
                        ))
                      ) : (
                        <input
                          id={question.id}
                          name={question.id}
                          type="text"
                          className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none"
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      id={question.id}
                      name={question.id}
                      type="text"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none"
                    />
                  )}
                </div>
              ))
            )}

            <button className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
              Submit application
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
