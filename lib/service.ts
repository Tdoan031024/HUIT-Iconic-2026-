import prisma from './prisma';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Candidate, Sponsor, TimelineEvent, Banner, VotePackage, WebUser, SystemSettings } from './types';
import { hashPasswordMd5, isMd5Hash, normalizeEmail, generateWebToken, extractWebUserFromToken } from './auth';

const DB_FILE_PATH = path.resolve(process.cwd(), 'contest_voting_db.json');

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

function readLocalDb(): any {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading contest_voting_db.json:', e);
  }
  return {};
}

function writeLocalDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing contest_voting_db.json:', e);
  }
}

// --- SETTINGS ---
export function getSettings(): SystemSettings {
  const dbData = readLocalDb();
  return { ...DEFAULT_SETTINGS, ...(dbData.settings || {}) };
}

export function getPublicSettings(): Partial<SystemSettings> {
  const full = getSettings();
  const { sepayApiKey, ...publicSettings } = full as any;
  return publicSettings;
}

export function updateSettings(updatedFields: Partial<SystemSettings>): SystemSettings {
  const dbData = readLocalDb();
  const currentSettings = dbData.settings || {};
  const newSettings = { ...DEFAULT_SETTINGS, ...currentSettings, ...updatedFields };
  dbData.settings = newSettings;
  writeLocalDb(dbData);
  return newSettings;
}

// --- ADMIN AUTH ---
export async function validateAdminCredentials(username: string, password: string) {
  const admin = await prisma.adminUser.findFirst({
    where: { username, isActive: true },
  });

  if (!admin) {
    // Check fallback default admin accounts
    if (
      (username === 'Iconic2026.Huitmedia' && password === 'Huit@media2019') ||
      (username === 'admin' && password === 'admin123')
    ) {
      return { id: 'admin-iconic', username: username, role: 'SUPER_ADMIN' };
    }
    return null;
  }

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
  return { success: true };
}

// --- CANDIDATES ---
export async function getCandidates(): Promise<Candidate[]> {
  try {
    const list = await prisma.candidate.findMany({
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
  } catch (e) {
    // Fallback to JSON DB
    const dbData = readLocalDb();
    return dbData.candidates || [];
  }
}

export async function getCandidateBySbd(sbd: string): Promise<Candidate> {
  const candidates = await getCandidates();
  const candidate = candidates.find((c) => c.sbd === sbd || c.id === sbd);
  if (!candidate) throw new Error('Không tìm thấy thí sinh.');
  return candidate;
}

export async function getCandidateVotes(sbd: string) {
  const candidate = await getCandidateBySbd(sbd);
  try {
    const records = await prisma.voteRecord.findMany({
      where: { candidateId: candidate.id },
      orderBy: { voteTime: 'desc' },
    });
    return records;
  } catch (e) {
    const dbData = readLocalDb();
    const history = dbData.voteHistory || [];
    return history.filter((v: any) => v.candidateId === candidate.id || v.candidateSbd === candidate.sbd);
  }
}

export async function voteCandidate(sbd: string, body: any, authHeader?: string) {
  const candidate = await getCandidateBySbd(sbd);
  const newVotes = candidate.votes + (body.points || 1);

  try {
    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data: { votes: newVotes },
    });
    await prisma.voteRecord.create({
      data: {
        candidateId: candidate.id,
        voterPhone: body.voterPhone || body.userId || 'GUEST',
        transactionId: body.transactionId,
      },
    });
    return { success: true, candidate: { ...candidate, votes: updated.votes } };
  } catch (e) {
    const dbData = readLocalDb();
    const cand = (dbData.candidates || []).find((c: any) => c.sbd === sbd || c.id === sbd);
    if (cand) {
      cand.votes = (cand.votes || 0) + (body.points || 1);
      writeLocalDb(dbData);
    }
    return { success: true, candidate: { ...candidate, votes: cand ? cand.votes : newVotes } };
  }
}

