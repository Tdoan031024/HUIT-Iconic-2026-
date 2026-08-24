import prisma from './prisma';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Candidate, Sponsor, TimelineEvent, Banner, VotePackage, WebUser, SystemSettings } from './types';
import { hashPasswordMd5, isMd5Hash, normalizeEmail, generateWebToken, extractWebUserFromToken } from './auth';
import { sendPasswordResetCode } from './mailer';

const DEFAULT_SETTINGS: SystemSettings = {
  isGateOpen: true,
  startDate: '2026-06-01T00:00',
  endDate: '2026-12-31T23:59',
  maxVotesPerPhone: 5,
  eventTitle: "HUIT's ICONIC 2026 - Cuộc thi Tìm kiếm Đại sứ Truyền thông HUIT",
  organizer: "Trường Đại học Công Thương TP.HCM (HUIT)",
  contactEmail: "media@huit.edu.vn",
  isMaintenanceMode: false,
  sponsorBannerUrl: "/uploads/nhataitro.png",
  hideSponsorBanner: false,
  hidePublicVoteHistory: false,
  aboutTitle: "HUIT'S ICONIC - ĐẠI SỨ TRUYỀN THÔNG HUIT",
  aboutDescription: "Cuộc thi Tìm kiếm Đại sứ Truyền thông Trường Đại học Công Thương TP.HCM (HUIT's ICONIC) là hoạt động thường niên do Trường Đại học Công Thương TP. Hồ Chí Minh tổ chức. Cuộc thi hướng đến việc tìm kiếm những sinh viên hội tụ vẻ đẹp tâm hồn, nét đẹp trí tuệ, sự thanh lịch, cá tính, khả năng giao tiếp và bản lĩnh truyền tải thông điệp trước công chúng.\n\nĐại sứ Truyền thông HUIT sẽ là những gương mặt đại diện cho hình ảnh năng động, sáng tạo, tự tin và trách nhiệm của sinh viên HUIT trong các hoạt động truyền thông, tuyển sinh, hướng nghiệp, sự kiện văn hóa và dự án cộng đồng.",
  aboutImageUrl: "/uploads/poster-khoi-nghiep.jpg",
  statsYear: "2024",
  statsCandidates: "110+",
  statsVotes: "500K+",
  statsParticipants: "110",
  statsViews: "5 triệu",
  statsMedia: "25+",
  statsSchools: "16+ Khoa",
  aboutSubtitle: "Cuộc thi Tìm kiếm Đại sứ Truyền thông Trường Đại học Công Thương TP.HCM",
  aboutTheme: "Nét đẹp tâm hồn - Trí tuệ - Thanh lịch - Cá tính - Bản lĩnh - Truyền cảm hứng",
  aboutOrganizerDetail: "Đơn vị tổ chức: Trường Đại học Công Thương TP. HCM (HUIT).\nĐơn vị đầu mối truyền thông: Trung tâm Tuyển sinh và Truyền thông HUIT.\nFanpage chính thức: https://www.facebook.com/Daisutruyenthonghuit",
  aboutSectors: "Vẻ đẹp tâm hồn & Nét đẹp trí tuệ\nSự thanh lịch & Phong cách trình diễn\nKỹ năng thuyết trình & Ứng xử bản lĩnh\nTruyền thông & Hoạt động cộng đồng",
  aboutBenefits: "Đào tạo kỹ năng catwalk & phong thái sân khấu\nCố vấn kỹ năng thuyết trình, ứng xử & giao tiếp\nPhotoshoot & Xây dựng hình ảnh thương hiệu cá nhân\nHọc bổng ngoại ngữ & Học bổng Thạc sĩ toàn phần 20.000 USD",
  aboutPrize: "Vương miện Đại sứ, Cúp, Sash, Tiền mặt, Học bổng Tiếng Anh (10 triệu), Học bổng Tiếng Hàn/Nhật (10 triệu), và Học bổng Thạc sĩ toàn phần 20.000 USD tại Đại học Shinawatra (Thái Lan).",
  aboutParticipants: "Sinh viên đang theo học tại Trường Đại học Công Thương TP.HCM (HUIT).\nNữ: Chiều cao từ 1m58 trở lên.\nNam: Chiều cao từ 1m65 trở lên.\nĐạo đức tốt, năng động, có nguyện vọng trở thành đại sứ hình ảnh HUIT.",
  aboutContactName: "Khánh Linh",
  aboutContactRole: "Trung tâm Tuyển sinh và Truyền thông HUIT",
  aboutContactPhone: "0708765157",
  aboutContactWebsite: "https://huit.edu.vn",
  aboutContactQrUrl: "/images/qrdangky.png",
  isRegistrationOpen: false,
  registrationDeadline: "2026-09-30T23:59",
  registrationUrl: "https://huit.edu.vn",
  detailUrl: "https://huit.edu.vn",
  supportZaloUrl: "https://zalo.me/4418938306145458374",
  freeVotesPerAccountPerDay: 2,
  sepayBankName: "KienLongBank",
  sepayAccountNo: "101499100004001667",
  sepayAccountName: "DANG XUAN DUONG",
  sepayPrefix: "MD",
  sepayApiKey: "1dcd4e6cd52fde1e4bf0510a9b406476322d811f3bbae785",
  isTestMode: true,
};

// --- SETTINGS (100% MySQL Prisma) ---
export async function getSettings(): Promise<SystemSettings> {
  const row = await prisma.systemSetting.findUnique({
    where: { id: 'default' },
  });
  if (!row || !row.data) {
    return DEFAULT_SETTINGS;
  }
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(row.data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getPublicSettings(): Promise<Partial<SystemSettings>> {
  const full = await getSettings();
  const { sepayApiKey, ...publicSettings } = full as any;
  return publicSettings;
}

export async function updateSettings(updatedFields: Partial<SystemSettings>): Promise<SystemSettings> {
  const current = await getSettings();
  const merged = { ...current, ...updatedFields };
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: { data: JSON.stringify(merged) },
    create: { id: 'default', data: JSON.stringify(merged) },
  });
  return merged;
}

