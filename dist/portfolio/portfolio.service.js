"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PortfolioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioService = void 0;
const common_1 = require("@nestjs/common");
const googleapis_1 = require("googleapis");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let PortfolioService = PortfolioService_1 = class PortfolioService {
    configService;
    logger = new common_1.Logger(PortfolioService_1.name);
    sheets;
    constructor(configService) {
        this.configService = configService;
        this.initSheets();
    }
    initSheets() {
        try {
            const credentialsPath = this.configService.get('GOOGLE_APPLICATION_CREDENTIALS');
            const credentialsJson = this.configService.get('GOOGLE_APPLICATION_CREDENTIALS_JSON');
            const credentialsB64 = this.configService.get('GOOGLE_APPLICATION_CREDENTIALS_B64');
            const spreadsheetId = this.configService.get('GOOGLE_SHEET_ID');
            this.logger.log(`Initializing Sheets with: CREDENTIALS_PATH=${credentialsPath}, ` +
                `CREDENTIALS_JSON=${credentialsJson ? 'set' : 'unset'}, ` +
                `CREDENTIALS_B64=${credentialsB64 ? 'set' : 'unset'}, ` +
                `SHEET_ID=${spreadsheetId}`);
            if (!credentialsPath && !credentialsJson && !credentialsB64) {
                this.logger.error('No Google credentials configured. Set GOOGLE_APPLICATION_CREDENTIALS (path) ' +
                    'or GOOGLE_APPLICATION_CREDENTIALS_JSON / GOOGLE_APPLICATION_CREDENTIALS_B64.');
                return;
            }
            let authOptions = {
                scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
            };
            const normalizeCredentials = (creds) => {
                if (creds && typeof creds.private_key === 'string') {
                    creds.private_key = creds.private_key.replace(/\\n/g, '\n');
                }
                return creds;
            };
            if (credentialsJson) {
                try {
                    authOptions.credentials = normalizeCredentials(JSON.parse(credentialsJson));
                }
                catch (error) {
                    this.logger.error('GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON');
                    return;
                }
            }
            else if (credentialsB64) {
                try {
                    const decoded = Buffer.from(credentialsB64, 'base64').toString('utf8');
                    authOptions.credentials = normalizeCredentials(JSON.parse(decoded));
                }
                catch (error) {
                    this.logger.error('GOOGLE_APPLICATION_CREDENTIALS_B64 is not valid base64 JSON');
                    return;
                }
            }
            else if (credentialsPath && credentialsPath.trim().startsWith('{')) {
                try {
                    authOptions.credentials = normalizeCredentials(JSON.parse(credentialsPath));
                }
                catch (error) {
                    this.logger.error('GOOGLE_APPLICATION_CREDENTIALS looks like JSON but is invalid. ' +
                        'Use a single-line JSON string or set a file path.');
                    return;
                }
            }
            else if (credentialsPath) {
                const absolutePath = path.isAbsolute(credentialsPath)
                    ? credentialsPath
                    : path.join(process.cwd(), credentialsPath);
                this.logger.log(`Checking credentials at: ${absolutePath}`);
                if (!fs.existsSync(absolutePath)) {
                    this.logger.error(`Credentials file not found at: ${absolutePath}`);
                    return;
                }
                authOptions.keyFile = absolutePath;
            }
            const auth = new googleapis_1.google.auth.GoogleAuth(authOptions);
            this.sheets = googleapis_1.google.sheets({ version: 'v4', auth });
            this.logger.log('Google Sheets API initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Google Sheets API', error.stack);
        }
    }
    async getSheetData(range) {
        const spreadsheetId = this.configService.get('GOOGLE_SHEET_ID');
        if (!this.sheets) {
            this.logger.warn(`Google Sheets not initialized. Falling back to local JSON for range: ${range}`);
            return this.getLocalData(range.split('!')[0]);
        }
        if (!spreadsheetId || spreadsheetId === 'votre_id_de_sheet_ici') {
            this.logger.warn(`Google Sheet ID not configured or default value used. Falling back to local JSON for range: ${range}`);
            return this.getLocalData(range.split('!')[0]);
        }
        try {
            this.logger.log(`Fetching data from Google Sheets: ${range}`);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });
            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                this.logger.warn(`No data found in range: ${range}`);
                return [];
            }
            const headers = rows[0];
            const data = rows.slice(1).map((row) => {
                const item = {};
                headers.forEach((header, index) => {
                    let value = row[index];
                    if (header === 'technologies' && typeof value === 'string') {
                        value = value ? value.split(',').map(t => t.trim()) : [];
                    }
                    item[header] = value;
                });
                return item;
            });
            this.logger.log(`Successfully fetched ${data.length} items from ${range}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error fetching data from range ${range}: ${error.message}`, error.stack);
            return this.getLocalData(range.split('!')[0]);
        }
    }
    getLocalData(type) {
        const mapping = {
            'website': 'websites.json',
            'design': 'designs.json',
            'video': 'videos.json',
            'photo': 'photos.json'
        };
        const filename = mapping[type.toLowerCase()] || `${type.toLowerCase()}.json`;
        const filePath = path.join(__dirname, '../../../frontend/data', filename);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
        return [];
    }
    async getWebsites() {
        return this.getSheetData('website!A1:Z100');
    }
    async getDesigns() {
        return this.getSheetData('design!A1:Z100');
    }
    async getVideos() {
        return this.getSheetData('video!A1:Z100');
    }
    async getPhotos() {
        return this.getSheetData('photo!A1:Z100');
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = PortfolioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PortfolioService);
//# sourceMappingURL=portfolio.service.js.map