export async function addCandidate(data: Partial<Candidate>): Promise<Candidate> {
  const sbd = data.sbd || `SBD-${Date.now()}`;
  try {
    const created = await prisma.candidate.create({
      data: {
        sbd,
        name: data.name || 'Thí sinh mới',
        votes: data.votes || 0,
        imageUrl: data.imageUrl || '/duan/anhmauduan.png',
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
      },
    });
    return created as any;
  } catch (e) {
    const dbData = readLocalDb();
    const newCand = { id: `c-${Date.now()}`, sbd, name: data.name || 'Thí sinh', votes: 0, imageUrl: data.imageUrl || '/duan/anhmauduan.png', description: data.description || '', ...data };
    dbData.candidates = [...(dbData.candidates || []), newCand];
    writeLocalDb(dbData);
    return newCand as any;
  }
}

export async function bulkImportCandidates(payload: Partial<Candidate>[]): Promise<{ successCount: number; errors: string[] }> {
  let successCount = 0;
  const errors: string[] = [];
  for (const item of payload) {
    try {
      await addCandidate(item);
      successCount++;
    } catch (err: any) {
      errors.push(`Lỗi import [${item.sbd || item.name}]: ${err.message}`);
    }
  }
  return { successCount, errors };
}

export async function updateCandidate(id: string, fields: Partial<Candidate>): Promise<Candidate> {
  try {
    const updated = await prisma.candidate.update({
      where: { id },
      data: { ...fields } as any,
    });
    return updated as any;
  } catch (e) {
    const dbData = readLocalDb();
    const cand = (dbData.candidates || []).find((c: any) => c.id === id || c.sbd === id);
    if (cand) {
      Object.assign(cand, fields);
      writeLocalDb(dbData);
      return cand;
    }
    throw new Error('Không tìm thấy thí sinh.');
  }
}

export async function deleteCandidate(id: string): Promise<{ success: boolean }> {
  try {
    await prisma.candidate.delete({ where: { id } });
  } catch (e) {
    const dbData = readLocalDb();
    dbData.candidates = (dbData.candidates || []).filter((c: any) => c.id !== id && c.sbd !== id);
    writeLocalDb(dbData);
  }
  return { success: true };
}

// --- SPONSORS ---
export async function getSponsors(): Promise<Sponsor[]> {
  try {
    const list = await prisma.sponsor.findMany({ orderBy: { createdAt: 'desc' } });
    return list.map((s) => ({
      id: s.id,
      name: s.name,
      logoUrl: s.logoUrl,
      tier: s.tier as any,
      description: s.description || undefined,
      websiteUrl: s.websiteUrl || undefined,
      email: s.email || undefined,
      phone: s.phone || undefined,
      contactPerson: s.contactPerson || undefined,
    }));
  } catch (e) {
    const dbData = readLocalDb();
    return dbData.sponsors || [];
  }
}

export async function addSponsor(data: Partial<Sponsor>): Promise<Sponsor> {
  try {
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
      },
    });
    return created as any;
  } catch (e) {
    const dbData = readLocalDb();
    const newSp = { id: `s-${Date.now()}`, name: data.name || 'Nhà tài trợ', logoUrl: data.logoUrl || '/images/site-logo.png', tier: data.tier || 'PARTNER', ...data };
    dbData.sponsors = [...(dbData.sponsors || []), newSp];
    writeLocalDb(dbData);
    return newSp as any;
  }
}

export async function updateSponsor(id: string, fields: Partial<Sponsor>): Promise<Sponsor> {
  try {
    const updated = await prisma.sponsor.update({
      where: { id },
      data: { ...fields } as any,
    });
    return updated as any;
  } catch (e) {
    const dbData = readLocalDb();
    const item = (dbData.sponsors || []).find((s: any) => s.id === id);
    if (item) {
      Object.assign(item, fields);
      writeLocalDb(dbData);
      return item;
    }
    throw new Error('Không tìm thấy nhà tài trợ.');
  }
}

export async function deleteSponsor(id: string): Promise<{ success: boolean }> {
  try {
    await prisma.sponsor.delete({ where: { id } });
  } catch (e) {
    const dbData = readLocalDb();
    dbData.sponsors = (dbData.sponsors || []).filter((s: any) => s.id !== id);
    writeLocalDb(dbData);
  }
  return { success: true };
}

// --- TIMELINE ---
export async function getTimeline(): Promise<TimelineEvent[]> {
  try {
    const list = await prisma.timelineEvent.findMany({ orderBy: { createdAt: 'asc' } });
    return list.map((t) => ({
      id: t.id,
      date: t.date,
      title: t.title,
      description: t.description,
      isActive: t.isActive,
      isImportant: t.isImportant,
      round: t.round,
    }));
  } catch (e) {
    const dbData = readLocalDb();
    return dbData.timeline || [];
  }
}

