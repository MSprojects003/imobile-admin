import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   images: {
    domains: [
      "ydofhfpabcorhdnjhfcj.supabase.co", // <-- your Supabase project ref
      "images.unsplash.com", // <-- for dummy banner images
    ],
  },
};

export default nextConfig;