// --- ADMIN AUDIT LOGS ---
export async function logAdminAction(adminUser: string, action: string, targetType: string, targetId?: string, targetName?: string, details?: string, ipAddress?: string) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminUser: adminUser || 'admin',
        action,
        targetType,
        targetId,
        targetName,
        details,
        ipAddress,
      },
    });
  } catch (e) {
    console.error('Audit log error:', e);
  }
}

export async function getAdminAuditLogs(limit = 100) {
  return await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// --- PUBLIC ANALYTICS ---
export async function recordPageView(
  data: { visitorId?: string; path?: string; referrer?: string | null },
  userAgent?: string,
  ipAddress?: string,
) {
  const visitorId = String(data.visitorId || '').trim().slice(0, 160);
  const pagePath = String(data.path || '/').trim().slice(0, 500) || '/';
  if (!visitorId) return { ok: false };

  const ipHash = ipAddress
    ? crypto.createHash('sha256').update(ipAddress).digest('hex')
    : undefined;

  await prisma.pageView.create({
    data: {
      visitorId,
      path: pagePath,
      referrer: data.referrer ? String(data.referrer).slice(0, 1000) : null,
      userAgent: userAgent ? userAgent.slice(0, 1000) : null,
      ipHash,
    },
  });
  return { ok: true };
}

export async function getAnalyticsSummary() {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const activeSince = new Date(now.getTime() - 5 * 60 * 1000);

  const [totalViews, views24h, uniqueVisitors30Days, uniqueVisitors24h, activeVisitors] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: last24Hours } } }),
    prisma.pageView.findMany({ where: { createdAt: { gte: last30Days } }, distinct: ['visitorId'], select: { visitorId: true } }),
    prisma.pageView.findMany({ where: { createdAt: { gte: last24Hours } }, distinct: ['visitorId'], select: { visitorId: true } }),
    prisma.pageView.findMany({ where: { createdAt: { gte: activeSince } }, distinct: ['visitorId'], select: { visitorId: true } }),
  ]);

  return {
    totalViews,
    views24h,
    uniqueVisitors30Days: uniqueVisitors30Days.length,
    uniqueVisitors24h: uniqueVisitors24h.length,
    activeVisitors: activeVisitors.length,
    generatedAt: now.toISOString(),
  };
}

export async function getDashboardStats() {
  const [totalPosts, totalUsers, totalSponsors, totalVotes, settings, analytics] = await Promise.all([
    prisma.post.count({ where: { isDeleted: false } }),
    prisma.webUser.count({ where: { isDeleted: false } }),
    prisma.sponsor.count({ where: { isDeleted: false } }),
    prisma.voteRecord.count(),
    getSettings(),
    getAnalyticsSummary(),
  ]);

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentVotes = await prisma.voteRecord.findMany({ where: { voteTime: { gte: since } }, select: { voteTime: true } });
  const chartData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    return {
      label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      value: recentVotes.filter((vote) => vote.voteTime.toISOString().slice(0, 10) === key).length,
    };
  });

  return { totalPosts, totalUsers, totalWebUsers: totalUsers, totalSponsors, totalVotes, settings, analytics, chartData };
}

