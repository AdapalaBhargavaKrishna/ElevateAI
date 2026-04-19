"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchUserProfile, UserProfile } from "../../user/data/profile";
import ProfilePreviewView, { ProfilePreviewSkeleton } from "../../user/profile/profile-preview-view";

export default function PublicProfilePage() {
    const params = useParams<{ id: string }>();
    const profileId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            if (!profileId) {
                setLoading(false);
                return;
            }

            try {
                const data = await fetchUserProfile(profileId);
                setProfile(data);
            } catch (error) {
                console.error("Failed to load public profile:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [profileId]);

    if (loading) {
        return <ProfilePreviewSkeleton />;
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="text-sm text-muted-foreground">Profile not found.</div>
            </div>
        );
    }

    return (
        <ProfilePreviewView
            profile={profile}
            backHref="/preview"
            backLabel="Back to Preview"
            shareUrl={`/profile/${profile.id}`}
        />
    );
}
