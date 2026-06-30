import { api } from '@/lib/axios';
import { z } from 'zod';
import type { LanguageOption, Language } from '@/types/languageSelection';
import { LanguageDetailResponseSchema } from '../language_selection.schema';

/**
 * Fetches the supported compiler configurations and transforms raw responses safely.
 */
export async function fetchLanguages(): Promise<LanguageOption[]> {
  // unknown generic avoids unsafe-assignment errors on destructuring data
  const { data } = await api.get<unknown>('/api/languages');

  // Validate array content at runtime using Zod array method
  const validatedData = z.array(LanguageDetailResponseSchema).parse(data);

  return validatedData.map((item) => ({
    id: item._id,
    language: item.language,
    tagline: item.info,
    strengths: item.strengths,
    challenges: item.challenges,
    useCases: item.useCases,
    color: {
      background: item.language === 'C++' ? 'bg-purple-cpp' : 'bg-orange-jv',
      main: 'bg-accent',
    },
  }));
}

/**
 * Registers the student's base onboarding language path mapping choice.
 */
export async function saveLanguage(language: Language): Promise<void> {
  await api.post<unknown>('/api/languages/select', { language });
}
