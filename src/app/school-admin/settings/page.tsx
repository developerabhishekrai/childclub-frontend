'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to first settings page
    router.push('/school-admin/settings/general');
  }, [router]);

  return null;
}