export async function getActiveNotifications() {
  const now = new Date();
  return prisma.notification.findMany({
    where: { isActive: true, startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function createSupportTicket(data: { name: string; email: string; subject: string; message: string }) {
  return prisma.supportTicket.create({ data: { ...data, status: 'OPEN' } });
}

export async function getSupportTickets() {
  return prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
}

// --- ADMIN AUTH ---
export async function validateAdminCredentials(username: string, password: string) {
  const admin = await prisma.adminUser.findFirst({
    where: { username, isActive: true },
  });

  if (!admin && process.env.NODE_ENV !== 'production') {
    if (
      (username === 'Iconic2026.Huitmedia' && password === 'Huit@media2019') ||
      (username === 'admin' && password === 'admin123')
    ) {
      return { id: 'admin-iconic', username: username, role: 'SUPER_ADMIN' };
    }
  }
  if (!admin) return null;

  let isValid = false;
  if (isMd5Hash(admin.passwordHash)) {
    isValid = admin.passwordHash.toLowerCase() === hashPasswordMd5(password).toLowerCase();
  } else {
    isValid = await bcrypt.compare(password, admin.passwordHash);
  }

  if (!isValid) return null;
  return { id: admin.id, username: admin.username, role: admin.role };
}

export async function changeAdminPassword(adminId: string, currentPass: string, newPass: string) {
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) throw new Error('Không tìm thấy tài khoản admin.');

  let isValid = false;
  if (isMd5Hash(admin.passwordHash)) {
    isValid = admin.passwordHash.toLowerCase() === hashPasswordMd5(currentPass).toLowerCase();
  } else {
    isValid = await bcrypt.compare(currentPass, admin.passwordHash);
  }

  if (!isValid) throw new Error('Mật khẩu hiện tại không đúng.');
  const newHash = await bcrypt.hash(newPass, 10);
  await prisma.adminUser.update({
    where: { id: adminId },
    data: { passwordHash: newHash },
  });
  await logAdminAction(admin.username, 'CHANGE_PASSWORD', 'ADMIN_USER', admin.id, admin.username, 'Đổi mật khẩu tài khoản quản trị thành công');
  return { success: true };
}

// --- CANDIDATES (100% MySQL Prisma with Soft Delete) ---
export async function getCandidates(): Promise<Candidate[]> {
  const list = await prisma.candidate.findMany({
    where: { isDeleted: false },
    orderBy: { votes: 'desc' },
  });
  return list.map((c) => ({
    id: c.id,
    sbd: c.sbd,
    name: c.name,
    votes: c.votes,
    imageUrl: c.imageUrl,
    description: c.description,
    biography: c.biography || undefined,
    advisorName: c.advisorName || undefined,
    contestTable: c.contestTable as any,
    contestTableLabel: c.contestTableLabel || undefined,
    currentRound: c.currentRound || undefined,
    expectations: c.expectations || undefined,
    implementationLocation: c.implementationLocation || undefined,
    intellectualPropertyCommitment: c.intellectualPropertyCommitment || false,
    leaderEmail: c.leaderEmail || undefined,
    leaderName: c.leaderName || undefined,
    leaderPhone: c.leaderPhone || undefined,
    members: c.members || undefined,
    representativeSchool: c.representativeSchool || undefined,
    status: c.status || undefined,
    supportNeeds: c.supportNeeds || undefined,
    teamName: c.teamName || undefined,
    sector: c.sector || undefined,
    showcaseImages: c.showcaseImages || undefined,
  }));
}

export async function getCandidateBySbd(sbd: string): Promise<Candidate> {
  const candidate = await prisma.candidate.findFirst({
    where: {
      OR: [{ sbd }, { id: sbd }],
      isDeleted: false,
    },
  });
  if (!candidate) throw new Error('Không tìm thấy thí sinh.');
  return {
    id: candidate.id,
    sbd: candidate.sbd,
    name: candidate.name,
    votes: candidate.votes,
    imageUrl: candidate.imageUrl,
    description: candidate.description,
    biography: candidate.biography || undefined,
    advisorName: candidate.advisorName || undefined,
    contestTable: candidate.contestTable as any,
    contestTableLabel: candidate.contestTableLabel || undefined,
    currentRound: candidate.currentRound || undefined,
    expectations: candidate.expectations || undefined,
    implementationLocation: candidate.implementationLocation || undefined,
    intellectualPropertyCommitment: candidate.intellectualPropertyCommitment || false,
    leaderEmail: candidate.leaderEmail || undefined,
    leaderName: candidate.leaderName || undefined,
    leaderPhone: candidate.leaderPhone || undefined,
    members: candidate.members || undefined,
    representativeSchool: candidate.representativeSchool || undefined,
    status: candidate.status || undefined,
    supportNeeds: candidate.supportNeeds || undefined,
    teamName: candidate.teamName || undefined,
    sector: candidate.sector || undefined,
    showcaseImages: candidate.showcaseImages || undefined,
  };
}

export async function getCandidateVotes(sbd: string) {
  const candidate = await getCandidateBySbd(sbd);
  const records = await prisma.voteRecord.findMany({
    where: { candidateId: candidate.id },
    orderBy: { voteTime: 'desc' },
  });
  return records;
}

// Anti-cheat rate limiting: IP / Voter cooldown tracker
const voteCooldownMap = new Map<string, number>();

export function checkVoteRateLimit(voterKey: string, cooldownSeconds: number = 2): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const lastVoteTime = voteCooldownMap.get(voterKey);
  if (lastVoteTime && now - lastVoteTime < cooldownSeconds * 1000) {
    const remaining = Math.ceil((cooldownSeconds * 1000 - (now - lastVoteTime)) / 1000);
    return { allowed: false, remainingSeconds: remaining };
  }
  voteCooldownMap.set(voterKey, now);
  if (voteCooldownMap.size > 5000) {
    const cutoff = now - 60000;
    voteCooldownMap.forEach((v, k) => { if (v < cutoff) voteCooldownMap.delete(k); });
  }
  return { allowed: true };
}

export async function voteCandidate(sbd: string, body: any, authHeader?: string, clientIp?: string) {
  const voterKey = body.voterPhone || body.userId || clientIp || 'GUEST_VOTER';
  
  const rateLimit = checkVoteRateLimit(voterKey, 2);
  if (!rateLimit.allowed) {
    throw new Error(`Thao tác quá nhanh! Vui lòng chờ ${rateLimit.remainingSeconds || 2}s trước khi gửi tiếp.`);
  }

  const candidate = await getCandidateBySbd(sbd);
  const addPoints = body.points || 1;
  const signalSecret = process.env.JWT_SECRET || 'iconic-vote-signal-secret';
  const ipHash = clientIp ? crypto.createHash('sha256').update(`${signalSecret}:ip:${clientIp}`).digest('hex') : null;
  const deviceId = String(body.deviceId || '').trim();
  const deviceHash = deviceId ? crypto.createHash('sha256').update(`${signalSecret}:device:${deviceId}`).digest('hex') : null;
  const recentSince = new Date(Date.now() - 10 * 60 * 1000);
  const [recentIpVotes, recentDeviceVotes] = await Promise.all([
    ipHash ? prisma.voteRecord.count({ where: { ipHash, voteTime: { gte: recentSince } } }) : Promise.resolve(0),
    deviceHash ? prisma.voteRecord.count({ where: { deviceHash, voteTime: { gte: recentSince } } }) : Promise.resolve(0),
  ]);
  const riskReasons: string[] = [];
  if (recentIpVotes >= 12) riskReasons.push('IP_RATE_SPIKE');
  if (recentDeviceVotes >= 8) riskReasons.push('DEVICE_RATE_SPIKE');
  const riskScore = Math.min(100, recentIpVotes * 4 + recentDeviceVotes * 6);
  if (riskScore >= 80) throw new Error('Hoạt động bình chọn bất thường. Vui lòng thử lại sau.');

  const updated = await prisma.candidate.update({
    where: { id: candidate.id },
    data: { votes: { increment: addPoints } },
  });
  await prisma.voteRecord.create({
    data: {
      candidateId: candidate.id,
      voterPhone: body.voterPhone || body.userId || 'GUEST',
      transactionId: body.transactionId,
      ipHash,
      deviceHash,
      riskScore,
      riskReason: riskReasons.length ? riskReasons.join(',') : null,
    },
  });
  return { success: true, candidate: { ...candidate, votes: updated.votes } };
}

export async function addCandidate(data: Partial<Candidate>, adminUser = 'admin'): Promise<Candidate> {
  const sbd = data.sbd || `SBD-${Date.now()}`;
  const created = await prisma.candidate.create({
    data: {
      sbd,
      name: data.name || 'Thí sinh mới',
      votes: data.votes || 0,
      imageUrl: data.imageUrl || '/original_assets/imageada2.png',
      description: data.description || '',
      biography: data.biography,
      advisorName: data.advisorName,
      contestTable: data.contestTable,
      contestTableLabel: data.contestTableLabel,
      currentRound: data.currentRound || 'Vòng loại',
      expectations: data.expectations,
      implementationLocation: data.implementationLocation,
      intellectualPropertyCommitment: data.intellectualPropertyCommitment || false,
      leaderEmail: data.leaderEmail,
      leaderName: data.leaderName,
      leaderPhone: data.leaderPhone,
      members: data.members,
      representativeSchool: data.representativeSchool,
      status: data.status || 'Đủ hồ sơ',
      supportNeeds: data.supportNeeds,
      teamName: data.teamName,
      sector: data.sector,
      showcaseImages: data.showcaseImages,
      isDeleted: false,
    },
  });
  await logAdminAction(adminUser, 'CREATE', 'CANDIDATE', created.id, created.name, `Thêm thí sinh mới SBD: ${created.sbd}`);
  return created as any;
}

export async function bulkImportCandidates(payload: Partial<Candidate>[], adminUser = 'admin'): Promise<{ successCount: number; errors: string[] }> {
  let successCount = 0;
  const errors: string[] = [];
  for (const item of payload) {
    try {
      await addCandidate(item, adminUser);
      successCount++;
    } catch (err: any) {
      errors.push(`Lỗi import [${item.sbd || item.name}]: ${err.message}`);
    }
  }
  await logAdminAction(adminUser, 'IMPORT', 'CANDIDATE', undefined, undefined, `Import thành công ${successCount}/${payload.length} thí sinh từ CSV`);
  return { successCount, errors };
}

export async function updateCandidate(id: string, fields: Partial<Candidate>, adminUser = 'admin'): Promise<Candidate> {
  const updated = await prisma.candidate.update({
    where: { id },
    data: { ...fields } as any,
  });
  await logAdminAction(adminUser, 'UPDATE', 'CANDIDATE', id, updated.name, `Cập nhật thông tin thí sinh SBD: ${updated.sbd}`);
  return updated as any;
}

// Soft delete to Trash
export async function deleteCandidate(id: string, adminUser = 'admin'): Promise<{ success: boolean }> {
  const c = await prisma.candidate.findUnique({ where: { id } });
  await prisma.candidate.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  await logAdminAction(adminUser, 'DELETE_TRASH', 'CANDIDATE', id, c?.name || id, 'Chuyển hồ sơ thí sinh vào thùng rác');
  return { success: true };
}

// --- SPONSORS (100% MySQL Prisma with Soft Delete) ---
export async function getSponsors(): Promise<Sponsor[]> {
  const list = await prisma.sponsor.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
  });
  return list.map((s) => ({
    id: s.id,
    name: s.name,
    logoUrl: s.logoUrl,
    tier: s.tier as any,
    description: s.description || undefined,
    descriptionEn: s.descriptionEn || undefined,
    websiteUrl: s.websiteUrl || undefined,
    email: s.email || undefined,
    phone: s.phone || undefined,
    contactPerson: s.contactPerson || undefined,
  }));
}

