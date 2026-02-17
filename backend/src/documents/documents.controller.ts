import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';
import { DocumentType, Role } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('children/:childId/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${uuidv4()}${ext}`);
        },
      }),
    }),
  )
  upload(
    @Param('childId') childId: string,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File,
    @Body('type') type: DocumentType,
  ) {
    return this.documentsService.create(childId, file, type);
  }

  @Get('documents/:id/download')
  async download(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const { path: filePath, mimeType, fileName } = await this.documentsService.getFilePath(id);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    const fileStream = fs.createReadStream(filePath);
    return new StreamableFile(fileStream);
  }

  @Delete('documents/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }
}
