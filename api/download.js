module.exports = async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
  
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
  
    try {
      const fetchRes = await fetch(url);
      
      if (!fetchRes.ok) {
          return res.status(404).json({ error: 'Failed to fetch media' });
      }
  
      const contentType = fetchRes.headers.get('content-type') || 'application/octet-stream';
      
      // Determine file extension
      let ext = 'file';
      if (contentType.includes('video/mp4')) ext = 'mp4';
      else if (contentType.includes('image/jpeg')) ext = 'jpg';
      else if (contentType.includes('image/png')) ext = 'png';
      else if (contentType.includes('image/webp')) ext = 'webp';
      
      // Determine platform from URL
      let platform = 'Pinterest';
      if (url.includes('tiktok') || url.includes('tikwm') || url.includes('tiktokcdn')) {
          platform = 'TikTok';
      }
      
      const filename = `ZuraDown_${platform}_${Date.now()}.${ext}`;
  
      res.setHeader('Content-Type', contentType);
      // Force the browser to download the file instead of displaying it
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
      const arrayBuffer = await fetchRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
  
      return res.send(buffer);
    } catch (error) {
      console.error('Download Proxy Error:', error);
      return res.status(500).json({ error: 'Terjadi kesalahan saat mengunduh.' });
    }
  };
