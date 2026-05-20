export type Language = 'cpp' | 'java';

export interface LanguageStrength {
  label: string;
}
export interface LanguageChallenge {
  label: string;
}

export interface LanguageOption {
  id: Language;
  label: string;
  tagline: string;
  strengths: string[];
  challenges: string[];
  useCases: string[];
  color: {
    main: string;
    background: string;
  };
}
