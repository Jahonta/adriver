import { AdriverBanners } from './entities/adriver-banners';

function bootstrap() {
  new AdriverBanners({
    mainUrl: 'https://adriver.ru',
    banners: [],
  });
}

bootstrap();
