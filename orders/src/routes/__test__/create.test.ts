import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { OrderStatus } from "@hh-bookstore/common";
import { Book } from "../../models/book";
import { natsClient } from "../../connections/nats-client";
jest.setTimeout(10000);

describe("Create Routes", () => {
    it("has a route handler listening to /api/orders for post request", async () => {
        const response = await request(app)
            .post("/api/orders")
            .send({});

        expect(response.status).not.toEqual(404);
    });

    it("can only be accessed if the user is signed in", async () => {
        await request(app)
            .post("/api/orders")
            .send({})
            .expect(401);
    });

    it("returns a status other than 401 if the user is signed in", async () => {
        const cookie = await global.getCookie();
        const response = await request(app)
            .post("/api/orders")
            .set("Cookie", cookie)
            .send({});

        expect(response.status).not.toEqual(401);
    });

    // it("return an error if an invalid bookId is provided", async () => {
    //     const cookie = await global.getCookie();
    //
    //     await request(app)
    //         .post("/api/orders")
    //         .set("Cookie", cookie)
    //         .send({
    //             bookId: "",
    //         })
    //         .expect(400)
    //
    //     await request(app)
    //         .post("/api/orders")
    //         .set("Cookie", cookie)
    //         .send({
    //             bookId: 10
    //         })
    //         .expect(400)
    // })

    it("return an error if the book does not exit", async () => {
        const cookie = await global.getCookie();
        const bookId = new mongoose.Types.ObjectId();

        await request(app)
            .post("/api/orders")
            .set("Cookie", cookie)
            .send({
                bookId,
            })
            .expect(404);
    });

    it("return an error if the book is already reserved", async () => {
        const cookie = await global.getCookie();
        const bookId = new mongoose.Types.ObjectId().toHexString();

        const book = Book.build({
            id: bookId,
            title: "tram nam khong quen",
            price: 20
        });
        await book.save();
        const order = Order.build({
            book,
            userId: "123123123",
            status: OrderStatus.Created,
            expiresAt: new Date()
        });
        await order.save();
        await request(app)
            .post("/api/orders")
            .set("Cookie", cookie)
            .send({
                bookId: book.id
            })
            .expect(400);
    });

    it("reserves a book", async () => {
        const cookie = await global.getCookie();
        const bookId = new mongoose.Types.ObjectId().toHexString();

        const book = Book.build({
            id: bookId,
            title: "tram nam khong quen",
            price: 20
        });
        await book.save();
        await request(app)
            .post("/api/orders")
            .set("Cookie", cookie)
            .send({
                bookId: book.id
            })
            .expect(201);
    });

    it("publishes an event", async () => {
        const cookie = await global.getCookie();
        const bookId = new mongoose.Types.ObjectId().toHexString();

        const book = Book.build({
            id: bookId,
            title: "tram nam khong quen",
            price: 20
        });
        await book.save();

        await request(app)
            .post("/api/orders")
            .set("Cookie", cookie)
            .send({
                bookId: book.id
            })
            .expect(201);

        expect(natsClient.client.publish).toHaveBeenCalled();
    });
})
