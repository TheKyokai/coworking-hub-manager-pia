import multer from "multer"
import path from "path"

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "images/profile")
  },

  filename: (req: any, file, cb) => {

    const ext = path.extname(file.originalname) || ".png";
    const random = Date.now();

    cb(null, `temp_${random}${ext}`)
  }

})

export const upload = multer({
  storage: storage
})