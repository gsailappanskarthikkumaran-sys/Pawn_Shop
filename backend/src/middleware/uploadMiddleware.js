import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'pawn_shop_uploads',
        format: async (req, file) => {
            const ext = file.mimetype.split('/')[1];
            return ['jpg', 'png', 'jpeg'].includes(ext) ? ext : 'jpg';
        },
        public_id: (req, file) => `${file.fieldname}-${Date.now()}`,
    },
});

const upload = multer({ storage: storage });

export default upload;
