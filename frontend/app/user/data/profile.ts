import { api } from "../../lib/axios";

export interface SocialLink {
  icon: string;
  label: string;
  href: string;
}

export interface Experience {
  company: string;
  role: string;
  from: string;
  to: string;
  current: boolean;
  location: string;
  description: string;
}

export interface Project {
  name: string;
  description: string;
  techStack: string;
  liveUrl: string;
  repoUrl: string;
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  from: string;
  to: string;
  grade?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  currentRole: string;
  yearsOfExp: string;
  location: string;
  bio: string;
  careerGoal: string;
  elevateScore: number;
  email: string;
  avatar?: string;
  github: string;
  linkedin: string;
  leetcode?: string;
  website: string;
  phone?: string;
  skills: string[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
}



interface PublicProfileResponse {
  profile: UserProfile;
}

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await api.get<PublicProfileResponse>(`/user-info/public/${userId}`);
  return response.data.profile;
};