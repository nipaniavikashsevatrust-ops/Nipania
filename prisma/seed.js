const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Nipania Vikash Seva Trust database...');

  // 1. Create Super Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nipaniatrust.org' },
    update: {},
    create: {
      name: 'Super Administrator',
      email: 'admin@nipaniatrust.org',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      phone: '+91 9876543210',
      status: 'ACTIVE',
    },
  });
  console.log('Admin user ready:', adminUser.email);

  // 2. Create Official Trust Details (Strictly verified data only)
  await prisma.trustDetail.upsert({
    where: { id: 'trust-settings' },
    update: {
      name: 'NIPANIA VIKASH SEVA TRUST',
      pan: 'AAFTN4004N',
      tagline: 'SEVA | VIKASH | SAMARPAN',
    },
    create: {
      id: 'trust-settings',
      name: 'NIPANIA VIKASH SEVA TRUST',
      pan: 'AAFTN4004N',
      tagline: 'SEVA | VIKASH | SAMARPAN',
      email: 'info@nipaniatrust.org',
      phone: '+91 9876543210',
      registeredAddress: 'Nipania, P.O. Pargha, P.S. Baliapur, District Dhanbad, Jharkhand – 828201',
      state: 'Jharkhand',
      district: 'Dhanbad',
      pinCode: '828201',
      website: 'https://nipaniatrust.org',
    },
  });

  const stats = [
    { label: 'Lives Impacted', value: '0', prefix: '', suffix: '+', order: 1 },
    { label: 'Active Volunteers', value: '1', prefix: '', suffix: '+', order: 2 },
    { label: 'Certificates Issued', value: '2', prefix: '', suffix: '+', order: 3 },
    { label: 'Projects Initiated', value: '4', prefix: '', suffix: '', order: 4 },
    { label: 'Villages & Communities', value: '0', prefix: '', suffix: '+', order: 5 },
    { label: 'Events Conducted', value: '2', prefix: '', suffix: '+', order: 6 },
  ];

  for (const stat of stats) {
    const existingList = await prisma.impactStat.findMany({ where: { label: stat.label } });
    if (existingList.length === 0) {
      await prisma.impactStat.create({ data: stat });
    } else {
      const [first, ...duplicates] = existingList;
      await prisma.impactStat.update({
        where: { id: first.id },
        data: {
          value: stat.value,
          prefix: stat.prefix,
          suffix: stat.suffix,
          order: stat.order,
          isActive: true,
        },
      });
      if (duplicates.length > 0) {
        await prisma.impactStat.deleteMany({
          where: { id: { in: duplicates.map((d) => d.id) } },
        });
      }
    }
  }

  // 4. Content Blocks
  const contentBlocks = [
    {
      key: 'hero_title',
      title: 'Serving Communities. Building a Better Tomorrow.',
      subtitle: 'Committed to Seva, Vikash and Samarpan through meaningful community development and social initiatives.',
    },
    {
      key: 'about_who_we_are',
      title: 'About Nipania Vikash Seva Trust',
      content: 'Nipania Vikash Seva Trust is a dedicated public charitable organization founded upon the foundational principles of Seva (Selfless Service), Vikash (Inclusive Development), and Samarpan (Total Dedication). We work actively towards empowering underserved communities through education, primary healthcare awareness, rural livelihood enhancement, and sustainable social welfare programs.',
    },
    {
      key: 'mission_vision',
      title: 'Our Vision & Mission',
      content: 'Our vision is a self-reliant, empowered, and compassionate society where every individual has access to fundamental dignity, education, health, and opportunities for growth.',
      jsonContent: JSON.stringify({
        mission: 'To initiate, support, and execute community-driven programs that uplift rural and underprivileged families through education, healthcare, and sustainable livelihood support.',
        vision: 'To build resilient communities empowered with knowledge, health, and economic independence rooted in social equity and service.',
        values: [
          { title: 'Seva (Selfless Service)', desc: 'Putting community welfare and humanitarian service above self.' },
          { title: 'Vikash (Holistic Progress)', desc: 'Driving sustainable, tangible development for grassroots communities.' },
          { title: 'Samarpan (Dedication)', desc: 'Unyielding commitment, accountability, and integrity in every initiative.' },
          { title: 'Transparency', desc: 'Ensuring honest governance, financial clarity, and verifiable impact.' },
        ],
      }),
    },
  ];

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: block,
      create: block,
    });
  }

  // 5. Seed Projects
  const projects = [
    {
      slug: 'rural-education-support',
      title: 'Gramin Shiksha Abhiyan - Rural Education Support',
      category: 'Education',
      summary: 'Providing foundational learning materials, remedial tutoring, and digital literacy tools to underprivileged children in rural areas.',
      description: 'The Gramin Shiksha Abhiyan focuses on bridging the educational divide for rural children. Through localized learning centers, we provide school supplies, quality tutoring, and encouragement for continued schooling.',
      location: 'Nipania & Surrounding Villages',
      targetAmount: 250000,
      raisedAmount: 45000,
      beneficiariesCount: 150,
      status: 'ACTIVE',
      bannerImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      startDate: '2026-01-10',
    },
    {
      slug: 'swasthya-seva-camps',
      title: 'Arogya Seva - Community Health & Wellness Camps',
      category: 'Healthcare',
      summary: 'Free preventive health checkups, primary diagnosis, maternal healthcare counseling, and essential medicine distribution.',
      description: 'Arogya Seva conducts periodic health camps in remote hamlets, bringing qualified medical practitioners, basic diagnostic tests, and nutritional counseling directly to families without nearby medical facilities.',
      location: 'Rural Jharkhand Clusters',
      targetAmount: 300000,
      raisedAmount: 85000,
      beneficiariesCount: 300,
      status: 'ACTIVE',
      bannerImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      isFeatured: true,
      startDate: '2026-02-01',
    },
    {
      slug: 'women-skill-development',
      title: 'Nari Shakti - Women Skill & Livelihood Center',
      category: 'Women Empowerment',
      summary: 'Vocational tailoring, handicrafts training, and micro-entrepreneurship mentorship for rural women.',
      description: 'Empowering women with vocational craft skills and market linkages so they can attain financial independence and contribute to household stability.',
      location: 'Community Center, Nipania',
      targetAmount: 200000,
      raisedAmount: 32000,
      beneficiariesCount: 75,
      status: 'ACTIVE',
      bannerImage: '/images/women-empowerment.jpg',
      isFeatured: true,
      startDate: '2026-03-01',
    },
    {
      slug: 'clean-green-village',
      title: 'Paryavaran & Swachhata - Clean & Green Village Drive',
      category: 'Environment',
      summary: 'Afforestation, tree plantation, community waste management, and solar street lighting awareness.',
      description: 'Promoting ecological balance and hygienic village surroundings through community-led tree plantation and sanitation awareness campaigns.',
      location: 'Gram Panchayat Areas',
      targetAmount: 150000,
      raisedAmount: 18000,
      beneficiariesCount: 500,
      status: 'ACTIVE',
      bannerImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      isFeatured: false,
      startDate: '2026-04-15',
    },
  ];

  for (const proj of projects) {
    await prisma.project.upsert({
      where: { slug: proj.slug },
      update: proj,
      create: proj,
    });
  }

  // 6. Seed Sample Volunteer & ID Card
  const sampleVol = await prisma.volunteer.upsert({
    where: { volunteerId: 'NVS-VOL-000001' },
    update: {},
    create: {
      volunteerId: 'NVS-VOL-000001',
      fullName: 'Aarav Kumar Sharma',
      guardianName: 'Ramesh Sharma',
      dob: '1998-05-14',
      gender: 'Male',
      mobile: '+91 9876501234',
      email: 'aarav.sharma@example.com',
      address: 'Village Nipania, Post Office Road',
      district: 'Jharkhand',
      state: 'Jharkhand',
      pincode: '854301',
      education: 'Graduate (B.A.)',
      occupation: 'Social Worker',
      category: 'Community Volunteer',
      skills: 'Field Outreach, Event Management, Hindi/Bhojpuri Communication',
      availability: 'Weekends & Evenings',
      preferredLocation: 'Purnea District',
      status: 'APPROVED',
      idCardIssued: true,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  // Create corresponding ID Card for volunteer
  const issueDate = new Date();
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  await prisma.idCard.upsert({
    where: { cardNumber: 'NVS-VOL-000001' },
    update: {
      status: 'ACTIVE',
    },
    create: {
      cardNumber: 'NVS-VOL-000001',
      personType: 'VOLUNTEER',
      personId: sampleVol.id,
      fullName: 'Aarav Kumar Sharma',
      role: 'Community Volunteer',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      issueDate: issueDate,
      validUntil: validUntil,
      qrCodeData: 'https://nipaniatrust.org/verify/NVS-VOL-000001',
      status: 'ACTIVE',
      remarks: 'Official Volunteer ID Card issued upon successful verification.',
    },
  });

  // 7. Seed Board Members
  const boardMembers = [
    {
      name: 'Raj Kumar Mahato',
      designation: 'President & Managing Trustee',
      category: 'Executive Leadership',
      image: '/uploads/1788697970579-Gemini_Generated_Image_tkp7z7tkp7z7tkp7.png',
      quote: 'Selfless service to the underserved is the highest form of social responsibility and spiritual dedication.',
      roleDetails: 'Steering trust governance, statutory compliance, and strategic grassroots development programs.',
      tenure: 'Founding Trustee',
      order: 1,
      isActive: true,
    },
    {
      name: 'General Secretary',
      designation: 'General Secretary & Field Director',
      category: 'Operations & Community',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      quote: 'Real transformation starts when village youth and families are empowered with education and healthcare.',
      roleDetails: 'Leading community mobilization, volunteer coordination, and regional health camp execution.',
      tenure: 'Executive Trustee',
      order: 2,
      isActive: true,
    },
    {
      name: 'Treasurer & Compliance Trustee',
      designation: 'Treasurer & Financial Controller',
      category: 'Finance & Governance',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      quote: 'Every single rupee donated is held in sacred trust and directed transparently for verified social impact.',
      roleDetails: 'Managing financial audits, statutory accounts, donor receipts, and statutory compliance filings.',
      tenure: 'Trustee',
      order: 3,
      isActive: true,
    },
    {
      name: 'Advisory Council & Welfare Panel',
      designation: 'Social Advisory Board',
      category: 'Advisory Panel',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      quote: 'Providing expert guidance in rural schooling pedagogy, primary diagnostic standards, and women livelihood.',
      roleDetails: 'Composed of seasoned educationists, legal advocates, and medical doctors guiding outreach policy.',
      tenure: 'Honorary Council',
      order: 4,
      isActive: true,
    },
  ];

  for (const bm of boardMembers) {
    const existing = await prisma.boardMember.findFirst({ where: { name: bm.name } });
    if (existing) {
      await prisma.boardMember.update({ where: { id: existing.id }, data: bm });
    } else {
      await prisma.boardMember.create({ data: bm });
    }
  }
  console.log(`Board members ready: ${boardMembers.length} trustees`);

  // 8. Seed Sample Official Certificates (Volunteer-First Recognition)
  const sampleCertificates = [
    {
      certificateNumber: 'NVST-CERT-000001',
      certificateType: 'VOLUNTEER_SERVICE',
      title: 'Certificate of Volunteer Service',
      recipientName: 'Aarav Kumar Sharma',
      recipientEmail: 'aarav.sharma@example.com',
      volunteerId: sampleVol.id,
      description: 'In recognition of outstanding dedication, exemplary field outreach, and valuable voluntary service rendered towards the community development and social welfare initiatives of the Trust.',
      issueDate: new Date('2026-03-01'),
      status: 'ISSUED',
      issuedBy: 'Board of Trustees',
      approvedBy: 'Managing Trustee',
      verificationCode: 'VER-NVST-VOL-001',
      verificationUrl: 'https://nipaniatrust.org/verify/NVST-CERT-000001',
      signatoryName: 'Raj Kumar Mahato',
      signatoryTitle: 'President & Managing Trustee',
    },
    {
      certificateNumber: 'NVST-CERT-000002',
      certificateType: 'EVENT_PARTICIPATION',
      title: 'Certificate of Event Participation',
      recipientName: 'Pooja Kumari Verma',
      recipientEmail: 'pooja.verma@example.com',
      description: 'In appreciation of active participation and community support during the Community Health & Arogya Seva Camp organized in Hunterganj.',
      issueDate: new Date('2026-04-10'),
      status: 'ISSUED',
      issuedBy: 'Health Welfare Director',
      approvedBy: 'Managing Trustee',
      verificationCode: 'VER-NVST-EVT-002',
      verificationUrl: 'https://nipaniatrust.org/verify/NVST-CERT-000002',
      signatoryName: 'Raj Kumar Mahato',
      signatoryTitle: 'President & Managing Trustee',
    },
  ];

  for (const cert of sampleCertificates) {
    await prisma.certificate.upsert({
      where: { certificateNumber: cert.certificateNumber },
      update: cert,
      create: cert,
    });
  }
  console.log(`Certificates ready: ${sampleCertificates.length} official certificates seeded`);

  // 8. Seed Events
  const sampleEvents = [
    {
      slug: 'annual-health-checkup-drive-2026',
      title: 'Free Mega Health & Eye Checkup Camp',
      category: 'Healthcare Camp',
      description: 'Comprehensive general health, vision screening, and basic pediatric checkup camp organized in collaboration with local medical volunteers.',
      location: 'Nipania Panchayat Bhavan Complex',
      eventDate: '2026-10-15',
      eventTime: '09:00 AM - 04:00 PM',
      organizer: 'Nipania Vikash Seva Trust Health Wing',
      maxSeats: 250,
      registrationRequired: true,
      bannerImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      status: 'UPCOMING',
      isFeatured: true,
    },
    {
      slug: 'rural-tree-plantation-drive-2026',
      title: 'Van Mahotsav - 1,000 Sapling Plantation Drive',
      category: 'Environment Drive',
      description: 'Community plantation drive involving youth volunteers, village elders, and schoolchildren to increase green cover along rural road corridors.',
      location: 'Nipania Riverfront & School Grounds',
      eventDate: '2026-11-05',
      eventTime: '07:30 AM - 12:00 PM',
      organizer: 'Nipania Seva Youth Club',
      maxSeats: 150,
      registrationRequired: true,
      bannerImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      status: 'UPCOMING',
      isFeatured: true,
    },
  ];

  for (const evt of sampleEvents) {
    await prisma.event.upsert({
      where: { slug: evt.slug },
      update: evt,
      create: evt,
    });
  }

  // 9. Seed News / Articles
  const articles = [
    {
      slug: 'welcome-to-nipania-vikash-seva-trust',
      title: 'Dedicated to Grassroots Progress: Trust Embarks on New Initiatives',
      excerpt: 'Guided by the eternal motto of Seva, Vikash, and Samarpan, Nipania Vikash Seva Trust expands its outreach programs.',
      content: 'Nipania Vikash Seva Trust continues its steadfast commitment to social upliftment and humanitarian service. Through participatory community planning and dedicated field volunteers, the Trust is launching targeted initiatives in primary education support and preventive healthcare across rural clusters.\n\nWe invite volunteers, well-wishers, and community leaders to join hands in building a sustainable and self-reliant society.',
      category: 'Trust Announcement',
      coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
      isPublished: true,
      author: 'Board of Trustees',
    },
  ];

  for (const art of articles) {
    await prisma.newsArticle.upsert({
      where: { slug: art.slug },
      update: art,
      create: art,
    });
  }

  // 10. Seed Documents (Compliance / Transparency)
  const documents = [
    {
      title: 'Trust Registration & Deed Declaration',
      category: 'TRUST_DEED',
      year: '2026',
      fileUrl: '/docs/trust_deed_declaration.pdf',
      fileSize: '420 KB',
      isPublic: true,
      description: 'Official Trust Deed and Constitution documents of Nipania Vikash Seva Trust.',
    },
    {
      title: 'Permanent Account Number (PAN) Card (AAFTN4004N)',
      category: 'PAN',
      year: '2026',
      fileUrl: '/docs/pan_card_aaftn4004n.pdf',
      fileSize: '210 KB',
      isPublic: true,
      description: 'Official PAN Card verification document issued by the Income Tax Department, Govt of India.',
    },
    {
      title: 'Trust Governance & Transparency Policy',
      category: 'POLICY',
      year: '2026',
      fileUrl: '/docs/governance_policy.pdf',
      fileSize: '315 KB',
      isPublic: true,
      description: 'Ethical governance, zero-conflict, donor privacy, and fund allocation guidelines.',
    },
  ];

  for (const doc of documents) {
    const existing = await prisma.document.findFirst({ where: { title: doc.title } });
    if (!existing) {
      await prisma.document.create({ data: doc });
    }
  }

  // 11. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_INIT',
      module: 'SETTINGS',
      performedBy: 'System Seeder',
      userEmail: 'admin@nipaniatrust.org',
      details: 'System initialized with official Trust identity (PAN: AAFTN4004N) and initial database entities.',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
