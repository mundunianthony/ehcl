import img1 from '../assets/img1.png';
import img2 from '../assets/img2.png';
import img3 from '../assets/img3.png';
import img4 from '../assets/img4.png';
import img5 from '../assets/img5.png';
import blog1 from '../assets/blog1.jpg';
import blog2 from '../assets/blog2.jpg';
import blog3 from '../assets/blog3.jpg';
import blog4 from '../assets/blog4.jpg';

// PROPERTIES: Array of property objects
export const PROPERTIES = [
  {
    id: 1,
    title: "Cozy Cottage",
    location: "New Hampshire",
    price: 250,
    image: img1,
    description: "A cozy cottage in the woods.",
    features: ["2 bedrooms", "1 bathroom", "Fireplace"],
    rating: 4.8,
    reviews: 150,
    owner: {
      name: "John Doe",
      id: "owner1",
      propertiesOwned: 3,
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
  },
  {
    id: 2,
    title: "Beachfront Villa",
    location: "California",
    price: 500,
    image: img2,
    description: "A beautiful villa with an ocean view.",
    features: ["3 bedrooms", "2 bathrooms", "Pool"],
    rating: 4.9,
    reviews: 200,
    owner: {
      name: "Jane Smith",
      id: "owner2",
      propertiesOwned: 5,
      image: "https://randomuser.me/api/portraits/women/2.jpg",
    },
  },
  {
    id: 3,
    title: "Downtown Apartment",
    location: "New York",
    price: 300,
    image: img3,
    description: "A stylish apartment in the city center.",
    features: ["1 bedroom", "1 bathroom", "Balcony"],
    rating: 4.7,
    reviews: 180,
    owner: {
      name: "Emily Johnson",
      id: "owner3",
      propertiesOwned: 2,
      image: "https://randomuser.me/api/portraits/women/3.jpg",
    },
  },
  {
    id: 4,
    title: "Countryside Farm",
    location: "Texas",
    price: 400,
    image: img4,
    description: "A spacious farm with a barn and animals.",
    features: ["4 bedrooms", "3 bathrooms", "Garden"],
    rating: 4.6,
    reviews: 90,
    owner: {
      name: "Michael Brown",
      id: "owner4",
      propertiesOwned: 4,
      image: "https://randomuser.me/api/portraits/men/4.jpg",
    },
  },
  {
    id: 5,
    title: "Luxury Mansion",
    location: "Florida",
    price: 1000,
    image: img5,
    description: "A luxurious mansion with all amenities.",
    features: ["5 bedrooms", "4 bathrooms", "Gym", "Spa"],
    rating: 5.0,
    reviews: 300,
    owner: {
      name: "Sarah Wilson",
      id: "owner5",
      propertiesOwned: 1,
      image: "https://randomuser.me/api/portraits/women/5.jpg",
    },
  },
];

// BLOGS: Array of blog objects
export const BLOGS = [
  {
    id: 1,
    title: "The Ultimate Guide to Homely",
    excerpt: "Discover the best tips and tricks for using Homely.",
    image: blog1,
    date: "2023-10-01",
    author: "Admin",
    content: "Full content of the blog post...",
  },
  {
    id: 2,
    title: "10 Tips for First-time Home Buyers",
    excerpt: "Essential tips that every first-time home buyer should know.",
    image: blog2,
    date: "2023-09-28",
    author: "Admin",
    content: "Full content of the blog post...",
  },
  {
    id: 3,
    title: "How to Sell Your Home Quickly",
    excerpt: "Proven strategies to sell your home in no time.",
    image: blog3,
    date: "2023-09-15",
    author: "Admin",
    content: "Full content of the blog post...",
  },
  {
    id: 4,
    title: "Understanding Real Estate Investments",
    excerpt: "A beginner's guide to real estate investments.",
    image: blog4,
    date: "2023-08-30",
    author: "Admin",
    content: "Full content of the blog post...",
  },
];

// FOOTER SECTION
export const FOOTER_LINKS = [
  { title: "About Us", url: "/about" },
  { title: "Contact", url: "/contact" },
  { title: "Privacy Policy", url: "/privacy-policy" },
  { title: "Terms of Service", url: "/terms-of-service" },
];

export const FOOTER_CONTACT_INFO = {
  address: "123 Homely St, Home City, HC 12345",
  phone: "+1 (555) 123-4567",
  email: "info@homely.com",
};

// SOCIALS: For React Native, use icon name strings instead of JSX icons
export const SOCIALS = {
  title: "Follow Us",
  links: [
    { icon: "facebook", id: "facebook" },
    { icon: "instagram", id: "instagram" },
    { icon: "twitter", id: "twitter" },
    { icon: "youtube", id: "youtube" },
    { icon: "linkedin", id: "linkedin" },
    { icon: "tiktok", id: "tiktok" },
  ],
};