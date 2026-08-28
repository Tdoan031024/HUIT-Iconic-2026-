const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const candidates = await prisma.candidate.findMany();
  console.log('Candidates count:', candidates.length);
  candidates.forEach(c => {
    console.log(`- [${c.sbd}] ${c.name} | hasEnDesc: ${!!c.descriptionEn} | hasEnBio: ${!!c.biographyEn}`);
  });

  const timeline = await prisma.timelineEvent.findMany();
  console.log('\nTimeline count:', timeline.length);
  timeline.forEach(t => {
    console.log(`- [${t.date}] ${t.title} | titleEn: ${t.titleEn || 'NONE'}`);
  });

  const sponsors = await prisma.sponsor.findMany();
  console.log('\nSponsors count:', sponsors.length);
  sponsors.forEach(s => {
    console.log(`- ${s.name} | descEn: ${s.descriptionEn || 'NONE'}`);
  });

  const banners = await prisma.banner.findMany();
  console.log('\nBanners count:', banners.length);
  banners.forEach(b => {
    console.log(`- ${b.title} | titleEn: ${b.titleEn || 'NONE'}`);
  });

  const posts = await prisma.post.findMany();
  console.log('\nPosts count:', posts.length);
  posts.forEach(p => {
    console.log(`- ${p.title} | titleEn: ${p.titleEn || 'NONE'}`);
  });

  const setting = await prisma.systemSetting.findUnique({ where: { id: 'default' } });
  if (setting) {
    const data = JSON.parse(setting.data);
    console.log('\nSetting keys:', Object.keys(data));
  }
}

main().finally(() => prisma.$disconnect());
