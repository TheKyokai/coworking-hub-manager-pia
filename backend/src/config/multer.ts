import multer from "multer"
import path from "path"
import fs from "fs"

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    fs.mkdirSync("images/profile", { recursive: true })
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

const workspaceStorage = multer.diskStorage({

  destination: (req, file, cb) => {
    fs.mkdirSync("images/workspace", { recursive: true })
    cb(null, "images/workspace")
  },

  filename: (req: any, file, cb) => {
    const ext = path.extname(file.originalname) || ".png"
    const random = Date.now()

    cb(null, `temp_ws_${random}${ext}`)
  }

})

export const uploadWorkspace = multer({
  storage: workspaceStorage
})