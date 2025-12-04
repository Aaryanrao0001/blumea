// Simplified mock types for client-side usage (plain objects)
interface MockTag {
  _id: string;
  title: string;
  slug: string;
}

interface MockAuthor {
  _id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
}

interface MockCategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  postCount?: number;
}

interface MockPost {
  _id: string;
  title: string;
  slug: string;
  type: 'blog' | 'review';
  excerpt: string;
  body: string;
  coverImage: { url: string; alt: string };
  category: MockCategory;
  tags: MockTag[];
  author: MockAuthor;
  publishedAt: Date;
  updatedAt: Date;
  isFeatured: boolean;
  isPopular: boolean;
  readingTime?: number;
  productName?: string;
  brand?: string;
  overallRating?: number;
  criteriaRatings?: { label: string; score: number }[];
  pros?: string[];
  cons?: string[];
  verdict?: string;
}

// Mock author
const mockAuthor: MockAuthor = {
  _id: '1',
  name: 'Sofia Chen',
  slug: 'sofia-chen',
  bio: 'Beauty editor and skincare enthusiast with over 10 years of experience in the beauty industry.',
  avatar: 'https://placehold.co/100x100/1A1A1A/D4AF37?text=SC',
};

// Mock categories
export const mockCategories: MockCategory[] = [
  {
    _id: '1',
    title: 'Skincare',
    slug: 'skincare',
    description: 'Everything about skincare routines and products',
    postCount: 24,
  },
  {
    _id: '2',
    title: 'Reviews',
    slug: 'reviews',
    description: 'In-depth product reviews',
    postCount: 18,
  },
  {
    _id: '3',
    title: 'Wellness',
    slug: 'wellness',
    description: 'Holistic wellness and self-care',
    postCount: 12,
  },
  {
    _id: '4',
    title: 'Beauty',
    slug: 'beauty',
    description: 'Makeup and beauty tips',
    postCount: 15,
  },
];

