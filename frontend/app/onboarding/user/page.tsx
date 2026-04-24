'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, FileUp, Loader2, SkipForward, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/app/lib/axios';
import { resumeApi } from '@/app/lib/resume.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type GenericRecord = Record<string, unknown>;

function parseArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return [];
}

function asRecord(value: unknown): GenericRecord {
  if (typeof value === 'object' && value !== null) {
    return value as GenericRecord;
  }
  return {};
}

export default function OnboardingUserPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fileName = useMemo(() => file?.name || '', [file]);

  const completeOnboardingOnly = async () => {
    await api.post('/auth/onboarding/complete', {
      careerGoal: '',
      currentRole: '',
      yearsOfExp: '',
      skills: [],
      location: '',
      bio: '',
    });
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      await completeOnboardingOnly();
      toast.success('Onboarding skipped. You can add details later in My Info.');
      router.replace('/user/myinfo');
    } catch {
      toast.error('Unable to complete onboarding right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAndContinue = async () => {
    if (!file) {
      toast.error('Please select a PDF or DOCX resume first.');
      return;
    }

    try {
      setLoading(true);
      const analysis = await resumeApi.analyzeFile(file);
      const parsed = analysis.parsed_resume || {};

      const skills = parseArray(parsed.skills)
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter(Boolean);

      const experiences = parseArray(parsed.experience).map((exp) => {
        const item = asRecord(exp);
        return {
          company: String(item.company ?? ''),
          role: String(item.role ?? item.title ?? ''),
          from: String(item.from ?? item.start ?? ''),
          to: String(item.to ?? item.end ?? ''),
          location: String(item.location ?? ''),
          description: String(item.description ?? ''),
          current: Boolean(item.current),
        };
      });

      const education = parseArray(parsed.education).map((edu) => {
        const item = asRecord(edu);
        return {
          institution: String(item.institution ?? item.school ?? ''),
          degree: String(item.degree ?? ''),
          field: String(item.field ?? item.major ?? ''),
          from: String(item.from ?? item.start ?? ''),
          to: String(item.to ?? item.end ?? ''),
          grade: String(item.grade ?? ''),
        };
      });

      const projects = parseArray(parsed.projects).map((project) => {
        const item = asRecord(project);
        const stack = item.techStack;
        return {
          name: String(item.name ?? ''),
          description: String(item.description ?? ''),
          techStack: Array.isArray(stack) ? stack.join(', ') : String(stack ?? ''),
          liveUrl: String(item.liveUrl ?? ''),
          repoUrl: String(item.repoUrl ?? ''),
        };
      });

      const certifications = parseArray(parsed.certifications).map((cert) => {
        const item = asRecord(cert);
        return {
          name: String(item.name ?? ''),
          issuer: String(item.issuer ?? ''),
          year: String(item.year ?? ''),
          credentialUrl: String(item.credentialUrl ?? ''),
        };
      });

      await api.post('/user-info/save', {
        phone: parsed.phone || '',
        location: parsed.location || '',
        bio: parsed.summary || '',
        careerGoal: '',
        currentRole: '',
        yearsOfExp: '',
        website: '',
        github: '',
        linkedin: '',
        leetcode: '',
        skills,
        experiences,
        education,
        projects,
        certifications,
      });

      await completeOnboardingOnly();

      toast.success('Resume imported. Your My Info is pre-filled.');
      router.replace('/user/myinfo');
    } catch {
      toast.error('Resume import failed. You can skip and fill manually later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background px-4 py-10'>
      <div className='max-w-3xl mx-auto space-y-6'>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='text-center space-y-3'>
          <Image
            src='/logo.png'
            alt='ElevateAI'
            width={150}
            height={44}
            className='mx-auto invert dark:invert-0 object-contain'
          />
          <h1 className='text-3xl font-bold'>Set up your profile (optional)</h1>
          <p className='text-muted-foreground'>
            Upload your resume to auto-extract skills, education, and experience directly into My Info.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card className='border-border/70'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <FileUp className='h-4 w-4 text-primary' /> Resume Upload (Recommended)
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <label className='block border border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors'>
                <input
                  type='file'
                  className='hidden'
                  accept='.pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={loading}
                />
                <p className='text-sm font-medium'>Choose PDF or DOCX</p>
                <p className='text-xs text-muted-foreground mt-1'>Max 10MB</p>
              </label>

              {fileName && (
                <div className='rounded-lg bg-muted p-3 flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-primary' />
                  <span className='text-sm truncate'>{fileName}</span>
                </div>
              )}

              <Button className='w-full gap-2' onClick={handleUploadAndContinue} disabled={loading || !file}>
                {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Sparkles className='h-4 w-4' />} Upload And Continue
              </Button>
            </CardContent>
          </Card>

          <Card className='border-border/70'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <SkipForward className='h-4 w-4 text-primary' /> Skip For Now
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-muted-foreground'>
                You can complete your details manually later in My Info. No questions are required during onboarding.
              </p>
              <Button variant='outline' className='w-full' onClick={handleSkip} disabled={loading}>
                Continue Without Resume
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
