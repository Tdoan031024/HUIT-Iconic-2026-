export interface SamplePost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnailUrl: string;
  category: string;
  views: number;
  createdAt: string;
  isActive?: boolean;
}

// Set to empty array to remove mock data and rely fully on dynamic data from database
export const SAMPLE_NEWS_POSTS: SamplePost[] = [];
