import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createYoga } from 'graphql-yoga';
import { schema } from './graphql/schema';
import { createContext } from './context';

export interface Env {
  DB: D1Database;
  VECTORIZE_INDEX: VectorizeIndex;
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  WEATHER_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS配置
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  credentials: true,
}));

// 健康检查
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    return c.json({ data: weather });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
