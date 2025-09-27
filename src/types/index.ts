export interface ProductHuntPost {
  id: number;
  name: string;
  tagline: string;
  description: string;
  votes_count: number;
  comments_count: number;
  created_at: string;
  thumbnail: {
    image_url: string;
  };
  user: {
    name: string;
    username: string;
  };
  topics: Array<{
    name: string;
  }>;
}

export interface HackerNewsPost {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
  type: string;
}

export interface SaaSHubAlternative {
  id: string;
  name: string;
  description: string;
  website_url: string;
  logo_url: string;
  pricing: string;
  category: string;
  features: string[];
  pros: string[];
  cons: string[];
  rating: number;
  reviews_count: number;
}

export interface FilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  category?: string;
  minVotes?: number;
  sortBy?: 'votes' | 'date' | 'comments';
  sortOrder?: 'asc' | 'desc';
}
