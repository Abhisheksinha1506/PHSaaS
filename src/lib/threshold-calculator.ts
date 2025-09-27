/**
 * Dynamic Threshold Calculator
 * Calculates adaptive thresholds based on data distribution and statistical analysis
 */

export interface ThresholdConfig {
  // Percentile-based thresholds
  lowPercentile: number;      // e.g., 0.25 (25th percentile)
  mediumPercentile: number;   // e.g., 0.5 (50th percentile) 
  highPercentile: number;     // e.g., 0.75 (75th percentile)
  
  // Time-based multipliers
  timeMultipliers: {
    '24h': number;
    '7d': number;
    '30d': number;
  };
  
  // Minimum thresholds to prevent too low values
  minimums: {
    engagement: number;
    votes: number;
    comments: number;
    stars: number;
    demand: number;
  };
}

export interface CalculatedThresholds {
  engagement: {
    low: number;
    medium: number;
    high: number;
    excellent: number;
  };
  votes: {
    low: number;
    medium: number;
    high: number;
    excellent: number;
  };
  comments: {
    low: number;
    medium: number;
    high: number;
    excellent: number;
  };
  stars: {
    low: number;
    medium: number;
    high: number;
    excellent: number;
  };
  demand: {
    low: number;
    medium: number;
    high: number;
    excellent: number;
  };
}

export class DynamicThresholdCalculator {
  private config: ThresholdConfig;

  constructor(config?: Partial<ThresholdConfig>) {
    this.config = {
      lowPercentile: 0.2,    // More lenient - 20th percentile
      mediumPercentile: 0.4, // More lenient - 40th percentile  
      highPercentile: 0.6,   // More lenient - 60th percentile
      timeMultipliers: {
        '24h': 0.7,  // Slightly higher for 24h
        '7d': 1.0,
        '30d': 1.2   // Slightly lower for 30d
      },
      minimums: {
        engagement: 5,   // Lower minimums
        votes: 3,
        comments: 1,
        stars: 5,
        demand: 500     // Much lower demand minimum
      },
      ...config
    };
  }

  /**
   * Calculate dynamic thresholds for engagement scores
   */
  calculateEngagementThresholds(
    data: Array<{ votes_count: number; comments_count: number }>,
    timeFilter: '24h' | '7d' | '30d' = '7d'
  ): CalculatedThresholds['engagement'] {
    if (data.length === 0) {
      return {
        low: this.config.minimums.engagement,
        medium: this.config.minimums.engagement * 2,
        high: this.config.minimums.engagement * 5,
        excellent: this.config.minimums.engagement * 10
      };
    }

    // Calculate engagement scores
    const engagementScores = data.map(item => item.votes_count + item.comments_count);
    const sortedScores = engagementScores.sort((a, b) => a - b);
    
    const timeMultiplier = this.config.timeMultipliers[timeFilter];
    
    const low = Math.max(
      this.config.minimums.engagement,
      Math.round(this.getPercentile(sortedScores, this.config.lowPercentile) * timeMultiplier)
    );
    const medium = Math.round(this.getPercentile(sortedScores, this.config.mediumPercentile) * timeMultiplier);
    const high = Math.round(this.getPercentile(sortedScores, this.config.highPercentile) * timeMultiplier);
    const excellent = Math.round(this.getPercentile(sortedScores, 0.9) * timeMultiplier);

    return { low, medium, high, excellent };
  }

  /**
   * Calculate dynamic thresholds for votes
   */
  calculateVoteThresholds(
    data: Array<{ votes_count: number }>,
    timeFilter: '24h' | '7d' | '30d' = '7d'
  ): CalculatedThresholds['votes'] {
    if (data.length === 0) {
      return {
        low: this.config.minimums.votes,
        medium: this.config.minimums.votes * 2,
        high: this.config.minimums.votes * 5,
        excellent: this.config.minimums.votes * 10
      };
    }

    const votes = data.map(item => item.votes_count).sort((a, b) => a - b);
    const timeMultiplier = this.config.timeMultipliers[timeFilter];
    
    const low = Math.max(
      this.config.minimums.votes,
      Math.round(this.getPercentile(votes, this.config.lowPercentile) * timeMultiplier)
    );
    const medium = Math.round(this.getPercentile(votes, this.config.mediumPercentile) * timeMultiplier);
    const high = Math.round(this.getPercentile(votes, this.config.highPercentile) * timeMultiplier);
    const excellent = Math.round(this.getPercentile(votes, 0.9) * timeMultiplier);

    return { low, medium, high, excellent };
  }

