// 电动汽车换电站智能诊断系统 - DeepSeek API集成
// 专业故障分析与解决方案生成

const axios = require('axios');

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-d0522e698322494db0196cdfbdecca05';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

// CORS 头设置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// DeepSeek API 调用函数
async function callDeepSeekAPI(messages) {
  try {
    console.log('🚀 Vercel DeepSeek API 调用...');
    
    const response = await axios.post(
      `${DEEPSEEK_BASE_URL}/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        timeout: 25000 // Vercel 25秒限制
      }
    );

    console.log('✅ DeepSeek API 调用成功');
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ DeepSeek API 调用失败:', error.message);
    
    if (error.response) {
      throw new Error(`DeepSeek API 错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error(`网络错误: ${error.message}`);
    } else {
      throw new Error(`未知错误: ${error.message}`);
    }
  }
}

// 主处理函数
export default async function handler(req, res) {
  // 设置 CORS 头
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: '只支持 POST 请求',
      method: req.method
    });
  }

  try {
    const { text } = req.body;
    
    console.log('📥 收到Vercel文本诊断请求:', text);
    
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '请输入要分析的文本'
      });
    }

    // 构建专业的诊断消息
    const messages = [
      {
        role: 'system',
        content: `你是一个专业的电动汽车换电站智能诊断专家。请根据用户描述的问题，提供：
1. 问题分析
2. 可能原因（至少3个）
3. 诊断步骤
4. 解决方案
5. 预防措施

请用专业、详细、实用的方式回答，确保内容准确可操作。回答要使用中文。`
      },
      {
        role: 'user',
        content: `请诊断以下问题：${text}`
      }
    ];

    // 调用 DeepSeek API
    console.log('🔍 开始AI诊断分析...');
    const analysis = await callDeepSeekAPI(messages);
    
    const response = {
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString(),
      mode: 'vercel-production',
      cached: false,
      api_version: 'v1',
      platform: 'vercel',
      region: process.env.VERCEL_REGION || 'unknown'
    };

    console.log('✅ Vercel 诊断分析完成');
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Vercel 文本分析失败:', error.message);
    
    const errorResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      mode: 'vercel-error',
      platform: 'vercel',
      suggestions: [
        '检查网络连接',
        '确认API密钥有效',
        '稍后重试',
        '联系技术支持'
      ]
    };

    res.status(500).json(errorResponse);
  }
}
