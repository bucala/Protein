export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).end();

  try {
    const response = await fetch(decodeURIComponent(url), {
      headers: { "Referer": "https://gymbeam.sk/" }
    });
    if (!response.ok) return res.status(404).end();

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.end(Buffer.from(buffer));
  } catch (e) {
    res.status(500).end();
  }
}
