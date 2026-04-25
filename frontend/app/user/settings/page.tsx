'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { AlertTriangle, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from '@/app/lib/axios';
import toast from 'react-hot-toast';

const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input
            className={`flex h-9 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
};

const Label = ({ children, className = "", ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
    return (
        <label
            className={`text-sm font-medium text-foreground ${className}`}
            {...props}
        >
            {children}
        </label>
    );
};

const Switch = ({ checked, onChange, disabled = false }: {
    checked: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
}) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className={`
                relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
                focus-visible:ring-primary focus-visible:ring-offset-2
                ${checked ? 'bg-primary' : 'bg-muted'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <span
                className={`
                    pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-lg 
                    transition duration-200 ease-in-out
                    ${checked ? 'translate-x-4' : 'translate-x-0'}
                `}
            />
        </button>
    );
};

const PageHeader = ({ title, description }: { title: string; description: string }) => {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
};

interface SettingField {
    label: string;
    type: string;
    value: string;
    placeholder?: string;
}

interface SettingSection {
    title: string;
    icon: React.ElementType;
    fields: SettingField[];
}



const settingSections: SettingSection[] = [
    {
        title: "Profile Settings",
        icon: User,
        fields: [
            { label: "Full Name", type: "text", value: "Bhargava Krishna", placeholder: "Enter your full name" },
            { label: "Email", type: "email", value: "bk.adapala@email.com", placeholder: "Enter your email" },
            { label: "Career Goal", type: "text", value: "Student", placeholder: "Enter your career goal" },
            { label: "Phone Number", type: "tel", value: "+91 93902 43210", placeholder: "Enter your phone number" },
        ],
    },
    {
        title: "Security Settings",
        icon: Shield,
        fields: [
            { label: "Current Password", type: "password", value: "", placeholder: "Enter current password" },
            { label: "New Password", type: "password", value: "", placeholder: "Enter new password" },
            { label: "Confirm Password", type: "password", value: "", placeholder: "Confirm new password" },
        ],
    },
];


export default function SettingsPage() {
    const router = useRouter();
    const [profileData, setProfileData] = useState({
        fullName: "Bhargava Krishna",
        email: "bk.adapala@email.com",
        careerGoal: "Student",
        phone: "+91 93902 44436",
    });
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = () => {
        console.log("Profile saved:", profileData);
    };

    const handleSaveSecurity = () => {
        console.log("Security settings saved");
    };

    const canDelete = deleteConfirmText.trim().toUpperCase() === 'DELETE';

    const handleDeleteAccount = async () => {
        if (!canDelete) {
            toast.error('Type DELETE to confirm account deletion.');
            return;
        }

        try {
            setIsDeleting(true);
            await api.delete('/auth/account');
            toast.success('Your account has been deleted.');
            router.replace('/login');
        } catch {
            toast.error('Could not delete account right now. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                <PageHeader
                    title="Settings"
                    description="Manage your account preferences and security settings"
                />

                {settingSections.map((section, sectionIndex) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sectionIndex * 0.1 }}
                        className="bg-card border border-border rounded-xl p-5"
                    >
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                <section.icon className="h-3 w-3 text-primary" />
                            </div>
                            {section.title}
                        </h3>

                        <div className="space-y-4">
                            {section.fields.map((field) => (
                                <div key={field.label} className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">{field.label}</Label>
                                    <Input
                                        type={field.type}
                                        name={field.label.toLowerCase().replace(/\s+/g, '')}
                                        defaultValue={field.value}
                                        placeholder={field.placeholder}
                                        onChange={section.title === "Profile Settings" ? handleProfileChange : undefined}
                                        className="bg-background"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button
                                size="sm"
                                className="h-8 px-3 text-xs bg-primary hover:bg-primary/90"
                                onClick={section.title === "Profile Settings" ? handleSaveProfile : handleSaveSecurity}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                ))}

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card border border-destructive/20 rounded-xl p-5"
                >
                    <h3 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        Danger Zone
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => setShowDeleteWarning((prev) => !prev)}
                        disabled={isDeleting}
                    >
                        Delete Account
                    </Button>

                    {showDeleteWarning && (
                        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                            <p className="text-xs text-destructive font-medium">
                                This will permanently remove your profile, interviews, resume analyses, roadmaps, and all related data.
                            </p>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Type DELETE to confirm</Label>
                                <Input
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    className="bg-background"
                                    disabled={isDeleting}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={handleDeleteAccount}
                                    disabled={!canDelete || isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => {
                                        setShowDeleteWarning(false);
                                        setDeleteConfirmText('');
                                    }}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                </motion.div>

                <p className="text-[10px] text-muted-foreground text-center">
                    Last updated: Feb 21, 2026
                </p>
            </div>
        </div>
    );
}