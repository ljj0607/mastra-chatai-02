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
    // 如果没有配置API Key或API Key无效，直接返回模拟数据
    if (!this.apiKey || this.apiKey === 'your_weather_api_key_here') {
      console.log('使用模拟天气数据 - 未配置有效的天气API Key');
      return this.getMockWeather(city);
    }

    try {
      // 使用OpenWeatherMap API
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=zh_cn`;
      console.log('请求天气API:', city);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`天气API错误: ${response.status} - ${response.statusText}`);
        
        if (response.status === 401) {
          console.error('天气API Key无效，使用模拟数据');
        } else if (response.status === 404) {
          console.error(`城市"${city}"未找到，使用模拟数据`);
        }
        
        // API调用失败时返回模拟数据
        return this.getMockWeather(city);
      }
      
      const data = await response.json();
      console.log('天气API响应成功:', data.name);
      
      return {
        city: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind?.speed || 0),
        icon: data.weather[0].icon
      };
    } catch (error) {
      // 网络错误或其他异常，返回模拟数据
      console.error('天气API请求异常:', error.message);
      return this.getMockWeather(city);
    }
  }
  
  private getMockWeather(city: string): Weather {
    // 模拟天气数据 - 根据城市名称生成一致的数据
    const cityHash = this.hashCode(city);
    const descriptions = ['晴天', '多云', '小雨', '阴天', '雾霾'];
    const descIndex = Math.abs(cityHash) % descriptions.length;
    
    // 根据城市名称生成相对固定的温度（避免每次都变化）
    const baseTemp = 15 + (Math.abs(cityHash) % 20); // 15-35度
    const tempVariation = (cityHash % 10) - 5; // -5到+5的变化
    const temperature = Math.max(0, Math.min(40, baseTemp + tempVariation));
    
    return {
      city,
      temperature,
      description: descriptions[descIndex],
      humidity: 50 + (Math.abs(cityHash) % 40), // 50-90%
      windSpeed: 1 + (Math.abs(cityHash) % 8), // 1-8 m/s
      icon: this.getWeatherIcon(descriptions[descIndex])
    };
  }
  
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
  
  private getWeatherIcon(description: string): string {
    const iconMap: { [key: string]: string } = {
      '晴天': '01d',
      '多云': '02d', 
      '小雨': '10d',
      '阴天': '04d',
      '雾霾': '50d'
    };
    return iconMap[description] || '01d';
  }
}
