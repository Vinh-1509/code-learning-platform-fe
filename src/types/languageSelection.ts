export type Language = 'C++' | 'Java';

export interface LanguageStrength {
  label: string;
}
export interface LanguageChallenge {
  label: string;
}

export interface LanguageOption {
  id: string;
  language: Language;
  tagline: string;
  strengths: string[];
  challenges: string[];
  useCases: string[];
  color: {
    main: string;
    background: string;
  };
}
