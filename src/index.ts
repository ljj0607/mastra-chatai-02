import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createYoga } from 'graphql-yoga';
import { schema } from './graphql/schema';
import { createContext } from './context';

export interface Env {
  DB: D1Database;
  VECTORIZE_INDEX: VectorizeIndex;
  OPENAI_API_KEY: string;
  WEATHER_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS配置
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true,
}));

// 首页 - 显示API信息
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="zh">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mastra ChatAI API</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 2rem; }
        .status { background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .endpoint { background: #f5f5f5; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
        .method { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; font-size: 0.8rem; }
        .get { background: #61affe; color: white; }
        .post { background: #49cc90; color: white; }
        code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 4px; }
        .footer { text-align: center; margin-top: 2rem; color: #666; }
        .notice { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🤖 Mastra ChatAI API</h1>
        <p>基于 OpenAI GPT 的智能聊天工具后端服务</p>
      </div>
      
      <div class="notice">
        <h3>💡 简化版本说明</h3>
        <p><strong>已移除 Anthropic Claude 依赖</strong> - 现在只需要 OpenAI API Key 即可使用所有功能！</p>
        <p>知识问答和普通对话都使用 OpenAI GPT 模型。</p>
      </div>
      
      <div class="status">
        <h3>✅ 服务状态：运行中</h3>
        <p>时间：${new Date().toLocaleString('zh-CN')}</p>
        <p>只需配置：OpenAI API Key + 天气 API Key（可选）</p>
      </div>
      
      <h2>🔗 API 端点</h2>
      
      <div class="endpoint">
        <h3><span class="method get">GET</span> /health</h3>
        <p>健康检查端点</p>
        <p><strong>示例：</strong> <code>curl http://localhost:8787/health</code></p>
      </div>
      
      <div class="endpoint">
        <h3><span class="method post">POST</span> /graphql</h3>
        <p>GraphQL API 端点 - 支持聊天、天气查询、知识问答</p>
        <p><strong>GraphQL Playground：</strong> <a href="/graphql" target="_blank">http://localhost:8787/graphql</a></p>
        <details>
          <summary>查询示例</summary>
          <pre><code>{
  "query": "query { weather(city: \\"北京\\") { city temperature description } }"
}</code></pre>
        </details>
      </div>
      
      <div class="endpoint">
        <h3><span class="method get">GET</span> /api/weather/:city</h3>
        <p>REST API 天气查询</p>
        <p><strong>示例：</strong> <code>curl http://localhost:8787/api/weather/北京</code></p>
      </div>
      
      <h2>🚀 快速测试</h2>
      <div class="endpoint">
        <h4>1. 健康检查</h4>
        <button onclick="testHealth()">测试健康检查</button>
        <div id="health-result"></div>
        
        <h4>2. 天气查询</h4>
        <button onclick="testWeather()">测试天气API</button>
        <div id="weather-result"></div>
        
        <h4>3. GraphQL查询</h4>
        <button onclick="testGraphQL()">测试GraphQL</button>
        <div id="graphql-result"></div>
      </div>
      
      <div class="footer">
        <p>📚 <a href="https://github.com/ljj0607/mastra-chatai-02" target="_blank">项目文档</a> | 
        🐛 <a href="https://github.com/ljj0607/mastra-chatai-02/issues" target="_blank">问题反馈</a></p>
        <p><strong>配置提示：</strong>只需在 .env 中设置 OPENAI_API_KEY 即可使用所有AI功能</p>
      </div>
      
      <script>
        async function testHealth() {
          try {
            const response = await fetch('/health');
            const data = await response.json();
            document.getElementById('health-result').innerHTML = 
              '<pre style="background:#e8f5e8;padding:1rem;border-radius:4px;">' + 
              JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            document.getElementById('health-result').innerHTML = 
              '<pre style="background:#ffe8e8;padding:1rem;border-radius:4px;">错误: ' + error.message + '</pre>';
          }
        }
        
        async function testWeather() {
          try {
            const response = await fetch('/api/weather/北京');
            const data = await response.json();
            document.getElementById('weather-result').innerHTML = 
              '<pre style="background:#e8f5e8;padding:1rem;border-radius:4px;">' + 
              JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            document.getElementById('weather-result').innerHTML = 
              '<pre style="background:#ffe8e8;padding:1rem;border-radius:4px;">错误: ' + error.message + '</pre>';
          }
        }
        
        async function testGraphQL() {
          try {
            const response = await fetch('/graphql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: 'query { __typename }'
              })
            });
            const data = await response.json();
            document.getElementById('graphql-result').innerHTML = 
              '<pre style="background:#e8f5e8;padding:1rem;border-radius:4px;">' + 
              JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            document.getElementById('graphql-result').innerHTML = 
              '<pre style="background:#ffe8e8;padding:1rem;border-radius:4px;">错误: ' + error.message + '</pre>';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Favicon处理
app.get('/favicon.ico', (c) => {
  // 返回一个简单的SVG图标
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#2196f3"/>
    <text x="32" y="42" text-anchor="middle" fill="white" font-size="32" font-family="sans-serif">🤖</text>
  </svg>`;
  
  return c.body(svgIcon, 200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=86400'
  });
});

// 健康检查
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'healthy',
      graphql: 'healthy',
      ai_provider: 'OpenAI GPT'
    }
  });
});

// GraphQL端点
app.use('/graphql', async (c) => {
  const yoga = createYoga({
    schema,
    context: createContext(c),
    graphqlEndpoint: '/graphql',
    fetchAPI: { Request, Response },
  });
  
  return yoga.handle(c.req.raw, c.env);
});

// RESTful API端点
app.get('/api/weather/:city', async (c) => {
  const city = c.req.param('city');
  const weatherService = new (await import('./services/weather')).WeatherService(c.env);
  
  try {
    const weather = await weatherService.getWeather(city);
    return c.json({ 
      success: true,
      data: weather,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// API信息端点
app.get('/api', (c) => {
  return c.json({
    name: 'Mastra ChatAI API',
    version: '1.0.0',
    ai_provider: 'OpenAI GPT',
    endpoints: {
      graphql: '/graphql',
      health: '/health',
      weather: '/api/weather/:city'
    },
    documentation: 'https://github.com/ljj0607/mastra-chatai-02'
  });
});

// 404处理
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: '请求的端点不存在',
    availableEndpoints: [
      'GET /',
      'GET /health', 
      'POST /graphql',
      'GET /api/weather/:city'
    ],
    timestamp: new Date().toISOString()
  }, 404);
});

export default app;
