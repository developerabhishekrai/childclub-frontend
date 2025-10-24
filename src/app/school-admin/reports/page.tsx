'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to first report page
    router.push('/school-admin/reports/students');
  }, [router]);

  return null;
}



