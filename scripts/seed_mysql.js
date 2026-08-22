const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seed() {
  console.log('Connecting via Prisma to MySQL huit_iconic_2026_db...');

  // 1. Insert or update Admin User
  const passwordHash = await bcrypt.hash('Huit@media2019', 10);
  await prisma.adminUser.upsert({
    where: { username: 'Iconic2026.Huitmedia' },
    update: { passwordHash, role: 'SUPER_ADMIN', isActive: true },
    create: {
      id: 'admin-iconic',
      username: 'Iconic2026.Huitmedia',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  console.log('Admin account created in MySQL: Iconic2026.Huitmedia');

  // 2. Load JSON data
  const jsonPath = path.resolve(__dirname, '../huit_iconic_2026_db.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Candidates
    if (Array.isArray(data.candidates)) {
      for (const c of data.candidates) {
        await prisma.candidate.upsert({
          where: { sbd: c.sbd },
          update: {
            name: c.name,
            votes: c.votes || 0,
            imageUrl: c.imageUrl,
            description: c.description,
            biography: c.biography || ''
          },
          create: {
            id: c.id,
            sbd: c.sbd,
            name: c.name,
            votes: c.votes || 0,
            imageUrl: c.imageUrl,
            description: c.description,
            biography: c.biography || ''
          }
        });
      }
      console.log(`Seeded ${data.candidates.length} candidates into MySQL.`);
    }

    // Sponsors
    if (Array.isArray(data.sponsors)) {
      for (const s of data.sponsors) {
        await prisma.sponsor.upsert({
          where: { id: s.id },
          update: {
            name: s.name,
            logoUrl: s.logoUrl,
            tier: s.tier || 'PLATINUM'
          },
          create: {
            id: s.id,
            name: s.name,
            logoUrl: s.logoUrl,
            tier: s.tier || 'PLATINUM'
          }
        });
      }
      console.log(`Seeded ${data.sponsors.length} sponsors into MySQL.`);
    }

    // Timeline
    if (Array.isArray(data.timeline)) {
      for (const t of data.timeline) {
        await prisma.timelineEvent.upsert({
          where: { id: t.id },
          update: {
            date: t.date,
            title: t.title,
            description: t.description,
            isActive: t.isActive !== false
          },
          create: {
            id: t.id,
            date: t.date,
            title: t.title,
            description: t.description,
            isActive: t.isActive !== false
          }
        });
      }
      console.log(`Seeded ${data.timeline.length} timeline events into MySQL.`);
    }

    // Banners
    if (Array.isArray(data.banners)) {
      for (const b of data.banners) {
        await prisma.banner.upsert({
          where: { id: b.id },
          update: {
            title: b.title,
            imageUrl: b.imageUrl,
            link: b.link || '#',
            isActive: b.isActive !== false
          },
          create: {
            id: b.id,
            title: b.title,
            imageUrl: b.imageUrl,
            link: b.link || '#',
            isActive: b.isActive !== false
          }
        });
      }
      console.log(`Seeded ${data.banners.length} banners into MySQL.`);
    }
  }

  await prisma.$disconnect();
  console.log('Seed completed successfully!');
}

seed().catch(async (err) => {
  console.error('Error seeding database:', err);
  await prisma.$disconnect();
  process.exit(1);
});
