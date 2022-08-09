import { Router } from 'express'
import controllers from '../controllers'
import { authorizeAdmin } from '../middleware/auth';

const router = Router();

router.post('/login', controllers.signInAdmin)
router.post('/create', authorizeAdmin, controllers.createAdmin)

export default router;