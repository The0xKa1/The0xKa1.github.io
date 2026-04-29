export async function GET() {
  const robots = `User-agent: *
Allow: /
Sitemap: https://note.the0xka1.cc/sitemap.xml
`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
