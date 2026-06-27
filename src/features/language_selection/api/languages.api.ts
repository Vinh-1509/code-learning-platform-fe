import { api } from '@/lib/axios';
import type { LanguageOption, Language } from '@/types/languageSelection';

interface LanguageDetailResponse {
  _id: string;
  language: Language;
  info: string;
  strengths: string[];
  challenges: string[];
  useCases: string[];
}

export async function fetchLanguages(): Promise<LanguageOption[]> {
  const { data } = await api.get<LanguageDetailResponse[]>('/api/languages');

  return data.map((item) => ({
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

export async function saveLanguage(language: Language): Promise<void> {
  await api.post('/api/languages/select', { language });
}
