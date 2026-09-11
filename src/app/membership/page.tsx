import { redirect } from 'next/navigation';

export default function MembershipRedirectPage() {
  // Public membership program has been retired in favor of volunteer-first participation.
  redirect('/volunteer');
}