export async function addTimelineEvent(data: Partial<TimelineEvent>): Promise<TimelineEvent> {
  try {
    const created = await prisma.timelineEvent.create({
      data: {
        date: data.date || '',
        title: data.title || '',
        description: data.description || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        isImportant: data.isImportant || false,
        round: data.round || 'Vòng loại',
      },
    });
    return created as any;
  } catch (e) {
    const dbData = readLocalDb();
    const newTl = { id: `t-${Date.now()}`, date: data.date || '', title: data.title || '', description: data.description || '', isActive: true, ...data };
    dbData.timeline = [...(dbData.timeline || []), newTl];
    writeLocalDb(dbData);
    return newTl as any;
  }
}

export async function updateTimelineEvent(id: string, fields: Partial<TimelineEvent>): Promise<TimelineEvent> {
  try {
    const updated = await prisma.timelineEvent.update({
      where: { id },
      data: { ...fields } as any,
    });
    return updated as any;
  } catch (e) {
    const dbData = readLocalDb();
    const item = (dbData.timeline || []).find((t: any) => t.id === id);
    if (item) {
      Object.assign(item, fields);
      writeLocalDb(dbData);
      return item;
    }
    throw new Error('Không tìm thấy mốc thời gian.');
  }
}

export async function deleteTimelineEvent(id: string): Promise<{ success: boolean }> {
  try {
    await prisma.timelineEvent.delete({ where: { id } });
  } catch (e) {
    const dbData = readLocalDb();
    dbData.timeline = (dbData.timeline || []).filter((t: any) => t.id !== id);
    writeLocalDb(dbData);
  }
  return { success: true };
}

// --- BANNERS ---
export async function getBanners(): Promise<Banner[]> {
  try {
    const list = await prisma.banner.findMany({ orderBy: { createdAt: 'desc' } });
    return list.map((b) => ({
      id: b.id,
      title: b.title,
      imageUrl: b.imageUrl,
      link: b.link || undefined,
      isActive: b.isActive,
    }));
  } catch (e) {
    const dbData = readLocalDb();
    return dbData.banners || [];
  }
}

export async function addBanner(data: Partial<Banner>): Promise<Banner> {
  try {
    const created = await prisma.banner.create({
      data: {
        title: data.title || '',
        imageUrl: data.imageUrl || '',
        link: data.link,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return created as any;
  } catch (e) {
    const dbData = readLocalDb();
    const newBn = { id: `b-${Date.now()}`, title: data.title || '', imageUrl: data.imageUrl || '', isActive: true, ...data };
    dbData.banners = [...(dbData.banners || []), newBn];
    writeLocalDb(dbData);
    return newBn as any;
  }
}

export async function bulkImportBanners(payload: Partial<Banner>[]): Promise<{ successCount: number; errors: string[] }> {
  let successCount = 0;
  const errors: string[] = [];
  for (const item of payload) {
    try {
      await addBanner(item);
      successCount++;
    } catch (err: any) {
      errors.push(`Lỗi import banner [${item.title}]: ${err.message}`);
    }
  }
  return { successCount, errors };
}

export async function updateBanner(id: string, fields: Partial<Banner>): Promise<Banner> {
  try {
    const updated = await prisma.banner.update({
      where: { id },
      data: { ...fields } as any,
    });
    return updated as any;
  } catch (e) {
    const dbData = readLocalDb();
    const item = (dbData.banners || []).find((b: any) => b.id === id);
    if (item) {
      Object.assign(item, fields);
      writeLocalDb(dbData);
      return item;
    }
    throw new Error('Không tìm thấy banner.');
  }
}

export async function deleteBanner(id: string): Promise<{ success: boolean }> {
  try {
    await prisma.banner.delete({ where: { id } });
  } catch (e) {
    const dbData = readLocalDb();
    dbData.banners = (dbData.banners || []).filter((b: any) => b.id !== id);
    writeLocalDb(dbData);
  }
  return { success: true };
}

// --- POSTS / NEWS ---
export async function getPublicPosts(category?: string, search?: string) {
  try {
    const whereClause: any = { isActive: true };
    if (category) whereClause.category = category;
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ];
    }
    return await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    return [];
  }
}

export async function getPostBySlugOrId(slugOrId: string) {
  try {
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
        isActive: true,
      },
    });
    if (post) {
      await prisma.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });
    }
    return post;
  } catch (e) {
    return null;
  }
}

