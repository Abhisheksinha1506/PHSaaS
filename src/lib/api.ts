import { ProductHuntPost, HackerNewsPost, SaaSHubAlternative } from '@/types';

// Utility function to test API connectivity
export async function testApiConnectivity(): Promise<{
  productHunt: boolean;
  hackerNews: boolean;
  github: boolean;
}> {
  const results = {
    productHunt: false,
    hackerNews: false,
    github: false
  };

  // Test Product Hunt API
  try {
    const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer 0VaMMCJ2ILdKkpY52GI7utplq83BtbvzKLDVz_YUHE4',
      },
      body: JSON.stringify({
        query: 'query { posts(first: 1) { edges { node { id name } } } }'
      })
    });
    results.productHunt = response.ok;
  } catch (error) {
    console.log('Product Hunt API test failed:', error);
  }

  // Test Hacker News API
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    results.hackerNews = response.ok;
  } catch (error) {
    console.log('Hacker News API test failed:', error);
  }

  // Test GitHub API
  try {
    const response = await fetch('https://api.github.com/search/repositories?q=stars:>1000&per_page=1');
    results.github = response.ok;
  } catch (error) {
    console.log('GitHub API test failed:', error);
  }

  return results;
}

// Product Hunt API - Using direct token authentication with fallback
export async function fetchProductHuntPosts(): Promise<ProductHuntPost[]> {
  try {
    // Use the provided token directly
    const accessToken = '0VaMMCJ2ILdKkpY52GI7utplq83BtbvzKLDVz_YUHE4';

    // Fetch posts with the access token
    const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `
          query {
            posts(first: 50, order: VOTES) {
              edges {
                node {
                  id
                  name
                  tagline
                  description
                  votesCount
                  commentsCount
                  createdAt
                  thumbnail {
                    url
                  }
                  user {
                    name
                    username
                  }
                  topics {
                    edges {
                      node {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        `
      })
    });

    console.log('Product Hunt API response status:', response.status);
    console.log('Product Hunt API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.log('Product Hunt API failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Product Hunt API error response:', errorText);
      console.log('🔄 Falling back to mock data for Product Hunt');
      return getEnhancedMockProductHuntData();
    }

    const data = await response.json();
    console.log('Product Hunt API response data:', data);
    
    if (data.errors) {
      console.log('Product Hunt API errors:', data.errors);
      console.log('🔄 Falling back to mock data for Product Hunt');
      return getEnhancedMockProductHuntData();
    }

    const posts = data.data?.posts?.edges || [];
    
    if (posts.length === 0) {
      console.log('No posts returned from Product Hunt API, using fallback data');
      return getEnhancedMockProductHuntData();
    }

    console.log(`Successfully fetched ${posts.length} Product Hunt posts`);

    return posts.map((edge: { node: Record<string, unknown> }) => ({
      id: edge.node.id as number,
      name: edge.node.name as string,
      tagline: edge.node.tagline as string,
      description: edge.node.description as string,
      votes_count: edge.node.votesCount as number,
      comments_count: edge.node.commentsCount as number,
      created_at: edge.node.createdAt as string,
      thumbnail: {
        image_url: (edge.node.thumbnail as { url?: string })?.url || ''
      },
      user: {
        name: (edge.node.user as { name: string }).name === "[REDACTED]" ? "Anonymous User" : (edge.node.user as { name: string }).name,
        username: (edge.node.user as { username: string }).username === "[REDACTED]" ? "anonymous" : (edge.node.user as { username: string }).username
      },
      topics: (edge.node.topics as { edges: Array<{ node: { name: string } }> })?.edges?.map((topicEdge: { node: { name: string } }) => ({ name: topicEdge.node.name })) || []
    }));
  } catch (error) {
    console.error('Error fetching Product Hunt data:', error);
    console.log('🔄 Falling back to mock data for Product Hunt');
    return getEnhancedMockProductHuntData();
  }
}

