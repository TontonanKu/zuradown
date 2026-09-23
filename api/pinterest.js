module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // 1. Follow shortlinks if necessary (pin.it)
    const fetchRes = await fetch(url, { redirect: 'follow' });
    const html = await fetchRes.text();

    // 2. Extract media from HTML
    const videoMatches = html.match(/https:\/\/v\.pinimg\.com\/videos\/[^\s"'\\]+\.mp4/g);
    const imageMatches = html.match(/https:\/\/i\.pinimg\.com\/originals\/[^\s"'\\]+\.(jpg|png)/g);

    // Extract title/author from meta tags if possible
    let title = 'Pinterest Media';
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    if (titleMatch && titleMatch[1]) {
        title = titleMatch[1];
    }

    const result = {
      title: title,
      author: 'Pinterest',
      mediaUrl: null,
      type: 'unknown'
    };

    if (videoMatches && videoMatches.length > 0) {
      result.type = 'video';
      // Pick the first unique video URL
      result.mediaUrl = [...new Set(videoMatches)][0]; 
    } else if (imageMatches && imageMatches.length > 0) {
      result.type = 'image';
      result.mediaUrl = [...new Set(imageMatches)][0];
    } else {
      return res.status(404).json({ error: 'Gagal menemukan video/foto di link ini.' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil data.' });
  }
};
