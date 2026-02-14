/**
 * Serverless function para upload de imagens para o GitHub via API.
 * Roda no ambiente Node.js da Vercel.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, fileName: requestedName } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    const owner = 'Felipesc023';
    const repo = 'completa-assets';
    const branch = 'main';
    // O token deve estar configurado nas variáveis de ambiente da Vercel
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      return res.status(500).json({ error: 'GITHUB_TOKEN not configured on server' });
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}-${requestedName || 'image.jpg'}`;
    const path = `public/products/${fileName}`;

    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload product image: ${fileName}`,
          content: file, // String Base64 vinda do frontend
          branch: branch,
        }),
      }
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      return res.status(502).json({ error: 'GitHub API error', details: errorData });
    }

    // URL final via CDN jsDelivr
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`;

    return res.status(200).json({ imageUrl: cdnUrl });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}