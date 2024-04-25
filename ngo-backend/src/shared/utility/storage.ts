import { v4 as uuidv4 } from 'uuid';

import { diskStorage } from 'multer';

import * as path from 'path';

//storage path for fundraiserPage Images
export const storageForFundraiserPage = {
    storage: diskStorage({
        destination: './uploads/fundraiserPageImages',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;

            cb(null, `${filename}${extension}`);
        },
    }),
};

export const storage2 = {
    storage: diskStorage({
        destination: './uploads/80G Certificates',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;

            cb(null, `${filename}${extension}`);
        },
    }),
};

export const storageForProfileImages = {
    storage: diskStorage({
        destination: './uploads/profileImages',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;
            cb(null, `${filename}${extension}`);
        },
    }),
};
