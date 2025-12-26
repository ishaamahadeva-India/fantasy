/**
 * Image size specifications for different ad positions and content types
 */

export type ImageSpec = {
  width: number;
  height: number;
  aspectRatio: string;
  maxFileSizeMB: number;
  recommendedFormat: string[];
  description: string;
};

export const IMAGE_SPECS: Record<string, ImageSpec> = {
  // Advertisement Positions
  'home-sidebar-sponsored': {
    width: 300,
    height: 200,
    aspectRatio: '3:2',
    maxFileSizeMB: 2,
    recommendedFormat: ['PNG', 'JPG', 'WebP'],
    description: 'Sidebar sponsored ad on home page',
  },
  'home-article-between': {
    width: 800,
    height: 200,
    aspectRatio: '4:1',
    maxFileSizeMB: 3,
    recommendedFormat: ['PNG', 'JPG', 'WebP'],
    description: 'Banner ad between articles on home page',
  },
  'home-banner-top': {
    width: 1200,
    height: 300,
    aspectRatio: '4:1',
    maxFileSizeMB: 5,
    recommendedFormat: ['PNG', 'JPG', 'WebP'],
    description: 'Top banner on home page',
  },
  'article-top': {
    width: 1200,
    height: 400,
    aspectRatio: '3:1',
    maxFileSizeMB: 5,
    recommendedFormat: ['PNG', 'JPG', 'WebP'],
    description: 'Top banner on article pages',
  },
  'article-sidebar': {
    width: 300,
    height: 250,
    aspectRatio: '6:5',
    maxFileSizeMB: 2,
    recommendedFormat: ['PNG', 'JPG', 'WebP'],
    description: 'Sidebar ad on article pages',
  },
  'fantasy-banner': {
    width: 1200,
    height: 300,
    aspectRatio: '4:1',
    maxFileSizeMB: 5,
    recommendedFormat: ['PNG', 'JPG', 'WebP'],
    description: 'Banner on fantasy game pages',
  },
  'profile-sidebar': {
    width: 300,
    height: 200,
    aspectRatio: '3:2',
    maxFileSizeMB: 2,
    recommendedFormat: ['PNG', 'JPG', 'WebP'],
    description: 'Sidebar ad on profile pages',
  },
  'quiz-banner': {
    width: 800,
    height: 200,
    aspectRatio: '4:1',
    maxFileSizeMB: 3,
    recommendedFormat: ['PNG', 'JPG', 'WebP'],
    description: 'Banner on quiz pages',
  },
  
  // Image Ad (Full-screen gate ads)
  'image-ad-gate': {
    width: 1200,
    height: 675,
    aspectRatio: '16:9',
    maxFileSizeMB: 5,
    recommendedFormat: ['PNG', 'JPG', 'WebP'],
    description: 'Full-screen image ad gate (campaign/tournament entry)',
  },
  
  // Sponsor Logos
  'sponsor-logo': {
    width: 300,
    height: 300,
    aspectRatio: '1:1',
    maxFileSizeMB: 1,
    recommendedFormat: ['PNG', 'SVG', 'WebP'],
    description: 'Sponsor logo (square format)',
  },
  
  // Default/Generic
  'default': {
    width: 800,
    height: 600,
    aspectRatio: '4:3',
    maxFileSizeMB: 5,
    recommendedFormat: ['PNG', 'JPG', 'WebP'],
    description: 'Default image size',
  },
};

/**
 * Get image spec for a given position/folder
 */
export function getImageSpec(positionOrFolder: string): ImageSpec {
  return IMAGE_SPECS[positionOrFolder] || IMAGE_SPECS['default'];
}

/**
 * Format image spec as readable string
 */
export function formatImageSpec(spec: ImageSpec): string {
  return `${spec.width}×${spec.height}px (${spec.aspectRatio}), max ${spec.maxFileSizeMB}MB, ${spec.recommendedFormat.join('/')}`;
}

