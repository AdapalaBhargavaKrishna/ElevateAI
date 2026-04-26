'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  FileUp,
  Loader2,
  SkipForward,
  Sparkles,
  ShieldCheck,
  Rocket,
  WandSparkles,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '@/app/lib/axios';
import { resumeApi } from '@/app/lib/resume.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingUserPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loadingAction, setLoadingAction] = useState<'upload' | 'skip' | null>(null);

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
      setLoadingAction('skip');
      await completeOnboardingOnly();
      toast.success('Onboarding skipped. You can still import your resume in My Info.');
      router.replace('/user/myinfo');
    } catch {
      toast.error('Unable to complete onboarding right now.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUploadAndContinue = async () => {
    if (!file) {
      toast.error('Please select a PDF or DOCX resume first.');
      return;
    }

    try {
      setLoadingAction('upload');
      await resumeApi.importToUserInfo(file);
      await completeOnboardingOnly();

      toast.success('Resume imported. Your My Info is now pre-filled.');
      router.replace('/user/myinfo');
    } catch (err: unknown) {
      console.error("[Onboarding] Resume import failed:", err);
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
      console.error("[Onboarding] Status:", axiosErr?.response?.status);
      console.error("[Onboarding] Response:", axiosErr?.response?.data);
      toast.error('Resume import failed. You can skip and fill manually later.');
    } finally {
      setLoadingAction(null);
    }
  };

  const isBusy = loadingAction !== null;

  return (
    <div className='relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.10),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.10),transparent_30%),linear-gradient(to_bottom,#ffffff,#f8fafc)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_38%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.16),transparent_34%),linear-gradient(to_bottom,#0b1220,#0a0f1a)] px-4 py-10'>
      <div className='max-w-6xl mx-auto space-y-7'>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className='text-center space-y-3'>
          <Image
            src='/logo.png'
            alt='ElevateAI'
            width={150}
            height={44}
            className='mx-auto invert dark:invert-0 object-contain'
          />
          <h1 className='text-3xl md:text-4xl font-bold tracking-tight'>Build your profile in under a minute</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Import resume details instantly or skip for now. You can always upload later from My Info.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-5 gap-5'>
          <Card className='border-border/60 lg:col-span-2 bg-card/75 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <Rocket className='h-4 w-4 text-primary' /> Why import now?
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-3'>
                <div className='rounded-xl border border-border/60 p-3 bg-background/60'>
                  <div className='flex items-center gap-2 text-sm font-medium'>
                    <WandSparkles className='h-4 w-4 text-primary' /> Auto-fills major sections
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>Projects, skills, education, links, and certifications.</p>
                </div>
                <div className='rounded-xl border border-border/60 p-3 bg-background/60'>
                  <div className='flex items-center gap-2 text-sm font-medium'>
                    <ShieldCheck className='h-4 w-4 text-primary' /> You stay in control
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>Review and edit everything in My Info before interviews.</p>
                </div>
              </div>

              <div className='rounded-xl border border-dashed border-border/70 p-4 bg-muted/40'>
                <p className='text-xs text-muted-foreground uppercase tracking-wide'>What gets imported</p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {['Skills', 'Projects', 'Experience', 'Education', 'Certifications', 'Profile Links'].map((chip) => (
                    <span key={chip} className='text-xs rounded-full border border-border px-2.5 py-1 bg-background/80'>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card className='border-border/70 bg-card/80 backdrop-blur-sm'>
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
                  disabled={isBusy}
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

                <Button className='w-full gap-2' onClick={handleUploadAndContinue} disabled={isBusy || !file}>
                  {loadingAction === 'upload' ? <Loader2 className='h-4 w-4 animate-spin' /> : <Sparkles className='h-4 w-4' />}
                  Upload, Import, And Continue
                </Button>
              </CardContent>
            </Card>

            <Card className='border-border/70 bg-card/80 backdrop-blur-sm'>
              <CardHeader>
                <CardTitle className='text-base flex items-center gap-2'>
                  <SkipForward className='h-4 w-4 text-primary' /> Skip For Now
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  No mandatory questions here. Continue directly and fill details manually.
                </p>
                <Button variant='outline' className='w-full gap-2' onClick={handleSkip} disabled={isBusy}>
                  {loadingAction === 'skip' ? <Loader2 className='h-4 w-4 animate-spin' /> : <ArrowRight className='h-4 w-4' />}
                  Continue Without Resume
                </Button>
                <p className='text-xs text-muted-foreground'>
                  You can still upload later in My Info using the <span className='font-medium'>Import Resume</span> action.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