  /**
   * Calculate dynamic thresholds for comments
   */
  calculateCommentThresholds(
    data: Array<{ comments_count: number }>,
    timeFilter: '24h' | '7d' | '30d' = '7d'
  ): CalculatedThresholds['comments'] {
    if (data.length === 0) {
      return {
        low: this.config.minimums.comments,
        medium: this.config.minimums.comments * 2,
        high: this.config.minimums.comments * 5,
        excellent: this.config.minimums.comments * 10
      };
    }

    const comments = data.map(item => item.comments_count).sort((a, b) => a - b);
    const timeMultiplier = this.config.timeMultipliers[timeFilter];
    
    const low = Math.max(
      this.config.minimums.comments,
      Math.round(this.getPercentile(comments, this.config.lowPercentile) * timeMultiplier)
    );
    const medium = Math.round(this.getPercentile(comments, this.config.mediumPercentile) * timeMultiplier);
    const high = Math.round(this.getPercentile(comments, this.config.highPercentile) * timeMultiplier);
    const excellent = Math.round(this.getPercentile(comments, 0.9) * timeMultiplier);

    return { low, medium, high, excellent };
  }

  /**
   * Calculate dynamic thresholds for GitHub stars
   */
  calculateStarThresholds(
    data: Array<{ reviews_count: number }>,
    timeFilter: '24h' | '7d' | '30d' = '7d'
  ): CalculatedThresholds['stars'] {
    if (data.length === 0) {
      return {
        low: this.config.minimums.stars,
        medium: this.config.minimums.stars * 2,
        high: this.config.minimums.stars * 5,
        excellent: this.config.minimums.stars * 10
      };
    }

    const stars = data.map(item => item.reviews_count).sort((a, b) => a - b);
    const timeMultiplier = this.config.timeMultipliers[timeFilter];
    
    const low = Math.max(
      this.config.minimums.stars,
      Math.round(this.getPercentile(stars, this.config.lowPercentile) * timeMultiplier)
    );
    const medium = Math.round(this.getPercentile(stars, this.config.mediumPercentile) * timeMultiplier);
    const high = Math.round(this.getPercentile(stars, this.config.highPercentile) * timeMultiplier);
    const excellent = Math.round(this.getPercentile(stars, 0.9) * timeMultiplier);

    return { low, medium, high, excellent };
  }

  /**
   * Calculate dynamic thresholds for demand scores
   */
  calculateDemandThresholds(
    data: Array<{ demand: number }>,
    timeFilter: '24h' | '7d' | '30d' = '7d'
  ): CalculatedThresholds['demand'] {
    if (data.length === 0) {
      return {
        low: this.config.minimums.demand,
        medium: this.config.minimums.demand * 2,
        high: this.config.minimums.demand * 5,
        excellent: this.config.minimums.demand * 10
      };
    }

    const demands = data.map(item => item.demand).sort((a, b) => a - b);
    const timeMultiplier = this.config.timeMultipliers[timeFilter];
    
    const low = Math.max(
      this.config.minimums.demand,
      Math.round(this.getPercentile(demands, this.config.lowPercentile) * timeMultiplier)
    );
    const medium = Math.round(this.getPercentile(demands, this.config.mediumPercentile) * timeMultiplier);
    const high = Math.round(this.getPercentile(demands, this.config.highPercentile) * timeMultiplier);
    const excellent = Math.round(this.getPercentile(demands, 0.9) * timeMultiplier);

    return { low, medium, high, excellent };
  }

  /**
   * Get all thresholds for a complete dataset
   */
  calculateAllThresholds(
    productHuntData: Array<{ votes_count: number; comments_count: number }>,
    hackerNewsData: Array<{ score: number; descendants: number }>,
    saaSHubData: Array<{ reviews_count: number }>,
    skillDemandData: Array<{ demand: number }>,
    timeFilter: '24h' | '7d' | '30d' = '7d'
  ): CalculatedThresholds {
    return {
      engagement: this.calculateEngagementThresholds(productHuntData, timeFilter),
      votes: this.calculateVoteThresholds(productHuntData, timeFilter),
      comments: this.calculateCommentThresholds(productHuntData, timeFilter),
      stars: this.calculateStarThresholds(saaSHubData, timeFilter),
      demand: this.calculateDemandThresholds(skillDemandData, timeFilter)
    };
  }

  /**
   * Categorize a value based on calculated thresholds
   */
  categorizeValue(
    value: number, 
    thresholds: { low: number; medium: number; high: number; excellent: number }
  ): 'low' | 'medium' | 'high' | 'excellent' {
    if (value >= thresholds.excellent) return 'excellent';
    if (value >= thresholds.high) return 'high';
    if (value >= thresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Get trend status based on dynamic thresholds
   */
  getTrendStatus(
    demand: number,
    thresholds: CalculatedThresholds['demand']
  ): '🔥 Hot' | '📈 Rising' | '📊 Stable' | '⏳ Watch' {
    if (demand >= thresholds.excellent) return '🔥 Hot';
    if (demand >= thresholds.high) return '📈 Rising';
    if (demand >= thresholds.medium) return '📊 Stable';
    return '⏳ Watch';
  }

  /**
   * Helper method to calculate percentiles
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    const index = Math.floor(sortedArray.length * percentile);
    return sortedArray[index] || 0;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ThresholdConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ThresholdConfig {
    return { ...this.config };
  }
}

// Export a default instance
export const thresholdCalculator = new DynamicThresholdCalculator();
