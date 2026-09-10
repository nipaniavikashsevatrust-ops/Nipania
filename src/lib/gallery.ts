import prisma from '@/lib/prisma';

export interface GalleryStory {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  location: string;
  date: string;
  image: string;
  mediaType: 'IMAGE' | 'VIDEO';
  beneficiaries: string;
  description: string;
  highlight: string;
  isFeatured: boolean;
}

export const GALLERY_CATEGORIES = [
  { label: 'All Initiatives', slug: 'all' },
  { label: 'Relief Seva', slug: 'relief' },
  { label: 'Healthcare Camps', slug: 'healthcare' },
  { label: 'Education Support', slug: 'education' },
  { label: 'Clean Water', slug: 'water' },
  { label: 'Women Empowerment', slug: 'empowerment' },
  { label: 'Environment & Greenery', slug: 'environment' },
];

export const CURATED_GALLERY_STORIES: GalleryStory[] = [
  {
    id: 'gal-1',
    title: 'Emergency Food & Ration Distribution Drive',
    category: 'Relief Seva',
    categorySlug: 'relief',
    location: 'Nipania & Rural Hamlets',
    date: 'Dec 2025',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'IMAGE',
    beneficiaries: '500+ Families',
    description: 'Supplied comprehensive monthly ration kits containing rice, pulses, edible oil, salt, and nutritional supplements to vulnerable rural families during winter shortages.',
    highlight: 'Zero Wastage Direct Delivery',
    isFeatured: true,
  },
  {
    id: 'gal-2',
    title: 'Rural Pediatric & General Healthcare Camp',
    category: 'Healthcare Camps',
    categorySlug: 'healthcare',
    location: 'Ranchi District Tribal Belt',
    date: 'Jan 2026',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'IMAGE',
    beneficiaries: '320+ Patients',
    description: 'Mobilized certified physicians and pediatricians for diagnostic checkups, essential medicine distribution, and hygiene counseling in underserved villages.',
    highlight: 'Free Medicines & Diagnostics',
    isFeatured: true,
  },
  {
    id: 'gal-3',
    title: 'School Bags, Books & Stationery Kits',
    category: 'Education Support',
    categorySlug: 'education',
    location: 'Government Primary Schools',
    date: 'Feb 2026',
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'IMAGE',
    beneficiaries: '240+ Children',
    description: 'Equipped eager young learners from marginalized backgrounds with durable backpacks, notebooks, geometry sets, and storybooks to boost primary school retention.',
    highlight: '100% School Attendance Retention',
    isFeatured: true,
  },
  {
    id: 'gal-4',
    title: 'Solar Clean Water Filtration Installation',
    category: 'Clean Water',
    categorySlug: 'water',
    location: 'Rural Jharkhand Villages',
    date: 'Mar 2026',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'IMAGE',
    beneficiaries: '1,200+ Residents',
    description: 'Commissioned solar-powered community water filtration systems, drastically reducing fluorosis and waterborne illnesses across remote habitations.',
    highlight: 'Solar Powered Reverse Osmosis',
    isFeatured: true,
  },
  {
    id: 'gal-5',
    title: 'Women Tailoring & Handloom Skill Workshop',
    category: 'Women Empowerment',
    categorySlug: 'empowerment',
    location: 'Trust Community Training Hub',
    date: 'Apr 2026',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'IMAGE',
    beneficiaries: '160+ Women',
    description: 'Conducted vocational training in apparel production, handloom embroidery, and basic bookkeeping, helping women establish self-help groups and independent livelihoods.',
    highlight: 'Self-Help Group Incubation',
    isFeatured: true,
  },
  {
    id: 'gal-6',
    title: 'Gramin Van Mahotsav & Tree Plantation Drive',
    category: 'Environment & Greenery',
    categorySlug: 'environment',
    location: 'Village Commons & Forest Borders',
    date: 'May 2026',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'IMAGE',
    beneficiaries: '650+ Saplings',
    description: 'Mobilized local youths and elders to plant fruit-bearing and indigenous medicinal trees with protective bamboo tree guards to restore local ecology.',
    highlight: '92% Sapling Survival Rate',
    isFeatured: true,
  },
  {
    id: 'gal-7',
    title: 'Winter Warmth: Heavy Blanket & Woolen Distribution',
    category: 'Relief Seva',
    categorySlug: 'relief',
    location: 'Night Shelters & Rural Hamlets',
    date: 'Dec 2025',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'IMAGE',
    beneficiaries: '450+ Elderly Citizens',
    description: 'Provided heavy fleece blankets, thermal jackets, and caps to elderly citizens and daily-wage laborers during intense northern winter cold waves.',
    highlight: 'Elderly & Destitute Outreach',
    isFeatured: true,
  },
  {
    id: 'gal-8',
    title: 'Youth Computer Lab & Digital Literacy Center',
    category: 'Education Support',
    categorySlug: 'education',
    location: 'Nipania Seva Kendra',
    date: 'Mar 2026',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'IMAGE',
    beneficiaries: '180+ Rural Youths',
    description: 'Established a 10-workstation computer lab providing certified basic IT, typing, government digital portal usage, and computer literacy courses.',
    highlight: 'Free Certified Digital Skills',
    isFeatured: true,
  },
  {
    id: 'gal-9',
    title: 'Community Eye Checkup & Spectacle Camp',
    category: 'Healthcare Camps',
    categorySlug: 'healthcare',
    location: 'Primary Health Sub-Center',
    date: 'Feb 2026',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'IMAGE',
    beneficiaries: '280+ Elderly',
    description: 'Specialist optometrists conducted cataract screenings and distributed custom refractive power spectacles to rural elders free of cost.',
    highlight: '140+ Free Spectacles Distributed',
    isFeatured: false,
  },
  {
    id: 'gal-10',
    title: 'Flood Emergency Rescue & Drinking Water Supply',
    category: 'Relief Seva',
    categorySlug: 'relief',
    location: 'Submerged Lowlands',
    date: 'Aug 2025',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    mediaType: 'IMAGE',
    beneficiaries: '850+ Affected People',
    description: 'Dispatched volunteer teams with inflatable boats, chlorine tablets, dry food packets, and first-aid kits during seasonal flash flooding.',
    highlight: '24/7 Rapid Emergency Response',
    isFeatured: false,
  },
];

export async function getUnifiedGalleryStories(): Promise<GalleryStory[]> {
  try {
    const dbItems = await prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (dbItems && dbItems.length > 0) {
      const dbMapped: GalleryStory[] = dbItems.map((item) => {
        let slug = 'relief';
        const catLower = item.category.toLowerCase();
        if (catLower.includes('health') || catLower.includes('camp')) slug = 'healthcare';
        else if (catLower.includes('edu') || catLower.includes('school')) slug = 'education';
        else if (catLower.includes('water')) slug = 'water';
        else if (catLower.includes('women') || catLower.includes('skill')) slug = 'empowerment';
        else if (catLower.includes('env') || catLower.includes('tree')) slug = 'environment';

        return {
          id: item.id,
          title: item.title,
          category: item.category,
          categorySlug: slug,
          location: 'Jharkhand, India',
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent',
          image: item.mediaUrl,
          mediaType: item.mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
          beneficiaries: 'Community Seva',
          description: item.caption || item.title,
          highlight: 'Verified On-Ground Initiative',
          isFeatured: item.isFeatured,
        };
      });

      // Return strictly the database records so edits and deletions are fully respected
      return dbMapped;
    }

    return [];
  } catch (error) {
    console.error('Error querying gallery items from database:', error);
    return [];
  }
}
