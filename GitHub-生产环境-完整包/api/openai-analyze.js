// OpenAI备用API - 电动汽车换电站智能诊断系统
// 当DeepSeek API不可用时的高质量替代方案

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, type = 'text' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    // OpenAI API密钥检查
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        fallback: true 
      });
    }

    // 构建专业的电动汽车诊断提示词
    const systemPrompt = `你是一个专业的电动汽车换电站设备诊断专家。请分析用户提供的信息，并提供详细的诊断结果。

分析重点：
1. 设备故障识别和分类
2. 可能的原因分析
3. 具体的解决方案
4. 预防措施建议
5. 安全注意事项

请用专业但易懂的语言回答，格式化输出结果。`;

    const userPrompt = `请分析以下${type === 'video' ? '视频' : type === 'audio' ? '音频' : '文本'}内容：

${text}

请提供专业的电动汽车换电站设备诊断分析。`;

    // 调用OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);
      
      return res.status(500).json({
        error: 'OpenAI API request failed',
        details: errorData.error?.message || 'Unknown error',
        fallback: true
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({
        error: 'Invalid response from OpenAI API',
        fallback: true
      });
    }

    const analysisResult = data.choices[0].message.content;

    // 返回结构化的诊断结果
    return res.status(200).json({
      success: true,
      provider: 'OpenAI',
      model: 'gpt-4o-mini',
      analysis: analysisResult,
      timestamp: new Date().toISOString(),
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0
      }
    });

  } catch (error) {
    console.error('OpenAI Analysis Error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}
