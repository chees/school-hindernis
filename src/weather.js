// Weersysteem voor School Hindernis

export const WEATHER_TYPES = {
  SUNNY: {
    id: 'SUNNY',
    icon: '☀️',
    label: 'Zonnig & Warm',
    temp: '24°C',
    description: 'De zon schijnt heerlijk warm!',
    recommendedTop: 'TSHIRT', // Korte mouwen
    advice: 'Het is warm vandaag! Een T-shirt met korte mouwen is perfect.'
  },
  RAINY: {
    id: 'RAINY',
    icon: '🌧️',
    label: 'Koud & Regenachtig',
    temp: '11°C',
    description: 'Het regent en het waait koud buiten.',
    recommendedTop: 'SWEATER', // Warme trui
    advice: 'Brrr, het is koud en nat! Trek een warme trui of hoodie aan.'
  },
  CHILLY: {
    id: 'CHILLY',
    icon: '⛅',
    label: 'Fris & Bewolkt',
    temp: '14°C',
    description: 'Er staat een frisse ochtendwind.',
    recommendedTop: 'SWEATER', // Warme trui
    advice: 'Het is behoorlijk fris! Een warme trui houdt je lekker warm.'
  }
};

export class WeatherManager {
  constructor() {
    this.currentWeather = this.pickRandomWeather();
  }

  pickRandomWeather() {
    const types = [WEATHER_TYPES.SUNNY, WEATHER_TYPES.RAINY, WEATHER_TYPES.CHILLY];
    return types[Math.floor(Math.random() * types.length)];
  }

  setWeather(typeKey) {
    if (WEATHER_TYPES[typeKey]) {
      this.currentWeather = WEATHER_TYPES[typeKey];
    }
  }

  getWeather() {
    return this.currentWeather;
  }

  checkOutfit(topType) {
    const isSuitable = (topType === this.currentWeather.recommendedTop);
    let message = '';

    if (isSuitable) {
      if (topType === 'TSHIRT') {
        message = '🌟 Perfect gekozen! Lekker koel in korte mouwen voor deze zonnige dag!';
      } else {
        message = '🌟 Geweldig! Een warme trui is precies wat je nodig hebt tegen de kou!';
      }
    } else {
      if (this.currentWeather.recommendedTop === 'SWEATER') {
        message = '🥶 Oei, korte mouwen bij 11°C? Je krijgt straks kippenvel onderweg naar school!';
      } else {
        message = '🥵 Pfff, een dikke trui bij 24°C zon? Dat wordt flink zweten op school!';
      }
    }

    return {
      isSuitable,
      message,
      recommended: this.currentWeather.recommendedTop
    };
  }
}

export const weather = new WeatherManager();