export async function addSponsor(data: Partial<Sponsor>, adminUser = 'admin'): Promise<Sponsor> {
  const created = await prisma.sponsor.create({
    data: {
      name: data.name || 'Nhà tài trợ mới',
      logoUrl: data.logoUrl || '/images/site-logo.png',
      tier: (data.tier as any) || 'PARTNER',
      description: data.description,
      websiteUrl: data.websiteUrl,
      email: data.email,
      phone: data.phone,
      contactPerson: data.contactPerson,
      isDeleted: false,
    },
  });
  await logAdminAction(adminUser, 'CREATE', 'SPONSOR', created.id, created.name, `Thêm nhà tài trợ mới: ${created.name}`);
  return created as any;
}

export async function updateSponsor(id: string, fields: Partial<Sponsor>, adminUser = 'admin'): Promise<Sponsor> {
  const updated = await prisma.sponsor.update({
    where: { id },
    data: { ...fields } as any,
  });
  await logAdminAction(adminUser, 'UPDATE', 'SPONSOR', id, updated.name, `Cập nhật thông tin nhà tài trợ: ${updated.name}`);
  return updated as any;
}

// Soft delete to Trash
export async function deleteSponsor(id: string, adminUser = 'admin'): Promise<{ success: boolean }> {
  const s = await prisma.sponsor.findUnique({ where: { id } });
  await prisma.sponsor.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  await logAdminAction(adminUser, 'DELETE_TRASH', 'SPONSOR', id, s?.name || id, 'Chuyển nhà tài trợ vào thùng rác');
  return { success: true };
}

// --- TIMELINE (100% MySQL Prisma with Soft Delete) ---
export async function getTimeline(): Promise<TimelineEvent[]> {
  const list = await prisma.timelineEvent.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'asc' },
  });
  return list.map((t) => ({
    id: t.id,
    date: t.date,
    title: t.title,
    titleEn: t.titleEn || undefined,
    description: t.description,
    descriptionEn: t.descriptionEn || undefined,
    isActive: t.isActive,
    isImportant: t.isImportant,
    round: t.round,
  }));
}

export async function addTimelineEvent(data: Partial<TimelineEvent>, adminUser = 'admin'): Promise<TimelineEvent> {
  const created = await prisma.timelineEvent.create({
    data: {
      date: data.date || '',
      title: data.title || 'Sự kiện mới',
      description: data.description || '',
      isActive: data.isActive !== false,
      isImportant: !!data.isImportant,
      round: data.round || 'Vòng loại',
      isDeleted: false,
    },
  });
  await logAdminAction(adminUser, 'CREATE', 'TIMELINE', created.id, created.title, `Thêm mốc lịch trình mới: ${created.title}`);
  return created;
}