export async function getAdminPosts() {
  try {
    return await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (e) {
    return [];
  }
}

export async function createPost(data: any) {
  const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${Date.now()}`;
  return prisma.post.create({
    data: {
      title: data.title,
      slug,
      summary: data.summary,
      content: data.content || '',
      thumbnailUrl: data.thumbnailUrl,
      category: data.category || 'Tin tức',
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

export async function updatePost(id: string, data: any) {
  return prisma.post.update({
    where: { id },
    data,
  });
}

export async function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}

// --- WEB USERS & AUTH ---
export async function registerWebUser(payload: any) {
  const email = normalizeEmail(payload.email);
  const passwordHash = await bcrypt.hash(payload.password, 10);
  try {
    const user = await prisma.webUser.create({
      data: {
        fullName: payload.fullName || 'Người dùng',
        email,
        phone: payload.phone,
        passwordHash,
        provider: 'email',
        role: 'USER',
        status: 'ACTIVE',
        schoolOrCompany: payload.schoolOrCompany,
        contestTable: payload.contestTable,
      },
    });
    const token = generateWebToken(user.id);
    return { ok: true, user: user as any, token };
  } catch (e) {
    const dbData = readLocalDb();
    const newUser = { id: `u-${Date.now()}`, fullName: payload.fullName || 'User', email, phone: payload.phone, provider: 'email', role: 'USER', status: 'ACTIVE', ...payload };
    dbData.webUsers = [...(dbData.webUsers || []), newUser];
    writeLocalDb(dbData);
    const token = generateWebToken(newUser.id);
    return { ok: true, user: newUser as any, token };
  }
}

export async function quickRegisterWebUser(payload: any) {
  return registerWebUser({ ...payload, password: payload.password || 'QuickPass123!' });
}

export async function loginWebUser(email: string, password: string) {
  const normalized = normalizeEmail(email);
  try {
    const user = await prisma.webUser.findUnique({ where: { email: normalized } });
    if (!user) throw new Error('Email hoặc mật khẩu không chính xác.');
    let isValid = false;
    if (user.passwordHash) {
      isValid = await bcrypt.compare(password, user.passwordHash);
    }
    if (!isValid) throw new Error('Email hoặc mật khẩu không chính xác.');
    const token = generateWebToken(user.id);
    return { ok: true, user: user as any, token };
  } catch (e: any) {
    throw new Error(e.message || 'Lỗi đăng nhập.');
  }
}

export async function googleLogin(payload: any) {
  const email = normalizeEmail(payload.email);
  try {
    let user = await prisma.webUser.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.webUser.create({
        data: {
          fullName: payload.fullName || 'Người dùng Google',
          email,
          provider: 'google',
          role: 'USER',
          status: 'ACTIVE',
        },
      });
    }
    const token = generateWebToken(user.id);
    return { ok: true, user: user as any, token };
  } catch (e) {
    const dbData = readLocalDb();
    let user = (dbData.webUsers || []).find((u: any) => u.email === email);
    if (!user) {
      user = { id: `gu-${Date.now()}`, fullName: payload.fullName || 'Google User', email, provider: 'google', role: 'USER', status: 'ACTIVE' };
      dbData.webUsers = [...(dbData.webUsers || []), user];
      writeLocalDb(dbData);
    }
    const token = generateWebToken(user.id);
    return { ok: true, user, token };
  }
}

export async function getWebUsers(): Promise<WebUser[]> {
  try {
    const list = await prisma.webUser.findMany({ orderBy: { createdAt: 'desc' } });
    return list as any;
  } catch (e) {
    const dbData = readLocalDb();
    return dbData.webUsers || [];
  }
}

export async function addWebUser(payload: any): Promise<WebUser> {
  return (await registerWebUser(payload)).user;
}

export async function updateWebUser(id: string, payload: any): Promise<WebUser> {
  try {
    const updated = await prisma.webUser.update({
      where: { id },
      data: payload,
    });
    return updated as any;
  } catch (e) {
    const dbData = readLocalDb();
    const user = (dbData.webUsers || []).find((u: any) => u.id === id);
    if (user) {
      Object.assign(user, payload);
      writeLocalDb(dbData);
      return user;
    }
    throw new Error('Không tìm thấy người dùng.');
  }
}

export async function deleteWebUser(id: string): Promise<{ success: boolean }> {
  try {
    await prisma.webUser.delete({ where: { id } });
  } catch (e) {
    const dbData = readLocalDb();
    dbData.webUsers = (dbData.webUsers || []).filter((u: any) => u.id !== id);
    writeLocalDb(dbData);
  }
  return { success: true };
}

// --- STATS & ANALYTICS ---
export async function getDashboardStats() {
  const candidates = await getCandidates();
  const totalVotes = candidates.reduce((acc, c) => acc + (c.votes || 0), 0);
  const sponsors = await getSponsors();
  const webUsers = await getWebUsers();
  let totalPosts = 0;
  try {
    totalPosts = await prisma.post.count();
  } catch (e) {}

  return {
    totalCandidates: candidates.length,
    totalVotes,
    totalSponsors: sponsors.length,
    totalWebUsers: webUsers.length,
    totalUsers: webUsers.length,
    totalPosts,
    candidatesCount: candidates.length,
    sponsorsCount: sponsors.length,
  };
}

export async function recordPageView(body: any, userAgent?: string, ip?: string) {
  try {
    return await prisma.pageView.create({
      data: {
        visitorId: body.visitorId || 'anon',
        path: body.path || '/',
        referrer: body.referrer,
        userAgent,
        ipHash: ip ? crypto.createHash('md5').update(ip).digest('hex') : null,
      },
    });
  } catch (e) {
    return { ok: true };
  }
}

export async function getAnalyticsSummary() {
  try {
    const totalViews = await prisma.pageView.count();
    const uniqueVisitors = await prisma.pageView.groupBy({
      by: ['visitorId'],
      _count: true,
    });
    return {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
    };
  } catch (e) {
    return { totalViews: 0, uniqueVisitors: 0 };
  }
}

// --- VOTES LOGS & MANAGEMENT ---
export async function getAdminVoteLogs() {
  try {
    const logs = await prisma.voteRecord.findMany({
      orderBy: { voteTime: 'desc' },
      take: 200,
    });
    return logs;
  } catch (e) {
    const dbData = readLocalDb();
    return dbData.voteHistory || [];
  }
}

export async function deleteVoteLog(id: string) {
  try {
    await prisma.voteRecord.delete({ where: { id } });
  } catch (e) {
    const dbData = readLocalDb();
    dbData.voteHistory = (dbData.voteHistory || []).filter((v: any) => v.id !== id);
    writeLocalDb(dbData);
  }
  return { success: true };
}

export async function deleteVoteLogsBulk(ids: string[]) {
  try {
    await prisma.voteRecord.deleteMany({ where: { id: { in: ids } } });
  } catch (e) {
    const dbData = readLocalDb();
    dbData.voteHistory = (dbData.voteHistory || []).filter((v: any) => !ids.includes(v.id));
    writeLocalDb(dbData);
  }
  return { success: true };
}

export async function resetVotes() {
  try {
    await prisma.candidate.updateMany({ data: { votes: 0 } });
    await prisma.voteRecord.deleteMany({});
  } catch (e) {
    const dbData = readLocalDb();
    (dbData.candidates || []).forEach((c: any) => (c.votes = 0));
    dbData.voteHistory = [];
    writeLocalDb(dbData);
  }
  return { success: true };
}

export function getVotePackages(): VotePackage[] {
  const dbData = readLocalDb();
  return dbData.votePackages || [
    { id: 'free-5', code: 'FREE_5', name: '5 điểm miễn phí', points: 5, price: 0, currency: 'VND', vatRate: 10, packageType: 'FREE', isActive: true },
    { id: 'vote-10', code: 'PAID_10', name: '10 điểm', points: 10, price: 100, currency: 'VND', vatRate: 10, packageType: 'PAID', isActive: true },
    { id: 'vote-20', code: 'PAID_20', name: '20 điểm', points: 20, price: 2000, currency: 'VND', vatRate: 10, packageType: 'PAID', isActive: true },
  ];
}

export async function getFreeVoteQuota(userId: string) {
  const settings = getSettings();
  const limit = settings.freeVotesPerAccountPerDay || 2;
  return { remaining: limit, limit };
}