// Hacker News API with fallback
export async function fetchHackerNewsPosts(type: 'top' | 'new' | 'show' = 'top'): Promise<HackerNewsPost[]> {
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/${type}stories.json`);
    
    console.log('Hacker News API response status:', response.status);
    
    if (!response.ok) {
      console.log('Hacker News API failed:', response.status, response.statusText);
      console.log('🔄 Falling back to mock data for Hacker News');
      return getMockHackerNewsData();
    }
    
    const storyIds = await response.json();
    console.log('Hacker News story IDs:', storyIds?.length || 0);
    
    if (!Array.isArray(storyIds) || storyIds.length === 0) {
      console.log('No story IDs returned from Hacker News API, using fallback data');
      return getMockHackerNewsData();
    }
    
    const stories = await Promise.all(
      storyIds.slice(0, 50).map(async (id: number) => {
        try {
          const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (!storyResponse.ok) return null;
          return storyResponse.json();
        } catch (error) {
          console.error(`Error fetching story ${id}:`, error);
          return null;
        }
      })
    );

    const validStories = stories.filter(story => story && story.type === 'story');
    console.log('Hacker News valid stories:', validStories.length);
    
    if (validStories.length === 0) {
      console.log('No valid stories returned from Hacker News API, using fallback data');
      return getMockHackerNewsData();
    }

    console.log(`Successfully fetched ${validStories.length} Hacker News stories`);
    return validStories;
  } catch (error) {
    console.error('Error fetching Hacker News data:', error);
    console.log('🔄 Falling back to mock data for Hacker News');
    return getMockHackerNewsData();
  }
}

// SaaSHub API (GitHub implementation with fallback)
export async function fetchSaaSHubAlternatives(category?: string): Promise<SaaSHubAlternative[]> {
  try {
    // Since SaaSHub doesn't have a public API, we'll use GitHub API
    // to get trending open source tools and SaaS alternatives
    const response = await fetch('https://api.github.com/search/repositories?q=stars:>1000+language:javascript+language:typescript+language:python&sort=stars&order=desc&per_page=60');
    
    console.log('GitHub API response status:', response.status);
    
    if (!response.ok) {
      console.log('GitHub API failed:', response.status, response.statusText);
      console.log('🔄 Falling back to mock data for SaaSHub');
      return getMockSaaSHubData(category);
    }

    const data = await response.json();
    const repositories = data.items || [];
    console.log('GitHub repositories:', repositories.length);
    
    if (repositories.length === 0) {
      console.log('No repositories returned from GitHub API, using fallback data');
      return getMockSaaSHubData(category);
    }

    console.log(`Successfully fetched ${repositories.length} GitHub repositories`);

    return repositories.map((repo: any) => ({
      id: repo.id.toString(),
      name: repo.name,
      description: repo.description || 'No description available',
      website_url: repo.html_url,
      logo_url: repo.owner.avatar_url,
      pricing: "Open Source",
      category: "Open Source Tools",
      features: repo.topics || [],
      pros: ["Open Source", "Active Development", "Community Driven"],
      cons: ["Requires Technical Knowledge", "Self-hosted"],
      rating: Math.min(5, (repo.stargazers_count / 1000) * 0.5 + 3), // Convert stars to rating
      reviews_count: repo.stargazers_count
    }));
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    console.log('🔄 Falling back to mock data for SaaSHub');
    return getMockSaaSHubData(category);
  }
}

// Enhanced mock data with more items and time-aware data
function getEnhancedMockProductHuntData(): ProductHuntPost[] {
  const now = new Date();
  const baseTime = now.getTime();
  
  return [
    {
      id: 1,
      name: "AI Code Assistant",
      tagline: "Write better code with AI",
      description: "An intelligent code assistant that helps developers write cleaner, more efficient code.",
      votes_count: 1247,
      comments_count: 89,
      created_at: new Date(baseTime - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      thumbnail: {
        image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop&crop=center"
      },
      user: {
        name: "John Doe",
        username: "johndoe"
      },
      topics: [
        { name: "Developer Tools" },
        { name: "AI" },
        { name: "JavaScript" }
      ]
    },
    {
      id: 2,
      name: "Design System Pro",
      tagline: "Build consistent UIs faster",
      description: "A comprehensive design system with components, guidelines, and tools for modern web development.",
      votes_count: 892,
      comments_count: 67,
      created_at: new Date(baseTime - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      thumbnail: {
        image_url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=300&h=200&fit=crop&crop=center"
      },
      user: {
        name: "Jane Smith",
        username: "janesmith"
      },
      topics: [
        { name: "Design" },
        { name: "UI/UX" },
        { name: "React" }
      ]
    },
    {
      id: 3,
      name: "TaskFlow",
      tagline: "Streamline your workflow",
      description: "A powerful task management tool that helps teams collaborate and stay organized.",
      votes_count: 756,
      comments_count: 43,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      thumbnail: {
        image_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop&crop=center"
      },
      user: {
        name: "Alex Chen",
        username: "alexchen"
      },
      topics: [
        { name: "Productivity" },
        { name: "Collaboration" },
        { name: "Python" }
      ]
    },
    {
      id: 4,
      name: "DataViz Studio",
      tagline: "Create stunning data visualizations",
      description: "Transform your data into beautiful, interactive charts and graphs with ease.",
      votes_count: 634,
      comments_count: 28,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      thumbnail: {
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center"
      },
      user: {
        name: "Sarah Wilson",
        username: "sarahw"
      },
      topics: [
        { name: "Data Visualization" },
        { name: "Analytics" }
      ]
    },
    {
      id: 5,
      name: "CloudSync",
      tagline: "Seamless cloud synchronization",
      description: "Keep your files synchronized across all devices with enterprise-grade security.",
      votes_count: 523,
      comments_count: 35,
      created_at: new Date(Date.now() - 345600000).toISOString(),
      thumbnail: {
        image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=200&fit=crop&crop=center"
      },
      user: {
        name: "Mike Johnson",
        username: "mikej"
      },
      topics: [
        { name: "Cloud Storage" },
        { name: "Security" }
      ]
    },
    {
      id: 6,
      name: "CodeReview AI",
      tagline: "AI-powered code review",
      description: "Automatically review code quality, security, and best practices with advanced AI.",
      votes_count: 445,
      comments_count: 52,
      created_at: new Date(Date.now() - 432000000).toISOString(),
      thumbnail: {
        image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop&crop=center"
      },
      user: {
        name: "David Kim",
        username: "davidk"
      },
      topics: [
        { name: "AI" },
        { name: "Code Quality" }
      ]
    },
    {
      id: 7,
      name: "TeamChat Pro",
      tagline: "Advanced team communication",
      description: "Enhanced team chat with video calls, file sharing, and project management integration.",
      votes_count: 389,
      comments_count: 41,
      created_at: new Date(Date.now() - 518400000).toISOString(),
      thumbnail: {
        image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop&crop=center"
      },
      user: {
        name: "Lisa Brown",
        username: "lisab"
      },
      topics: [
        { name: "Communication" },
        { name: "Team Collaboration" }
      ]
    },
    {
      id: 8,
      name: "Analytics Dashboard",
      tagline: "Real-time business insights",
      description: "Comprehensive analytics dashboard for tracking business metrics and KPIs.",
      votes_count: 312,
      comments_count: 19,
      created_at: new Date(Date.now() - 604800000).toISOString(),
      thumbnail: {
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center"
      },
      user: {
        name: "Tom Wilson",
        username: "tomw"
      },
      topics: [
        { name: "Analytics" },
        { name: "Business Intelligence" }
      ]
    }
  ];
}

// Mock data functions
function getMockProductHuntData(): ProductHuntPost[] {
  return [
    {
      id: 1,
      name: "AI Code Assistant",
      tagline: "Write better code with AI",
      description: "An intelligent code assistant that helps developers write cleaner, more efficient code.",
      votes_count: 1247,
      comments_count: 89,
      created_at: new Date().toISOString(),
      thumbnail: {
        image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop&crop=center"
      },
      user: {
        name: "John Doe",
        username: "johndoe"
      },
      topics: [
        { name: "Developer Tools" },
        { name: "AI" }
      ]
    },
    {
      id: 2,
      name: "Design System Pro",
      tagline: "Build consistent UIs faster",
      description: "A comprehensive design system with components, guidelines, and tools for modern web development.",
      votes_count: 892,
      comments_count: 67,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      thumbnail: {
        image_url: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=300&h=200&fit=crop&crop=center"
      },
      user: {
        name: "Jane Smith",
        username: "janesmith"
      },
      topics: [
        { name: "Design" },
        { name: "UI/UX" }
      ]
    }
  ];
}

function getMockHackerNewsData(): HackerNewsPost[] {
  const now = Math.floor(Date.now() / 1000);
  
  return [
    {
      id: 1,
      title: "Show HN: I built a JavaScript framework for modern web apps",
      url: "https://example.com/javascript-framework",
      score: 256,
      by: "jsdev",
      time: now - 3600, // 1 hour ago
      descendants: 45,
      type: "story"
    },
    {
      id: 2,
      title: "Python 3.12 performance improvements and new features",
      url: "https://example.com/python-3-12",
      score: 189,
      by: "pythonista",
      time: Math.floor(Date.now() / 1000) - 7200,
      descendants: 32,
      type: "story"
    },
    {
      id: 3,
      title: "React 19: What's new in the latest release",
      url: "https://example.com/react-19",
      score: 145,
      by: "reactdev",
      time: Math.floor(Date.now() / 1000) - 10800,
      descendants: 28,
      type: "story"
    },
    {
      id: 4,
      title: "AI and machine learning trends in 2024",
      url: "https://example.com/ai-trends-2024",
      score: 312,
      by: "aiexpert",
      time: Math.floor(Date.now() / 1000) - 14400,
      descendants: 67,
      type: "story"
    },
    {
      id: 5,
      title: "Building scalable APIs with Node.js and TypeScript",
      url: "https://example.com/node-typescript-apis",
      score: 98,
      by: "backenddev",
      time: Math.floor(Date.now() / 1000) - 18000,
      descendants: 19,
      type: "story"
    }
  ];
}

function getMockSaaSHubData(category?: string): SaaSHubAlternative[] {
  const alternatives = [
    {
      id: "1",
      name: "Slack",
      description: "Team communication and collaboration platform",
      website_url: "https://slack.com",
      logo_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center",
      pricing: "Free - $12.50/user/month",
      category: "Communication",
      features: ["Messaging", "File sharing", "Video calls", "Integrations", "JavaScript", "API"],
      pros: ["Easy to use", "Great integrations", "Reliable"],
      cons: ["Can be expensive", "Notification overload"],
      rating: 4.5,
      reviews_count: 1250
    },
    {
      id: "2",
      name: "Microsoft Teams",
      description: "Unified communication and collaboration platform",
      website_url: "https://teams.microsoft.com",
      logo_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center",
      pricing: "Free - $12.50/user/month",
      category: "Communication",
      features: ["Chat", "Video meetings", "File sharing", "Office integration", "Python", "Cloud"],
      pros: ["Office integration", "Good for enterprise", "Comprehensive"],
      cons: ["Complex interface", "Resource intensive"],
      rating: 4.2,
      reviews_count: 980
    },
    {
      id: "3",
      name: "React DevTools",
      description: "Browser extension for debugging React applications",
      website_url: "https://react.dev",
      logo_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center",
      pricing: "Free",
      category: "Developer Tools",
      features: ["React", "JavaScript", "Debugging", "Browser Extension", "Open Source"],
      pros: ["Free", "Essential for React devs", "Well maintained"],
      cons: ["React only", "Browser dependent"],
      rating: 4.8,
      reviews_count: 50000
    },
    {
      id: "4",
      name: "Python Package Manager",
      description: "Package management system for Python",
      website_url: "https://pypi.org",
      logo_url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=50&h=50&fit=crop&crop=center",
      pricing: "Free",
      category: "Developer Tools",
      features: ["Python", "Package Management", "Dependencies", "Open Source", "AI"],
      pros: ["Standard tool", "Comprehensive", "Well documented"],
      cons: ["Python only", "Can be slow"],
      rating: 4.6,
      reviews_count: 75000
    }
  ];

  return category ? alternatives.filter(alt => alt.category === category) : alternatives;
}
