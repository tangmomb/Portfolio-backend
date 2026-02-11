import { Controller, Get } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('websites')
  async getWebsites() {
    return this.portfolioService.getWebsites();
  }

  @Get('designs')
  async getDesigns() {
    return this.portfolioService.getDesigns();
  }

  @Get('videos')
  async getVideos() {
    return this.portfolioService.getVideos();
  }

  @Get('photos')
  async getPhotos() {
    return this.portfolioService.getPhotos();
  }

  @Get('all')
  async getAll() {
    const [websites, designs, videos, photos] = await Promise.all([
      this.portfolioService.getWebsites(),
      this.portfolioService.getDesigns(),
      this.portfolioService.getVideos(),
      this.portfolioService.getPhotos(),
    ]);

    return {
      websites,
      designs,
      videos,
      photos,
    };
  }
}