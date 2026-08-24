/**
 * Script sao lưu Database MySQL và thư mục Uploads
 * Sử dụng: node scripts/backup_mysql.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('🔄 Bắt đầu sao lưu toàn bộ cơ sở dữ liệu HUIT ICONIC 2026...');

  try {
    const [
      candidates,
      sponsors,
      banners,
      timeline,
      posts,
      webUsers,
      votes,
      settings,
      adminUsers,
      auditLogs,
    ] = await Promise.all([
      prisma.candidate.findMany(),
      prisma.sponsor.findMany(),
      prisma.banner.findMany(),
      prisma.timelineEvent.findMany(),
      prisma.post.findMany(),
      prisma.webUser.findMany(),
      prisma.voteRecord.findMany(),
      prisma.systemSetting.findMany(),
      prisma.adminUser.findMany(),
      prisma.adminAuditLog.findMany(),
    ]);

    const backupData = {
      backupTimestamp: timestamp,
      version: '2.0.0',
      database: 'huit_iconic_2026_db',
      statistics: {
        candidates: candidates.length,
        sponsors: sponsors.length,
        banners: banners.length,
        timeline: timeline.length,
        posts: posts.length,
        webUsers: webUsers.length,
        votes: votes.length,
        settings: settings.length,
        adminUsers: adminUsers.length,
        auditLogs: auditLogs.length,
      },
      data: {
        candidates,
        sponsors,
        banners,
        timeline,
        posts,
        webUsers,
        votes,
        settings,
        adminUsers,
        auditLogs,
      },
    };

    const backupFile = path.join(backupDir, `backup_db_${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');

    console.log(`✅ Sao lưu Database thành công!`);
    console.log(`📁 File lưu tại: ${backupFile}`);
    console.log(`📊 Thống kê:`);
    console.table(backupData.statistics);
  } catch (error) {
    console.error('❌ Lỗi khi sao lưu database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
