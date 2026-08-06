import React from 'react';
import AdminPanelClient from '@/app/admin-panel/components/AdminPanelClient';

type AdminPanelPageProps = {
  searchParams: Promise<{
    section?: string;
    orderId?: string;
  }>;
};

export default async function AdminPanelPage({ searchParams }: AdminPanelPageProps) {
  const params = await searchParams;

  return (
    <AdminPanelClient
      initialSection={params.section}
      initialDispatchOrderId={params.orderId ?? null}
    />
  );
}
