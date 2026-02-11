import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);
  private sheets;

  constructor(private configService: ConfigService) {
    this.initSheets();
  }

  private initSheets() {
    try {
      const credentialsPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
      const spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
      
      this.logger.log(`Initializing Sheets with: CREDENTIALS_PATH=${credentialsPath}, SHEET_ID=${spreadsheetId}`);

      if (!credentialsPath) {
        this.logger.error('GOOGLE_APPLICATION_CREDENTIALS is not defined in environment');
        return;
      }

      const absolutePath = path.isAbsolute(credentialsPath) 
        ? credentialsPath 
        : path.join(process.cwd(), credentialsPath);
      
      this.logger.log(`Checking credentials at: ${absolutePath}`);
      
      if (!fs.existsSync(absolutePath)) {
        this.logger.error(`Credentials file not found at: ${absolutePath}`);
        return;
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: absolutePath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
      this.sheets = google.sheets({ version: 'v4', auth });
      this.logger.log('Google Sheets API initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google Sheets API', error.stack);
    }
  }

  async getSheetData(range: string) {
    const spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
    
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
          // Handle arrays (e.g., technologies) if they are comma-separated in the sheet
          if (header === 'technologies' && typeof value === 'string') {
            value = value ? value.split(',').map(t => t.trim()) : [];
          }
          item[header] = value;
        });
        return item;
      });
      
      this.logger.log(`Successfully fetched ${data.length} items from ${range}`);
      return data;
    } catch (error) {
      this.logger.error(`Error fetching data from range ${range}: ${error.message}`, error.stack);
      return this.getLocalData(range.split('!')[0]);
    }
  }

  private getLocalData(type: string) {
    // Map sheet name to local json filename
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
}