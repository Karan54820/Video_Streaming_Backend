import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    incrementViewCount,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controllers.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// router
//     .route("/")
//     .get(getAllVideos)
//     .post(
//         upload.fields([
//             {
//                 name: "videoFile",
//                 maxCount: 1,
//             },
//             {
//                 name: "thumbnail",
//                 maxCount: 1,
//             },
            
//         ]),
//         publishAVideo
//     );

router.route("/upload-video").post(upload.fields([
                {
                    name: "videofile",
                    maxCount: 1,
                },
                {
                    name: "thumbnail",
                    maxCount: 1,
                },
                
            ]),
            publishAVideo)



router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

router.route("/increment/:videoId").patch(incrementViewCount);

export default router