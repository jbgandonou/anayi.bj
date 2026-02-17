import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    childId: string,
    file: Express.Multer.File,
    type: DocumentType,
  ) {
    return this.prisma.document.create({
      data: {
        type,
        fileName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        childId,
      },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) {
      throw new NotFoundException('Document non trouvé');
    }
    return doc;
  }

  async getFilePath(id: string): Promise<{ path: string; mimeType: string; fileName: string }> {
    const doc = await this.findOne(id);
    const fullPath = path.resolve(doc.filePath);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('Fichier non trouvé sur le disque');
    }

    return { path: fullPath, mimeType: doc.mimeType, fileName: doc.fileName };
  }

  async delete(id: string) {
    const doc = await this.findOne(id);

    // Supprimer le fichier du disque
    const fullPath = path.resolve(doc.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    return this.prisma.document.delete({ where: { id } });
  }

  saveUploadedFile(file: Express.Multer.File): string {
    return file.path;
  }
}
