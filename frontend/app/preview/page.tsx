"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/axios";
import { fetchUserProfile, UserProfile } from "../user/data/profile";
import ProfilePreviewView, { ProfilePreviewSkeleton } from "../user/profile/profile-preview-view";

export default function PreviewPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data } = await api.get("/auth/me");
                const currentUserId = data.user?.id;

                if (!currentUserId) {
                    throw new Error("Missing user id");
                }

                const userProfile = await fetchUserProfile(currentUserId);
                setProfile(userProfile);
            } catch (error) {
                console.error("Failed to load preview profile:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    if (loading) {
        return <ProfilePreviewSkeleton />;
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="text-sm text-muted-foreground">Failed to load profile preview.</div>
            </div>
        );
    }

    return (
        <ProfilePreviewView
            profile={profile}
            backHref="/user/profile"
            backLabel="Back to Profile"
            shareUrl={`/profile/${profile.id}`}
        />
    );
}