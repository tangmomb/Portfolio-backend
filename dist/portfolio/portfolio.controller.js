"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioController = void 0;
const common_1 = require("@nestjs/common");
const portfolio_service_1 = require("./portfolio.service");
let PortfolioController = class PortfolioController {
    portfolioService;
    constructor(portfolioService) {
        this.portfolioService = portfolioService;
    }
    async getWebsites() {
        return this.portfolioService.getWebsites();
    }
    async getDesigns() {
        return this.portfolioService.getDesigns();
    }
    async getVideos() {
        return this.portfolioService.getVideos();
    }
    async getPhotos() {
        return this.portfolioService.getPhotos();
    }
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
};
exports.PortfolioController = PortfolioController;
__decorate([
    (0, common_1.Get)('websites'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "getWebsites", null);
__decorate([
    (0, common_1.Get)('designs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "getDesigns", null);
__decorate([
    (0, common_1.Get)('videos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "getVideos", null);
__decorate([
    (0, common_1.Get)('photos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "getPhotos", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "getAll", null);
exports.PortfolioController = PortfolioController = __decorate([
    (0, common_1.Controller)('portfolio'),
    __metadata("design:paramtypes", [portfolio_service_1.PortfolioService])
], PortfolioController);
//# sourceMappingURL=portfolio.controller.js.map