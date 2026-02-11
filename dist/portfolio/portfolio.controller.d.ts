import { PortfolioService } from './portfolio.service';
export declare class PortfolioController {
    private readonly portfolioService;
    constructor(portfolioService: PortfolioService);
    getWebsites(): Promise<any>;
    getDesigns(): Promise<any>;
    getVideos(): Promise<any>;
    getPhotos(): Promise<any>;
    getAll(): Promise<{
        websites: any;
        designs: any;
        videos: any;
        photos: any;
    }>;
}
