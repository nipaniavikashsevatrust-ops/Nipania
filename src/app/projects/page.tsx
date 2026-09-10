import { redirect } from 'next/navigation';

export default function ProjectsPage() {
  // Unify projects and campaigns under a single, focused Campaigns & Seva drives directory
  redirect('/campaigns');
}
