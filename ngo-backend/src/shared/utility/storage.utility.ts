import { NotFoundException } from '@nestjs/common';
import * as path from 'path';

import { diskStorage } from 'multer';

import { v4 as uuidv4 } from 'uuid';

//storage path for fundraiserPage Images
export const storageForFundraiserPage = {
  storage: diskStorage({
    destination: './uploads/fundraiserPageImages',
    filename: (req, file, cb) => {
      try {
        const filename: string = path.parse(file?.originalname).name.replace(/\s/g, '') + uuidv4();
        const extension: string = path.parse(file?.originalname).ext;

        cb(null, `${filename}${extension}`);
      } catch (error) {
        console.log(error.message);
        throw new NotFoundException('Filename is not found');
      }
    },
  }),
};

export const storage2 = {
  storage: diskStorage({
    destination: './uploads/80G Certificates',
    filename: (req, file, cb) => {
      const filename: string = path.parse(file?.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file?.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

export const storageForProfileImages = {
  storage: diskStorage({
    destination: './uploads/profileImages',
    filename: (req, file, cb) => {
      const filename: string = path.parse(file?.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file?.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
};
