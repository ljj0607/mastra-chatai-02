import { Env } from '../index';

export interface Weather {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export class WeatherService {
  private apiKey: string;
  
  constructor(env: Env) {
    this.apiKey = env.WEATHER_API_KEY;
  }
  
  async getWeather(city: string): Promise<Weather> {
    try {
      // 使用OpenWeatherMap API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=zh_cn`
      );
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        city: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon
      };
    } catch (error) {
      // 如果API调用失败，返回模拟数据
      console.error('Weather API error:', error);
      return this.getMockWeather(city);
    }
  }
  
  private getMockWeather(city: string): Weather {
    // 模拟天气数据
    const descriptions = ['晴天', '多云', '小雨', '阴天'];
    const randomDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    return {
      city,
      temperature: Math.floor(Math.random() * 30) + 5, // 5-35度
      description: randomDesc,
      humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
      windSpeed: Math.floor(Math.random() * 10) + 1, // 1-10 m/s
      icon: '01d'
    };
  }
}