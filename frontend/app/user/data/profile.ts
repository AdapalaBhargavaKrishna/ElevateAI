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

export const profileData: UserProfile = {
  id: "demo-user",
  fullName: "Bhargava Krishna Adapala",
  currentRole: "Full-Stack Developer",
  yearsOfExp: "3",
  location: "Hyderabad, India",
  bio: "Passionate full-stack developer specializing in React and Node.js. Building scalable web apps focused on UX, performance, and clean architecture.",
  careerGoal: "Senior Full-Stack Engineer at a top-tier tech company",
  elevateScore: 82,
  email: "bk.adapala@gmail.com",
  github: "https://github.com/adapalabhargavakrishna",
  linkedin: "https://www.linkedin.com/in/bhargavakrishnaadapala",
  website: "http://bhargava1028.web.app",
  skills: [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "PostgreSQL",
    "AWS",
    "Docker",
    "GraphQL",
    "System Design",
  ],
  experiences: [
    {
      company: "TechStartup Inc.",
      role: "Full Stack Developer",
      from: "2021",
      to: "",
      current: true,
      location: "San Francisco, CA",
      description:
        "Led development of core product features serving 50k+ users. Architected microservices and improved performance by 40%.",
    },
    {
      company: "WebAgency Co.",
      role: "Junior Developer",
      from: "2020",
      to: "2021",
      current: false,
      location: "Remote",
      description:
        "Built client websites and internal tools using React and Node.js. Collaborated with designers to implement responsive UIs.",
    },
  ],
  projects: [
    {
      name: "E-Commerce Platform",
      description: "Full-stack marketplace with Stripe payments and real-time inventory tracking.",
      techStack: "React,Node.js,Stripe,PostgreSQL,Redis",
      liveUrl: "https://ecommerce-demo.com",
      repoUrl: "https://github.com/adapalabhargavakrishna",
    },
    {
      name: "AI Chat Application",
      description: "Real-time AI-powered chat with streaming responses and conversation history.",
      techStack: "Next.js,OpenAI,Redis,WebSocket,TailwindCSS",
      liveUrl: "https://ai-chat-demo.com",
      repoUrl: "https://github.com/adapalabhargavakrishna",
    },
  ],
  education: [
    {
      degree: "BS",
      field: "Computer Science",
      institution: "Stanford University",
      from: "2017",
      to: "2021",
    },
  ],
  certifications: [
    {
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      year: "2024",
    },
    {
      name: "Google Cloud Professional",
      issuer: "Google",
      year: "2024",
    },
    {
      name: "Meta Frontend Developer",
      issuer: "Meta",
      year: "2023",
    },
  ],
};

interface PublicProfileResponse {
  profile: UserProfile;
}

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await api.get<PublicProfileResponse>(`/user-info/public/${userId}`);
  return response.data.profile;
};