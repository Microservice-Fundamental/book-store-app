import request from "supertest";
import { Container } from "inversify";
import mongoose from "mongoose";

import { App } from "../../app";
import { natsClient } from "../../connections/nats-client";
import { Book } from "../../models/book";
import { configure } from "../../ioc";
jest.setTimeout(60000);

const container = new Container();
configure(container);
const app = new App(container);
app.initialMiddleware();
const server = app.server;

describe("Update book", () => {
    it("return a 404 if the provided id does not exist", async () => {
        const id = new mongoose.Types.ObjectId().toHexString();
        const cookie = await global.getCookie();

        await request(server)
            .put(`/api/books/${id}`)
            .set("Cookie", cookie)
            .send({
                title: "tram nam khong quen",
                price: 10
            })
            .expect(404);
    });

    it("returns a 401 if the user is not authenticated", async () => {
        const id = new mongoose.Types.ObjectId().toHexString();

        await request(server)
            .put(`/api/books/${id}`)
            .send({
                title: "tram nam khong quen",
                price: 10
            })
            .expect(401);
    });

    it("return a 401 if the user not own the book", async () => {
        const cookie = await global.getCookie();

        const response = await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({
                title: "tram nam khong quen",
                price: 10
            });

        const cookieNewUser = await global.getCookie();
        await request(server)
            .put(`/api/books/${response.body.id}`)
            .set("Cookie", cookieNewUser)
            .send({
                title: "tram nam khong quen",
                price: 10
            })
            .expect(401);
    });

    it("returns a 400 if the user provides an invalid title or price", async () => {
        const cookie = await global.getCookie();

        const response = await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({
                title: "tram nam khong quen",
                price: 10
            });

        await request(server)
            .put(`/api/books/${response.body.id}`)
            .set("Cookie", cookie)
            .send({
                title: "",
                price: 20
            })
            .expect(400);

        await request(server)
            .put(`/api/books/${response.body.id}`)
            .set("Cookie", cookie)
            .send({
                title: "tram nam khong quen",
                price: -20
            })
            .expect(400);
    });

    it("updates the book provided valid inputs", async () => {
        const cookie = await global.getCookie();

        const response = await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({
                title: "tram nam khong quen",
                price: 10
            });

        await request(server)
            .put(`/api/books/${response.body.id}`)
            .set("Cookie", cookie)
            .send({
                title: "new title",
                price: 50
            })
            .expect(200);

        const bookResponse = await request(server)
            .get(`/api/books/${response.body.id}`)
            .send();

        expect(bookResponse.body.title).toEqual("new title");
        expect(bookResponse.body.price).toEqual(50);
    });

    it("publishing an event", async () => {
        const cookie = await global.getCookie();

        const response = await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({
                title: "tram nam khong quen",
                price: 10
            });

        await request(server)
            .put(`/api/books/${response.body.id}`)
            .set("Cookie", cookie)
            .send({
                title: "new title",
                price: 50
            })
            .expect(200);

        const bookResponse = await request(server)
            .get(`/api/books/${response.body.id}`)
            .send();

        expect(bookResponse.body.title).toEqual("new title");
        expect(bookResponse.body.price).toEqual(50);
        expect(natsClient.client.publish).toHaveBeenCalled();
    });

    it("Rejects updates if the book is reserved", async () => {
        const cookie = await global.getCookie();

        const response = await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({
                title: "tram nam khong quen",
                price: 10
            });

        const book = await Book.findById(response.body.id);
        book!.set({
            orderId: new mongoose.Types.ObjectId().toHexString()
        });
        await book!.save();

        await request(server)
            .put(`/api/books/${response.body.id}`)
            .set("Cookie", cookie)
            .send({
                title: "new title",
                price: 50
            })
            .expect(400);
    });
});
