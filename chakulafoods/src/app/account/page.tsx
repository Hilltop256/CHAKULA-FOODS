import { Metadata } from 'next';
import AccountPageClient from './components/AccountPageClient';

export const metadata: Metadata = {
  title: 'My Account | Chakula Foods Naalya',
  description: 'Manage your profile, delivery addresses, and account settings.',
};

export default function AccountPage() {
  return <AccountPageClient />;
}
