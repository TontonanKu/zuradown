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

    // Extract title
    let title = 'Pinterest Media';
    const titleMatch = html.match(/"headline":"([^"]+)"/i) || html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(/ - Pinterest/i, '').trim();
    }

    // Extract author
    let author = 'Pinterest User';
    const authorMatch = html.match(/"author":"([^"]+)"/i) || html.match(/"name":"([^"]+)","@type":"Person"/i) || html.match(/<meta property="pinterestapp:pinner" content="([^"]+)"/i);
    if (authorMatch && authorMatch[1]) {
        author = authorMatch[1];
    }

    const result = {
      title: title,
      author: author,
      mediaUrl: null,
      type: 'unknown'
    };

    if (videoMatches && videoMatches.length > 0) {
      result.type = 'video';
      result.mediaUrl = [...new Set(videoMatches)][0]; 
    } else {
      // Find og:image for the main post image
      const ogImageMatch = html.match(/<meta[^>]+(?:name|property)="og:image"[^>]+content="([^"]+)"/i) 
                        || html.match(/<meta[^>]+content="([^"]+)"[^>]+(?:name|property)="og:image"/i)
                        || html.match(/"image":"(https:\/\/i\.pinimg\.com\/originals\/[^"]+)"/i);
      
      if (ogImageMatch && ogImageMatch[1]) {
          result.type = 'image';
          result.mediaUrl = ogImageMatch[1];
      } else if (imageMatches && imageMatches.length > 0) {
          result.type = 'image';
          // Filter out the generic gradient images if possible, or just pick the last one
          const realImages = imageMatches.filter(img => !img.includes('d53b014d86a6b6761bf649a0ed813c2b'));
          result.mediaUrl = realImages.length > 0 ? realImages[realImages.length - 1] : imageMatches[imageMatches.length - 1];
      } else {
          return res.status(404).json({ error: 'Gagal menemukan video/foto di link ini.' });
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil data.' });
  }
};
