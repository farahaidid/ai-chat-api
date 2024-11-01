import { Injectable } from '@nestjs/common';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class DocumentProcessorService {
  async extractText(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();

    switch (fileExtension) {
      case 'pdf':
        return this.extractFromPDF(file);
      case 'docx':
        return this.extractFromDOCX(file);
      case 'txt':
        return this.extractFromTXT(file);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }

  private async extractFromPDF(file: Express.Multer.File): Promise<string> {
    const dataBuffer = file.buffer;
    const data = await pdf(dataBuffer);
    return data.text;
  }

  private async extractFromDOCX(file: Express.Multer.File): Promise<string> {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  private async extractFromTXT(file: Express.Multer.File): Promise<string> {
    return file.buffer.toString('utf8');
  }
}