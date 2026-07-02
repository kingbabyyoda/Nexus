import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export type ApplicationQuestion = {
  id: string;
  label: string;
  type: 'short' | 'paragraph' | 'multiple_choice' | 'checkbox' | 'dropdown';
  options?: string[];
};

export function buildQuestionsFromInputs(inputs: Array<{ label: string; type: ApplicationQuestion['type']; options?: string[] }>) {
  return inputs
    .filter((item) => item.label.trim().length > 0)
    .map((item) => ({
      id: randomUUID(),
      label: item.label.trim(),
      type: item.type,
      options: item.options?.filter(Boolean) ?? [],
    }));
}

export async function createApplicationForm(input: {
  communityId: string;
  title: string;
  description?: string | null;
  questions: ApplicationQuestion[];
  status?: 'draft' | 'published';
}) {
  return prisma.applicationForm.create({
    data: {
      communityId: input.communityId,
      title: input.title,
      description: input.description || null,
      questions: input.questions,
      status: input.status ?? 'draft',
    },
  });
}

export async function updateApplicationStatus(input: {
  applicationId: string;
  status: 'approved' | 'rejected';
  reviewerId: string;
}) {
  return prisma.application.update({
    where: { id: input.applicationId },
    data: {
      status: input.status,
      reviewedByUserId: input.reviewerId,
      reviewedAt: new Date(),
    },
  });
}
