import blogImage from "../assets/optimized/blog-cover.webp";
import generated from "./blogs.generated.json";

export type Blog = {
  id: string;
  title: string;
  author: string;
  date: string;
  read: string;
  image: string;
  body: string;
  link: string;
};

// Written at build time by scripts/fetch-blogs.mjs from the Hashnode feed, so
// the posts are baked into the bundle rather than fetched by the browser.
const published = generated as Blog[];

// An unavailable feed has a real empty state rather than fabricated articles.
export const blogs: Blog[] = published.map(post => ({ ...post, image: post.image || blogImage }));
