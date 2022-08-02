import { Request, Response, NextFunction } from "express"

type Handler = (req: Request<any, any, any, any>, res: Response, next: NextFunction) => Promise<void>

const catchAsync = (handler: Handler)  => (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(err => next(err))
}

export default catchAsync;