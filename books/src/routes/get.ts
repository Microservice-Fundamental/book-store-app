import express, { NextFunction, Request, Response } from "express";
import { NotFoundError } from "@hh-bookstore/common";
import { Book } from "../models/book";

const router = express.Router();

router.get("/api/books/:id", async (req: Request, res:Response, next: NextFunction) => {
    const book = await Book.findById(req.params.id);

    if (!book) {
        return next(new NotFoundError());
    }
    res.send(book);
});

export { router as getBookRouter };