export async function updateTimelineEvent(id: string, fields: Partial<TimelineEvent>, adminUser = 'admin'): Promise<TimelineEvent> {
  const updated = await prisma.timelineEvent.update({
    where: { id },
    data: { ...fields },
  });
  await logAdminAction(adminUser, 'UPDATE', 'TIMELINE', id, updated.title, `Cập nhật mốc lịch trình: ${updated.title}`);
  return updated;
}

// Soft delete to Trash
export async function deleteTimelineEvent(id: string, adminUser = 'admin'): Promise<{ success: boolean }> {
  const t = await prisma.timelineEvent.findUnique({ where: { id } });
  await prisma.timelineEvent.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  await logAdminAction(adminUser, 'DELETE_TRASH', 'TIMELINE', id, t?.title || id, 'Chuyển mốc lịch trình vào thùng rác');
  return { success: true };
}

// --- BANNERS (100% MySQL Prisma with Soft Delete) ---
export async function getBanners(): Promise<Banner[]> {
  const list = await prisma.banner.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
  });
  return list.map((b) => ({
    id: b.id,
    title: b.title,
    titleEn: b.titleEn || undefined,
    imageUrl: b.imageUrl,
    link: b.link || '',
    isActive: b.isActive,
  }));
}

export async function addBanner(data: Partial<Banner>, adminUser = 'admin'): Promise<Banner> {
  const created = await prisma.banner.create({
    data: {
      title: data.title || 'Banner mới',
      imageUrl: data.imageUrl || '/uploads/baner.jpg',
      link: data.link || '#',
      isActive: data.isActive !== false,
      isDeleted: false,
    },
  });
  await logAdminAction(adminUser, 'CREATE', 'BANNER', created.id, created.title, `Thêm banner mới: ${created.title}`);
  return created as any;
}

export async function updateBanner(id: string, fields: Partial<Banner>, adminUser = 'admin'): Promise<Banner> {
  const updated = await prisma.banner.update({
    where: { id },
    data: { ...fields },
  });
  await logAdminAction(adminUser, 'UPDATE', 'BANNER', id, updated.title, `Cập nhật banner: ${updated.title}`);
  return updated as any;
}

// Soft delete to Trash
export async function deleteBanner(id: string, adminUser = 'admin'): Promise<{ success: boolean }> {
  const b = await prisma.banner.findUnique({ where: { id } });
  await prisma.banner.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  await logAdminAction(adminUser, 'DELETE_TRASH', 'BANNER', id, b?.title || id, 'Chuyển banner vào thùng rác');
  return { success: true };
}