// Mock posts
const mockPosts: MockPost[] = [
  {
    _id: '1',
    title: 'The Radiance Edit: Augustinus Bader The Rich Cream',
    slug: 'augustinus-bader-rich-cream-review',
    type: 'review',
    excerpt: 'A deep dive into the cult-favorite luxury cream that promises to transform your skin. Is it worth the splurge? We put it to the test over 8 weeks.',
    body: 'The Augustinus Bader Rich Cream has become a cult favorite in the luxury skincare world...',
    coverImage: {
      url: 'https://placehold.co/800x600/1A1A1A/D4AF37?text=Augustinus+Bader',
      alt: 'Augustinus Bader The Rich Cream',
    },
    category: mockCategories[1],
    tags: [],
    author: mockAuthor,
    publishedAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15'),
    isFeatured: true,
    isPopular: true,
    readingTime: 8,
    productName: 'The Rich Cream',
    brand: 'Augustinus Bader',
    overallRating: 4.8,
    criteriaRatings: [
      { label: 'Effectiveness', score: 5 },
      { label: 'Texture', score: 4.5 },
      { label: 'Value', score: 3.5 },
      { label: 'Packaging', score: 5 },
    ],
    pros: ['Incredible hydration', 'Visible results in 2 weeks', 'Luxurious texture'],
    cons: ['High price point', 'May be too rich for oily skin'],
    verdict: 'A worthwhile investment for those seeking premium anti-aging benefits.',
  },
  {
    _id: '2',
    title: 'Morning Skincare Routine for Glowing Skin',
    slug: 'morning-skincare-routine-glowing-skin',
    type: 'blog',
    excerpt: 'Start your day with a skincare routine that will leave your skin radiant and protected. From cleansing to SPF, we cover every essential step.',
    body: 'A good morning skincare routine is the foundation of healthy, glowing skin...',
    coverImage: {
      url: 'https://placehold.co/800x600/1A1A1A/D4AF37?text=Morning+Routine',
      alt: 'Morning skincare routine products',
    },
    category: mockCategories[0],
    tags: [],
    author: mockAuthor,
    publishedAt: new Date('2024-11-12'),
    updatedAt: new Date('2024-11-12'),
    isFeatured: false,
    isPopular: true,
    readingTime: 5,
  },
  {
    _id: '3',
    title: 'La Mer Crème de la Mer: Luxury Worth the Hype?',
    slug: 'la-mer-creme-review',
    type: 'review',
    excerpt: 'We tested the iconic La Mer moisturizer for 6 weeks to see if this legendary cream lives up to its prestigious reputation.',
    body: 'La Mer has been a name synonymous with luxury skincare for decades...',
    coverImage: {
      url: 'https://placehold.co/800x600/1A1A1A/D4AF37?text=La+Mer',
      alt: 'La Mer Crème de la Mer',
    },
    category: mockCategories[1],
    tags: [],
    author: mockAuthor,
    publishedAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-10'),
    isFeatured: false,
    isPopular: true,
    readingTime: 7,
    productName: 'Crème de la Mer',
    brand: 'La Mer',
    overallRating: 4.5,
  },
  {
    _id: '4',
    title: 'The Science Behind Retinol: Everything You Need to Know',
    slug: 'science-behind-retinol',
    type: 'blog',
    excerpt: 'Retinol is the gold standard in anti-aging skincare. Learn how this powerful ingredient works and how to incorporate it into your routine.',
    body: 'Retinol, a derivative of Vitamin A, has been scientifically proven to...',
    coverImage: {
      url: 'https://placehold.co/800x600/1A1A1A/D4AF37?text=Retinol+Science',
      alt: 'Retinol skincare science',
    },
    category: mockCategories[0],
    tags: [],
    author: mockAuthor,
    publishedAt: new Date('2024-11-08'),
    updatedAt: new Date('2024-11-08'),
    isFeatured: false,
    isPopular: false,
    readingTime: 10,
  },
  {
    _id: '5',
    title: 'Drunk Elephant Protini Polypeptide Cream Review',
    slug: 'drunk-elephant-protini-review',
    type: 'review',
    excerpt: 'This protein-powered moisturizer claims to improve skin firmness and texture. We put it through a rigorous 4-week test.',
    body: 'Drunk Elephant has made a name for itself with its clean formulations...',
    coverImage: {
      url: 'https://placehold.co/800x600/1A1A1A/D4AF37?text=Drunk+Elephant',
      alt: 'Drunk Elephant Protini Cream',
    },
    category: mockCategories[1],
    tags: [],
    author: mockAuthor,
    publishedAt: new Date('2024-11-05'),
    updatedAt: new Date('2024-11-05'),
    isFeatured: false,
    isPopular: true,
    readingTime: 6,
    productName: 'Protini Polypeptide Cream',
    brand: 'Drunk Elephant',
    overallRating: 4.2,
  },
  {
    _id: '6',
    title: 'How to Layer Your Skincare Products Correctly',
    slug: 'layer-skincare-products-correctly',
    type: 'blog',
    excerpt: 'The order of your skincare products matters. Learn the correct layering sequence for maximum efficacy and beautiful results.',
    body: 'Proper layering is essential to get the most out of your skincare products...',
    coverImage: {
      url: 'https://placehold.co/800x600/1A1A1A/D4AF37?text=Skincare+Layering',
      alt: 'Skincare layering guide',
    },
    category: mockCategories[0],
    tags: [],
    author: mockAuthor,
    publishedAt: new Date('2024-11-02'),
    updatedAt: new Date('2024-11-02'),
    isFeatured: false,
    isPopular: false,
    readingTime: 4,
  },
  {
    _id: '7',
    title: 'The Ultimate Guide to Hydrating Your Skin',
    slug: 'ultimate-guide-hydrating-skin',
    type: 'blog',
    excerpt: 'Hydration is the key to plump, youthful-looking skin. Discover the best ingredients and techniques for optimal hydration.',
    body: 'Keeping your skin hydrated is one of the most important steps in any skincare routine...',
    coverImage: {
      url: 'https://placehold.co/800x600/1A1A1A/D4AF37?text=Hydration+Guide',
      alt: 'Skin hydration guide',
    },
    category: mockCategories[2],
    tags: [],
    author: mockAuthor,
    publishedAt: new Date('2024-10-28'),
    updatedAt: new Date('2024-10-28'),
    isFeatured: false,
    isPopular: false,
    readingTime: 8,
  },
  {
    _id: '8',
    title: 'Sunday Riley Good Genes Review',
    slug: 'sunday-riley-good-genes-review',
    type: 'review',
    excerpt: 'This lactic acid treatment promises instant radiance. We tested it for 6 weeks to see if the results match the hype.',
    body: 'Sunday Riley Good Genes has achieved almost legendary status in the skincare community...',
    coverImage: {
      url: 'https://placehold.co/800x600/1A1A1A/D4AF37?text=Sunday+Riley',
      alt: 'Sunday Riley Good Genes',
    },
    category: mockCategories[1],
    tags: [],
    author: mockAuthor,
    publishedAt: new Date('2024-10-25'),
    updatedAt: new Date('2024-10-25'),
    isFeatured: false,
    isPopular: false,
    readingTime: 7,
    productName: 'Good Genes All-In-One Lactic Acid Treatment',
    brand: 'Sunday Riley',
    overallRating: 4.6,
  },
];

export const getFeaturedPost = (): MockPost => {
  return mockPosts.find((post) => post.isFeatured) || mockPosts[0];
};

export const getPopularPosts = (limit: number = 5): MockPost[] => {
  return mockPosts.filter((post) => post.isPopular).slice(0, limit);
};

export const getNewPosts = (limit: number = 5): MockPost[] => {
  return [...mockPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
};

export const getAllPosts = (): MockPost[] => {
  return mockPosts;
};

export const getPostBySlug = (slug: string): MockPost | undefined => {
  return mockPosts.find((post) => post.slug === slug);
};

export const getPostsByCategory = (categorySlug: string): MockPost[] => {
  return mockPosts.filter(
    (post) =>
      typeof post.category === 'object' &&
      'slug' in post.category &&
      post.category.slug === categorySlug
  );
};

export const getCategories = (): MockCategory[] => {
  return mockCategories;
};
