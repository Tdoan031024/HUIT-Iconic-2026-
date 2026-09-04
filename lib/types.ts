export interface Candidate {
  id: string;
  sbd: string;
  name: string;
  votes: number;
  imageUrl: string;
  description: string;
  descriptionEn?: string;
  biography?: string;
  biographyEn?: string;
  detailsUrl?: string;
  contestTable?: 'MALE' | 'FEMALE' | 'HIGH_SCHOOL' | 'STUDENT' | 'ENTERPRISE' | string;
  contestTableLabel?: string;
  faculty?: string;
  className?: string;
  studentId?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | string;
  height?: string | number;
  weight?: string | number;
  heightCm?: number;
  weightKg?: number;
  measurementBust?: number;
  measurementWaist?: number;
  measurementHip?: number;
  measurements?: string;
  talent?: string;
  motto?: string;
  inspirationalMessage?: string;
  videoUrl?: string;
  achievements?: string;
  hobbies?: string;
  sector?: string;
  stage?: string;
  status?: string;
  currentRound?: string;
  teamName?: string;
  representativeSchool?: string;
  leaderName?: string;
  leaderPhone?: string;
  leaderEmail?: string;
  advisorName?: string;
  members?: string;
  supportNeeds?: string;
  expectations?: string;
  implementationLocation?: string;
  intellectualPropertyCommitment?: boolean;
  showcaseImages?: string;
  registrationId?: string;
  source?: 'IMPORT' | 'MANUAL' | 'WEB' | string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'PARTNER';
  description?: string;
  descriptionEn?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
}

export interface Banner {
  id: string;
  title: string;
  titleEn?: string | null;
  imageUrl: string;
  link?: string;
  isActive: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  titleEn?: string | null;
  description: string;
  descriptionEn?: string | null;
  isActive: boolean;
  round?: string;
  isImportant?: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
}

export interface VoteRecord {
  id: string;
  candidateId: string;
  voterPhone: string;
  voteTime: Date;
  transactionId?: string;
  eventId?: string;
  packageId?: string;
  points?: number;
  basePoints?: number;
  multiplierApplied?: number;
  promotionId?: string;
  promotionName?: string;
  voteType?: 'FREE' | 'PAID';
  userId?: string;
  amount?: number;
}

export interface VotingPromotion {
  id: string;
  name: string;
  multiplier: number;
  startAt: string;
  endAt: string;
  isEnabled: boolean;
  appliesTo: 'FREE' | 'PAID' | 'ALL';
  note?: string;
}

export interface WebUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  provider: 'email' | 'google' | 'quick';
  role: 'USER';
  status: 'ACTIVE' | 'LOCKED';
  audienceType?: string;
  faculty?: string;
  studentId?: string;
  schoolOrCompany?: string;
  contestTable?: string;
  registeredAt: string;
  lastLoginAt?: string;
  votedPoints?: number;
}

export interface VotePackage {
  id: string;
  code: string;
  name: string;
  points: number;
  price: number;
  currency: 'VND';
  vatRate: number;
  packageType: 'FREE' | 'PAID';
  isActive: boolean;
}

export interface SystemSettings {
  isGateOpen: boolean;
  startDate: string;
  endDate: string;
  maxVotesPerPhone: number;
  eventTitle: string;
  eventTitleEn?: string;
  organizer: string;
  organizerEn?: string;
  contactEmail: string;
  isMaintenanceMode: boolean;
  headerHuitLogoUrl?: string;
  headerIconicLogoUrl?: string;
  sponsorBannerUrl?: string;
  hideSponsorBanner?: boolean;
  hidePublicVoteHistory?: boolean;
  themeVideoEmbedUrl?: string;
  themeVideoTitle?: string;
  themeVideoTitleEn?: string;
  themeVideoDescription?: string;
  themeVideoDescriptionEn?: string;
  aboutTitle?: string;
  aboutTitleEn?: string;
  aboutDescription?: string;
  aboutDescriptionEn?: string;
  aboutImageUrl?: string;
  statsCandidates?: string;
  statsVotes?: string;
  statsViews?: string;
  statsYear?: string;
  statsParticipants?: string;
  statsMedia?: string;
  statsSchools?: string;
  aboutSubtitle?: string;
  aboutSubtitleEn?: string;
  aboutTheme?: string;
  aboutThemeEn?: string;
  aboutOrganizerDetail?: string;
  aboutOrganizerDetailEn?: string;
  aboutSectors?: string;
  aboutSectorsEn?: string;
  aboutBenefits?: string;
  aboutBenefitsEn?: string;
  aboutParticipants?: string;
  aboutParticipantsEn?: string;
  aboutPrize?: string;
  aboutPrizeEn?: string;
  aboutContactName?: string;
  aboutContactRole?: string;
  aboutContactPhone?: string;
  aboutContactWebsite?: string;
  aboutContactQrUrl?: string;
  isRegistrationOpen?: boolean;
  registrationDeadline?: string;
  registrationUrl?: string;
  detailUrl?: string;
  supportZaloUrl?: string;
  freeVotesPerAccountPerDay?: number;
  guideSections?: Array<{ title: string; content: string; imageUrl?: string }>;
  exchangeRates?: Array<{ points: number; price: number; label: string }>;
  votePackages?: VotePackage[];
  votingPromotions?: VotingPromotion[];
  activeVotingPromotion?: VotingPromotion | null;
  sepayBankName?: string;
  sepayAccountNo?: string;
  sepayAccountName?: string;
  sepayPrefix?: string;
  sepayApiKey?: string;
  isTestMode?: boolean;
  faq?: Array<{ question: string; answer: string }>;
}