// --- POSTS / NEWS (100% MySQL Prisma with Soft Delete) ---
export async function getPosts(category?: string, search?: string): Promise<any[]> {
  return await prisma.post.findMany({
    where: {
      isActive: true,
      isDeleted: false,
      ...(category ? { category } : {}),
      ...(search ? { OR: [{ title: { contains: search } }, { summary: { contains: search } }] } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllAdminPosts(): Promise<any[]> {
  return await prisma.post.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addPost(data: any, adminUser = 'admin'): Promise<any> {
  const created = await prisma.post.create({
    data: {
      title: data.title || 'Tin tức mới',
      slug: data.slug || `tin-tuc-${Date.now()}`,
      summary: data.summary || '',
      content: data.content || '',
      thumbnailUrl: data.thumbnailUrl || '/images/site-logo.png',
      category: data.category || 'Tin tức',
      isActive: data.isActive !== false,
      isDeleted: false,
    },
  });
  await logAdminAction(adminUser, 'CREATE', 'POST', created.id, created.title, `Tạo bài viết mới: ${created.title}`);
  return created;
}

export async function updatePost(id: string, fields: any, adminUser = 'admin'): Promise<any> {
  const updated = await prisma.post.update({
    where: { id },
    data: { ...fields },
  });
  await logAdminAction(adminUser, 'UPDATE', 'POST', id, updated.title, `Cập nhật bài viết: ${updated.title}`);
  return updated;
}

// Soft delete to Trash
export async function deletePost(id: string, adminUser = 'admin'): Promise<{ success: boolean }> {
  const p = await prisma.post.findUnique({ where: { id } });
  await prisma.post.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  await logAdminAction(adminUser, 'DELETE_TRASH', 'POST', id, p?.title || id, 'Chuyển bài viết vào thùng rác');
  return { success: true };
}

export const getAdminPosts = getAllAdminPosts;
export const createPost = addPost;

export async function bulkImportBanners(payload: Partial<Banner>[], adminUser = 'admin') {
  let successCount = 0;
  const errors: string[] = [];
  for (const item of payload || []) {
    try { await addBanner(item, adminUser); successCount++; }
    catch (error: any) { errors.push(error.message || 'Không thể thêm banner.'); }
  }
  return { successCount, errors };
}

// --- WEB USERS (100% MySQL Prisma with Soft Delete) ---
export async function getWebUsers(): Promise<WebUser[]> {
  const list = await prisma.webUser.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
  });
  return list as any;
}

export async function addWebUser(data: any) {
  return registerWebUser(data);
}

export async function updateWebUser(id: string, data: any) {
  const clean = { ...data };
  if (clean.password) { clean.passwordHash = await bcrypt.hash(clean.password, 10); delete clean.password; }
  delete clean.id;
  const updated = await prisma.webUser.update({ where: { id }, data: clean });
  await logAdminAction('admin', 'UPDATE', 'WEB_USER', id, updated.email, 'Cập nhật tài khoản người dùng');
  return publicWebUser(updated);
}

export async function deleteWebUser(id: string) {
  const updated = await prisma.webUser.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
  await logAdminAction('admin', 'DELETE_TRASH', 'WEB_USER', id, updated.email, 'Chuyển tài khoản vào thùng rác');
  return { success: true };
}

export async function registerWebUser(data: { fullName: string; email: string; phone?: string; password?: string; provider?: string }): Promise<WebUser> {
  const email = normalizeEmail(data.email);
  const existing = await prisma.webUser.findUnique({ where: { email } });
  if (existing) throw new Error('Email này đã được đăng ký tài khoản.');

  const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;
  const user = await prisma.webUser.create({
    data: {
      fullName: data.fullName,
      email,
      phone: data.phone || null,
      passwordHash,
      provider: data.provider || 'email',
      role: 'USER',
      status: 'ACTIVE',
      isDeleted: false,
    },
  });
  return user as any;
}

export async function registerWebUserWithSession(data: { fullName: string; email: string; phone?: string; password?: string; provider?: string }) {
  const user = await registerWebUser(data);
  return { ok: true, user: publicWebUser(user), token: generateWebToken(user.id) };
}

export async function authenticateWebUser(email: string, pass: string): Promise<WebUser | null> {
  const norm = normalizeEmail(email);
  const user = await prisma.webUser.findUnique({ where: { email: norm } });
  if (!user || !user.passwordHash || user.isDeleted) return null;

  const valid = await bcrypt.compare(pass, user.passwordHash);
  if (!valid) return null;
  return user as any;
}

function publicWebUser(user: any) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function loginWebUser(email: string, password: string) {
  const user = await authenticateWebUser(email, password);
  if (!user) throw new Error('Email hoặc mật khẩu không chính xác.');
  const updated = await prisma.webUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { ok: true, user: publicWebUser(updated), token: generateWebToken(updated.id) };
}

export async function quickRegisterWebUser(data: any) {
  const user = await registerWebUser({ ...data, provider: 'quick', password: data.password || undefined });
  return { ok: true, user: publicWebUser(user), token: generateWebToken(user.id) };
}

export async function googleLogin(data: any) {
  if (!data?.accessToken) throw new Error('Thiếu token Google.');
  const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(data.accessToken)}`);
  if (!response.ok) throw new Error('Token Google không hợp lệ.');
  const profile = await response.json();
  if (!profile.email) throw new Error('Google không trả về email tài khoản.');
  const email = normalizeEmail(profile.email);
  const user = await prisma.webUser.upsert({
    where: { email },
    update: { fullName: profile.name || undefined, lastLoginAt: new Date(), provider: 'google' },
    create: { fullName: profile.name || email, email, phone: data.phone || null, provider: 'google', role: 'USER', status: 'ACTIVE', isDeleted: false },
  });
  return { ok: true, user: publicWebUser(user), token: generateWebToken(user.id) };
}

export async function getVotePackages(): Promise<VotePackage[]> {
  const settings = await getSettings();
  return settings.votePackages || [{ id: 'free-daily', code: 'FREE', name: 'Bình chọn miễn phí', points: 1, price: 0, currency: 'VND', vatRate: 0, packageType: 'FREE', isActive: true }];
}

export async function getFreeVoteQuota(userId: string) {
  const user = await prisma.webUser.findUnique({ where: { id: userId } });
  if (!user) return { remaining: 0, limit: 0 };
  const settings = await getSettings();
  const limit = Math.max(0, settings.freeVotesPerAccountPerDay || 2);
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const identifiers = [user.id, user.email, user.phone].filter(Boolean) as string[];
  const used = await prisma.voteRecord.count({ where: { voterPhone: { in: identifiers }, voteTime: { gte: start }, transactionId: null } });
  return { remaining: Math.max(0, limit - used), limit };
}

export async function requestPasswordReset(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const genericResponse = { success: true, message: 'Nếu email tồn tại, mã khôi phục đã được gửi.' };
  const user = await prisma.webUser.findUnique({ where: { email } });
  if (!user || user.isDeleted || user.provider !== 'email' || !user.passwordHash) return genericResponse;

  await prisma.passwordResetCode.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  await prisma.passwordResetCode.create({
    data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });
  await sendPasswordResetCode(email, code);
  await logAdminAction('system', 'PASSWORD_RESET_REQUEST', 'WEB_USER', user.id, user.email, 'Yêu cầu khôi phục mật khẩu');
  return genericResponse;
}

export async function confirmPasswordReset(emailInput: string, code: string, newPassword: string) {
  const email = normalizeEmail(emailInput);
  if (!/^\d{6}$/.test(code)) throw new Error('Mã xác thực không hợp lệ.');
  if (!newPassword || newPassword.length < 6) throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
  const user = await prisma.webUser.findUnique({ where: { email } });
  if (!user || user.isDeleted) throw new Error('Mã xác thực không hợp lệ hoặc đã hết hạn.');
  const reset = await prisma.passwordResetCode.findFirst({ where: { userId: user.id, usedAt: null }, orderBy: { createdAt: 'desc' } });
  if (!reset || reset.expiresAt < new Date() || reset.attempts >= 5) throw new Error('Mã xác thực không hợp lệ hoặc đã hết hạn.');
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  if (codeHash !== reset.codeHash) {
    await prisma.passwordResetCode.update({ where: { id: reset.id }, data: { attempts: { increment: 1 } } });
    throw new Error('Mã xác thực không đúng.');
  }
  await prisma.$transaction([
    prisma.webUser.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 10), provider: 'email' } }),
    prisma.passwordResetCode.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
  ]);
  await logAdminAction('system', 'PASSWORD_RESET_SUCCESS', 'WEB_USER', user.id, user.email, 'Đặt lại mật khẩu thành công');
  return { success: true, message: 'Đặt lại mật khẩu thành công.' };
}

// --- VOTE LOGS (100% MySQL Prisma) ---
export async function getVoteLogs(): Promise<any[]> {
  const votes = await prisma.voteRecord.findMany({
    orderBy: { voteTime: 'desc' },
    take: 500,
  });
  const candidates = await prisma.candidate.findMany();
  const candMap = new Map(candidates.map((c) => [c.id, c]));

  return votes.map((v) => {
    const cand = candMap.get(v.candidateId);
    return {
      id: v.id,
      voterPhone: v.voterPhone,
      candidateId: v.candidateId,
      candidateSbd: cand ? cand.sbd : 'Chưa rõ',
      candidateName: cand ? cand.name : 'Thí sinh',
      voteTime: v.voteTime.toISOString(),
      transactionId: v.transactionId,
    };
  });
}

export async function deleteVoteLog(id: string) {
  await prisma.voteRecord.delete({ where: { id } });
  return { success: true };
}

export async function deleteVoteLogsBulk(ids: string[]) {
  const result = await prisma.voteRecord.deleteMany({ where: { id: { in: ids } } });
  return { success: true, count: result.count };
}

export async function resetVotes() {
  await prisma.$transaction([
    prisma.voteRecord.deleteMany(),
    prisma.candidate.updateMany({ data: { votes: 0 } }),
  ]);
  await logAdminAction('admin', 'RESET_VOTES', 'VOTE', undefined, undefined, 'Đã reset toàn bộ lượt bình chọn');
  return { success: true };
}

export async function getPostBySlugOrId(slugOrId: string) {
  return prisma.post.findFirst({ where: { OR: [{ slug: slugOrId }, { id: slugOrId }], isActive: true, isDeleted: false } });
}

// --- TRASH SYSTEM (RECYCLE BIN) ---
export interface TrashItem {
  id: string;
  type: 'CANDIDATE' | 'SPONSOR' | 'BANNER' | 'TIMELINE' | 'POST' | 'USER';
  typeName: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  deletedAt: string;
  daysRemaining: number;
}

export async function getTrashItems(typeFilter?: string): Promise<TrashItem[]> {
  // Auto-purge items older than 30 days
  await autoPurgeOldTrash(30);

  const trashList: TrashItem[] = [];
  const now = Date.now();

  const calcDaysRemaining = (deletedAt: Date | null) => {
    if (!deletedAt) return 30;
    const elapsedDays = Math.floor((now - new Date(deletedAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - elapsedDays);
  };

  if (!typeFilter || typeFilter === 'ALL' || typeFilter === 'CANDIDATE') {
    const candidates = await prisma.candidate.findMany({ where: { isDeleted: true }, orderBy: { deletedAt: 'desc' } });
    candidates.forEach((c) => {
      trashList.push({
        id: c.id,
        type: 'CANDIDATE',
        typeName: 'Thí sinh',
        title: `${c.sbd} - ${c.name}`,
        subtitle: c.representativeSchool || c.contestTableLabel || c.description,
        imageUrl: c.imageUrl,
        deletedAt: c.deletedAt ? c.deletedAt.toISOString() : new Date().toISOString(),
        daysRemaining: calcDaysRemaining(c.deletedAt),
      });
    });
  }

  if (!typeFilter || typeFilter === 'ALL' || typeFilter === 'SPONSOR') {
    const sponsors = await prisma.sponsor.findMany({ where: { isDeleted: true }, orderBy: { deletedAt: 'desc' } });
    sponsors.forEach((s) => {
      trashList.push({
        id: s.id,
        type: 'SPONSOR',
        typeName: 'Nhà tài trợ',
        title: s.name,
        subtitle: `Hạng: ${s.tier}`,
        imageUrl: s.logoUrl,
        deletedAt: s.deletedAt ? s.deletedAt.toISOString() : new Date().toISOString(),
        daysRemaining: calcDaysRemaining(s.deletedAt),
      });
    });
  }

  if (!typeFilter || typeFilter === 'ALL' || typeFilter === 'BANNER') {
    const banners = await prisma.banner.findMany({ where: { isDeleted: true }, orderBy: { deletedAt: 'desc' } });
    banners.forEach((b) => {
      trashList.push({
        id: b.id,
        type: 'BANNER',
        typeName: 'Banner',
        title: b.title,
        subtitle: b.link || '',
        imageUrl: b.imageUrl,
        deletedAt: b.deletedAt ? b.deletedAt.toISOString() : new Date().toISOString(),
        daysRemaining: calcDaysRemaining(b.deletedAt),
      });
    });
  }

  if (!typeFilter || typeFilter === 'ALL' || typeFilter === 'TIMELINE') {
    const timeline = await prisma.timelineEvent.findMany({ where: { isDeleted: true }, orderBy: { deletedAt: 'desc' } });
    timeline.forEach((t) => {
      trashList.push({
        id: t.id,
        type: 'TIMELINE',
        typeName: 'Lịch trình',
        title: t.title,
        subtitle: `${t.round} - ${t.date}`,
        deletedAt: t.deletedAt ? t.deletedAt.toISOString() : new Date().toISOString(),
        daysRemaining: calcDaysRemaining(t.deletedAt),
      });
    });
  }

  if (!typeFilter || typeFilter === 'ALL' || typeFilter === 'POST') {
    const posts = await prisma.post.findMany({ where: { isDeleted: true }, orderBy: { deletedAt: 'desc' } });
    posts.forEach((p) => {
      trashList.push({
        id: p.id,
        type: 'POST',
        typeName: 'Tin tức',
        title: p.title,
        subtitle: p.category,
        imageUrl: p.thumbnailUrl || undefined,
        deletedAt: p.deletedAt ? p.deletedAt.toISOString() : new Date().toISOString(),
        daysRemaining: calcDaysRemaining(p.deletedAt),
      });
    });
  }

  if (!typeFilter || typeFilter === 'ALL' || typeFilter === 'USER') {
    const users = await prisma.webUser.findMany({ where: { isDeleted: true }, orderBy: { deletedAt: 'desc' } });
    users.forEach((u) => {
      trashList.push({
        id: u.id,
        type: 'USER',
        typeName: 'Tài khoản',
        title: u.fullName,
        subtitle: u.email,
        deletedAt: u.deletedAt ? u.deletedAt.toISOString() : new Date().toISOString(),
        daysRemaining: calcDaysRemaining(u.deletedAt),
      });
    });
  }

  return trashList.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
}

export async function restoreTrashItem(type: string, id: string, adminUser = 'admin') {
  switch (type.toUpperCase()) {
    case 'CANDIDATE': {
      const c = await prisma.candidate.update({ where: { id }, data: { isDeleted: false, deletedAt: null } });
      await logAdminAction(adminUser, 'RESTORE', 'CANDIDATE', id, c.name, 'Khôi phục hồ sơ thí sinh từ thùng rác');
      break;
    }
    case 'SPONSOR': {
      const s = await prisma.sponsor.update({ where: { id }, data: { isDeleted: false, deletedAt: null } });
      await logAdminAction(adminUser, 'RESTORE', 'SPONSOR', id, s.name, 'Khôi phục nhà tài trợ từ thùng rác');
      break;
    }
    case 'BANNER': {
      const b = await prisma.banner.update({ where: { id }, data: { isDeleted: false, deletedAt: null } });
      await logAdminAction(adminUser, 'RESTORE', 'BANNER', id, b.title, 'Khôi phục banner từ thùng rác');
      break;
    }
    case 'TIMELINE': {
      const t = await prisma.timelineEvent.update({ where: { id }, data: { isDeleted: false, deletedAt: null } });
      await logAdminAction(adminUser, 'RESTORE', 'TIMELINE', id, t.title, 'Khôi phục mốc lịch trình từ thùng rác');
      break;
    }
    case 'POST': {
      const p = await prisma.post.update({ where: { id }, data: { isDeleted: false, deletedAt: null } });
      await logAdminAction(adminUser, 'RESTORE', 'POST', id, p.title, 'Khôi phục bài viết từ thùng rác');
      break;
    }
    case 'USER': {
      const u = await prisma.webUser.update({ where: { id }, data: { isDeleted: false, deletedAt: null } });
      await logAdminAction(adminUser, 'RESTORE', 'USER', id, u.fullName, 'Khôi phục tài khoản người dùng từ thùng rác');
      break;
    }
    default:
      throw new Error(`Loại dữ liệu không hợp lệ: ${type}`);
  }
  return { success: true };
}

export async function permanentDeleteTrashItem(type: string, id: string, adminUser = 'admin') {
  switch (type.toUpperCase()) {
    case 'CANDIDATE':
      await prisma.candidate.delete({ where: { id } });
      await logAdminAction(adminUser, 'PERMANENT_DELETE', 'CANDIDATE', id, undefined, 'Xóa vĩnh viễn thí sinh khỏi hệ thống');
      break;
    case 'SPONSOR':
      await prisma.sponsor.delete({ where: { id } });
      await logAdminAction(adminUser, 'PERMANENT_DELETE', 'SPONSOR', id, undefined, 'Xóa vĩnh viễn nhà tài trợ khỏi hệ thống');
      break;
    case 'BANNER':
      await prisma.banner.delete({ where: { id } });
      await logAdminAction(adminUser, 'PERMANENT_DELETE', 'BANNER', id, undefined, 'Xóa vĩnh viễn banner khỏi hệ thống');
      break;
    case 'TIMELINE':
      await prisma.timelineEvent.delete({ where: { id } });
      await logAdminAction(adminUser, 'PERMANENT_DELETE', 'TIMELINE', id, undefined, 'Xóa vĩnh viễn mốc thời gian khỏi hệ thống');
      break;
    case 'POST':
      await prisma.post.delete({ where: { id } });
      await logAdminAction(adminUser, 'PERMANENT_DELETE', 'POST', id, undefined, 'Xóa vĩnh viễn bài viết tin tức khỏi hệ thống');
      break;
    case 'USER':
      await prisma.webUser.delete({ where: { id } });
      await logAdminAction(adminUser, 'PERMANENT_DELETE', 'USER', id, undefined, 'Xóa vĩnh viễn người dùng khỏi hệ thống');
      break;
    default:
      throw new Error(`Loại dữ liệu không hợp lệ: ${type}`);
  }
  return { success: true };
}

export async function emptyTrash(typeFilter?: string, adminUser = 'admin') {
  const items = await getTrashItems(typeFilter);
  for (const item of items) {
    try {
      await permanentDeleteTrashItem(item.type, item.id, adminUser);
    } catch (e) {
      console.error(`Error deleting item ${item.type} ${item.id}:`, e);
    }
  }
  await logAdminAction(adminUser, 'EMPTY_TRASH', 'TRASH', undefined, undefined, `Dọn sạch ${items.length} mục trong thùng rác (${typeFilter || 'ALL'})`);
  return { success: true, count: items.length };
}

export async function autoPurgeOldTrash(olderThanDays = 30) {
  try {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    await prisma.candidate.deleteMany({ where: { isDeleted: true, deletedAt: { lte: cutoffDate } } });
    await prisma.sponsor.deleteMany({ where: { isDeleted: true, deletedAt: { lte: cutoffDate } } });
    await prisma.banner.deleteMany({ where: { isDeleted: true, deletedAt: { lte: cutoffDate } } });
    await prisma.timelineEvent.deleteMany({ where: { isDeleted: true, deletedAt: { lte: cutoffDate } } });
    await prisma.post.deleteMany({ where: { isDeleted: true, deletedAt: { lte: cutoffDate } } });
    await prisma.webUser.deleteMany({ where: { isDeleted: true, deletedAt: { lte: cutoffDate } } });
  } catch (e) {
    console.error('Auto purge error:', e);
  }
}

export const getAdminVoteLogs = getVoteLogs;
export const getPublicPosts = getPosts;
