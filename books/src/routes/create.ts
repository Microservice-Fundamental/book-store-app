import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
    requireAuth, validateRequest
} from "@hh-bookstore/common";
import { Book } from "../models/book";
import { BookCreatedPublisher } from "../events/publisher/book-created-publisher";
import { natsClient } from "../connections/nats-client";

const router = express.Router();

router.post(
    "/api/books",
    requireAuth,
    [
        body("title")
            .not()
            .isEmpty()
            .withMessage("Title is required"),
        body("price")
            .isFloat({ gt: 0 })
            .withMessage("Price must be greater than 0")
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { title, price } = req.body;

        const book = Book.build({
            title,
            price,
            userId: req.currentUser!.id
        });

        await book.save();

        // Send book-created event to NATs server
        await new BookCreatedPublisher(natsClient.client).publish({
            id: book.id,
            version: book.version,
            title: book.title,
            price: book.price,
            userId: book.userId
        });

        res.status(201).send(book);
    }
);

export { router as createBookRouter };
