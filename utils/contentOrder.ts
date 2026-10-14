import { BlogPost, Project } from '../types';

const timestamp = (date?: string): number => {
  const value = date ? Date.parse(date) : NaN;
  return Number.isFinite(value) ? value : 0;
};

// Undated entries keep their relative order after dated entries; never mutate the source data.
export const sortBlogsNewestFirst = (posts: BlogPost[]): BlogPost[] =>
  [...posts].sort((a, b) =>
    Math.max(timestamp(b.updatedAt), timestamp(b.date)) - Math.max(timestamp(a.updatedAt), timestamp(a.date)));

// A newly announced project can appear before historical projects without changing its timeline.
export const sortProjectsNewestFirst = (projects: Project[]): Project[] =>
  [...projects].sort((a, b) =>
    timestamp(b.completedOn || b.listedOn) - timestamp(a.completedOn || a.listedOn));
