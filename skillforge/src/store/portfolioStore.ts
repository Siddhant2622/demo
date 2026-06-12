import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PortfolioState {
  github: {
    username: string;
    profile: any;
    repos: any[];
    languages: any;
  } | null;
  resume: {
    personalInfo: any;
    experience: any[];
    education: any[];
    skills: string[];
  } | null;
  mergedData: {
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      location: string;
      linkedin: string;
      github: string;
      portfolio: string;
      profilePhoto: string;
      bio: string;
      headline: string;
    };
    experience: any[];
    education: any[];
    skills: string[];
    projects: any[];
  };
  theme: {
    template: 'minimal' | 'modern' | 'developer' | 'creative';
    darkMode: boolean;
    primaryColor: string;
  };
  setGithubData: (data: any) => void;
  setResumeData: (data: any) => void;
  updateMergedData: (section: string, data: any) => void;
  setTheme: (themeConfig: any) => void;
  reset: () => void;
}

const initialMergedData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    profilePhoto: '',
    bio: '',
    headline: '',
  },
  experience: [],
  education: [],
  skills: [],
  projects: []
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      github: null,
      resume: null,
      mergedData: { ...initialMergedData },
      theme: {
        template: 'minimal',
        darkMode: true,
        primaryColor: '#6366F1'
      },
      setGithubData: (data) => set((state) => ({ 
        github: data,
        mergedData: {
          ...state.mergedData,
          personalInfo: {
            ...state.mergedData.personalInfo,
            github: `https://github.com/${data.username}`,
            profilePhoto: state.mergedData.personalInfo.profilePhoto || data.profile?.avatar_url || '',
            firstName: state.mergedData.personalInfo.firstName || (data.profile?.name ? data.profile.name.split(' ')[0] : ''),
            lastName: state.mergedData.personalInfo.lastName || (data.profile?.name ? data.profile.name.split(' ').slice(1).join(' ') : ''),
            location: state.mergedData.personalInfo.location || data.profile?.location || ''
          }
        }
      })),
      setResumeData: (data) => set((state) => ({ 
        resume: data,
        mergedData: {
          ...state.mergedData,
          personalInfo: {
            ...state.mergedData.personalInfo,
            firstName: data.personalInfo?.firstName || state.mergedData.personalInfo.firstName,
            lastName: data.personalInfo?.lastName || state.mergedData.personalInfo.lastName,
            email: data.personalInfo?.email || state.mergedData.personalInfo.email,
            phone: data.personalInfo?.phone || state.mergedData.personalInfo.phone,
            location: data.personalInfo?.location || state.mergedData.personalInfo.location,
            linkedin: data.personalInfo?.linkedin || state.mergedData.personalInfo.linkedin,
            portfolio: data.personalInfo?.portfolio || state.mergedData.personalInfo.portfolio,
            profilePhoto: data.personalInfo?.profilePhoto || state.mergedData.personalInfo.profilePhoto,
          },
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || []
        }
      })),
      updateMergedData: (section, data) => set((state) => ({
        mergedData: {
          ...state.mergedData,
          [section]: typeof data === 'function' ? data((state.mergedData as any)[section]) : data
        }
      })),
      setTheme: (themeConfig) => set((state) => ({
        theme: { ...state.theme, ...themeConfig }
      })),
      reset: () => set({
        github: null,
        resume: null,
        mergedData: { ...initialMergedData },
        theme: {
          template: 'minimal',
          darkMode: true,
          primaryColor: '#6366F1'
        }
      })
    }),
    {
      name: 'portfolio-builder-storage',
    }
  )
);
