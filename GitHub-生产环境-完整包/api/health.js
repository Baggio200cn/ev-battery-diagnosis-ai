// Vercel健康检查API
export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: '只支持 GET 请求'
    });
  }

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Vercel DeepSeek API 服务正常运行',
    platform: 'vercel',
    region: process.env.VERCEL_REGION || 'unknown',
    api_configured: !!process.env.DEEPSEEK_API_KEY,
    api_key_preview: process.env.DEEPSEEK_API_KEY ? 
      `${process.env.DEEPSEEK_API_KEY.substring(0, 10)}...` : 'N/A',
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0',
    deployment_id: process.env.VERCEL_DEPLOYMENT_ID || 'unknown'
  };

  console.log('📊 Vercel 健康检查请求');
  res.status(200).json(healthData);
} 