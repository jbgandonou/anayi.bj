import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { Request } from 'express';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { SponsorshipStatus, Role } from '@prisma/client';

const multerStorage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

@Controller('children')
@UseGuards(JwtAuthGuard)
export class ChildrenController {
  constructor(private childrenService: ChildrenService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photo', maxCount: 1 },
        { name: 'birthCertificate', maxCount: 1 },
        { name: 'schoolCertificate', maxCount: 1 },
      ],
      { storage: multerStorage },
    ),
  )
  create(
    @Body() dto: CreateChildDto,
    @Req() req: Request,
    @UploadedFiles()
    files: {
      photo?: Express.Multer.File[];
      birthCertificate?: Express.Multer.File[];
      schoolCertificate?: Express.Multer.File[];
    },
  ) {
    const user = req.user as any;
    const filesPaths = {
      photo: files?.photo?.[0]?.path,
      birthCertificate: files?.birthCertificate?.[0]?.path,
      schoolCertificate: files?.schoolCertificate?.[0]?.path,
    };
    return this.childrenService.create(dto, user.id, filesPaths);
  }

  @Get()
  findAll(
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('village') village?: string,
    @Query('school') school?: string,
    @Query('sponsorshipStatus') sponsorshipStatus?: string,
    @Query('gender') gender?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return this.childrenService.findAll({
      cursor,
      take: take ? parseInt(take) : undefined,
      search,
      village,
      school,
      sponsorshipStatus,
      gender,
      orderBy,
      order,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.childrenService.findOne(id);
  }

  @Patch(':id/sponsorship')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateSponsorship(
    @Param('id') id: string,
    @Body('sponsorshipStatus') status: SponsorshipStatus,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.childrenService.updateSponsorshipStatus(id, status, user.id);
  }
}
