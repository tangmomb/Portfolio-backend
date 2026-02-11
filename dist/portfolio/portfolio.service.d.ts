import { ConfigService } from '@nestjs/config';
export declare class PortfolioService {
    private configService;
    private readonly logger;
    private sheets;
    constructor(configService: ConfigService);
    private initSheets;
    getSheetData(range: string): Promise<any>;
    private getLocalData;
    getWebsites(): Promise<any>;
    getDesigns(): Promise<any>;
    getVideos(): Promise<any>;
    getPhotos(): Promise<any>;
}
