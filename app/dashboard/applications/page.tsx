import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { requireRole } from '@/lib/access';
import { prisma } from '@/lib/prisma';
import {
  buildQuestionsFromInputs,
  createApplicationForm,
  updateApplicationStatus,
} from '@/lib/applications';

const QUESTION_TYPES = [
  { value: 'short', label: 'Short answer' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'dropdown', label: 'Dropdown' },
] as const;

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  await requireRole(session.user?.id, 'moderator');

  const manageableCommunities = await prisma.member.findMany({
    where: {
      userId: session.user?.id,
      role: { in: ['owner', 'admin', 'moderator'] },
    },
    include: { community: true },
    orderBy: { joinedAt: 'desc' },
  });

  const communityIds = manageableCommunities.map((membership) => membership.community.id);

  const forms = await prisma.applicationForm.findMany({
    where: { communityId: { in: communityIds } },
    include: {
      community: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const submissions = await prisma.application.findMany({
    where: { communityId: { in: communityIds } },
    include: {
      community: true,
      form: true,
      applicant: true,
      reviewedBy: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  async function createFormAction(formData: FormData) {
    'use server';

    const communityId = String(formData.get('communityId') || '').trim();
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const status = String(formData.get('status') || 'draft').trim() as 'draft' | 'published';

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'moderator');

    if (!communityId || !title) {
      return;
    }

    const questions = buildQuestionsFromInputs([
      {
        label: String(formData.get('q1Label') || '').trim(),
        type: String(formData.get('q1Type') || 'short') as any,
        options: String(formData.get('q1Options') || '').split(',').map((item) => item.trim()),
      },
      {
        label: String(formData.get('q2Label') || '').trim(),
        type: String(formData.get('q2Type') || 'paragraph') as any,
        options: String(formData.get('q2Options') || '').split(',').map((item) => item.trim()),
      },
      {
        label: String(formData.get('q3Label') || '').trim(),
        type: String(formData.get('q3Type') || 'dropdown') as any,
        options: String(formData.get('q3Options') || '').split(',').map((item) => item.trim()),
      },
    ]);

    await createApplicationForm({
      communityId,
      title,
      description,
      status,
      questions,
    });

    revalidatePath('/dashboard/applications');
    redirect('/dashboard/applications');
  }

  async function reviewApplicationAction(formData: FormData) {
    'use server';

    const applicationId = String(formData.get('applicationId') || '').trim();
    const decision = String(formData.get('decision') || '').trim() as 'approved' | 'rejected';

    if (!session.user?.id) {
      redirect('/login');
    }

    await requireRole(session.user.id, 'moderator');

    if (!applicationId || !['approved', 'rejected'].includes(decision)) {
      return;
    }

    await updateApplicationStatus({
      applicationId,
      status: decision,
      reviewerId: session.user.id,
    });

    revalidatePath('/dashboard/applications');
    redirect('/dashboard/applications');
  }

  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Applications</p>
        <h1 className="mt-2 text-4xl font-bold">Application builder</h1>
        <p className="mt-3 text-sm text-slate-400">
          Moderators and above can build forms and review submissions.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Create a form</h2>
          <form action={createFormAction} className="mt-4 space-y-4 text-sm text-slate-300">
            <div className="space-y-2">
              <label className="block text-slate-400" htmlFor="communityId">
                Community
              </label>
              <select
                id="communityId"
                name="communityId"
                defaultValue={manageableCommunities[0]?.community.id || ''}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              >
                {manageableCommunities.length === 0 ? (
                  <option value="">No communities available</option>
                ) : (
                  manageableCommunities.map((membership) => (
                    <option key={membership.community.id} value={membership.community.id}>
                      {membership.community.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-slate-400" htmlFor="title">
                  Form title
                </label>
                <input
                  id="title"
                  name="title"
                  placeholder="Staff application"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-400" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="draft"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-400" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Tell applicants what this form is for."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm font-semibold text-white">Questions</p>
              <div className="mt-4 space-y-4">
                {[
                  { prefix: 'q1', label: 'Question 1' },
                  { prefix: 'q2', label: 'Question 2' },
                  { prefix: 'q3', label: 'Question 3' },
                ].map((question) => (
                  <div key={question.prefix} className="grid gap-3 md:grid-cols-[1fr_180px]">
                    <div className="space-y-2">
                      <label className="block text-slate-400" htmlFor={`${question.prefix}Label`}>
                        {question.label}
                      </label>
                      <input
                        id={`${question.prefix}Label`}
                        name={`${question.prefix}Label`}
                        placeholder="Why do you want to join?"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-slate-400" htmlFor={`${question.prefix}Type`}>
                        Type
                      </label>
                      <select
                        id={`${question.prefix}Type`}
                        name={`${question.prefix}Type`}
                        defaultValue={question.prefix === 'q1' ? 'short' : question.prefix === 'q2' ? 'paragraph' : 'dropdown'}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none"
                      >
                        {QUESTION_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-slate-400" htmlFor={`${question.prefix}Options`}>
                        Options for multiple choice, checkbox, or dropdown
                      </label>
                      <input
                        id={`${question.prefix}Options`}
                        name={`${question.prefix}Options`}
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950">
              Save application form
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Existing forms</h2>
            <div className="mt-4 space-y-3">
              {forms.length === 0 ? (
                <p className="text-sm text-slate-400">No forms created yet.</p>
              ) : (
                forms.map((form) => (
                  <div key={form.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{form.title}</p>
                        <p className="mt-1 text-slate-400">{form.community.name}</p>
                      </div>
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {form.status}
                      </span>
                    </div>
                    <p className="mt-3 text-slate-400">{form.description || 'No description yet.'}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      {Array.isArray(form.questions) ? form.questions.length : 0} questions · {form._count.applications} submissions
                    </p>
                    <p className="mt-2 text-xs text-slate-500">Share: /apply/{form.id}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Review queue</h2>
            <div className="mt-4 space-y-3">
              {submissions.length === 0 ? (
                <p className="text-sm text-slate-400">No submissions waiting for review.</p>
              ) : (
                submissions.map((submission) => (
                  <div key={submission.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{submission.form.title}</p>
                        <p className="mt-1 text-slate-400">{submission.community.name}</p>
                      </div>
                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {submission.status}
                      </span>
                    </div>
                    <p className="mt-3 text-slate-400">
                      Applicant: {submission.applicant?.name || submission.applicant?.email || 'Unknown'}
                    </p>
                    <div className="mt-4 flex gap-3">
                      <form action={reviewApplicationAction}>
                        <input type="hidden" name="applicationId" value={submission.id} />
                        <input type="hidden" name="decision" value="approved" />
                        <button className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white">
                          Approve
                        </button>
                      </form>
                      <form action={reviewApplicationAction}>
                        <input type="hidden" name="applicationId" value={submission.id} />
                        <input type="hidden" name="decision" value="rejected" />
                        <button className="rounded-2xl bg-rose-500 px-4 py-3 font-semibold text-white">
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
