/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        // Cache the sequence hard so a second visit costs nothing. What makes
        // `immutable` true here is the version segment, not the filename —
        // the files are numbered, so a new sequence would otherwise reuse
        // every URL and returning visitors would keep the old footage for a
        // year without ever revalidating. See FRAMES_VERSION in lib/frames.js.
        source: '/frames/:version/:tier/:file',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
