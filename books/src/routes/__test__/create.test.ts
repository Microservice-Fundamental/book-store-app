import request from "supertest";
import { Container } from "inversify";

import { App } from "../../app";
import { Book } from "../../models/book";
import { natsClient } from "../../connections/nats-client";
import { configure } from "../../ioc";
jest.setTimeout(60000);

const container = new Container();
configure(container);
const app = new App(container);
app.initialMiddleware();
const server = app.server;

describe("Create books", () => {
    it("has a route handler listening to /api/books for post request", async () => {
        const response = await request(server)
            .post("/api/books")
            .send({});

        expect(response.status).not.toEqual(404);
    });

    it("can only be accessed if the user is signed in", async () => {
        await request(server)
            .post("/api/books")
            .send({})
            .expect(401);
    });

    it("returns a status other than 401 if the user is signed in", async () => {
        const cookie = await global.getCookie();
        const response = await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({});

        expect(response.status).not.toEqual(401);
    });

    it("return an error if an invalid title is provided", async () => {
        const cookie = await global.getCookie();

        await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({
                title: "",
                price: 10
            })
            .expect(400);

        await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({
                price: 10
            })
            .expect(400);
    });

    it("return an error if an invalid price is provided", async () => {
        const cookie = await global.getCookie();

        await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({
                title: "tram nam khong quen",
                price: -10
            })
            .expect(400);

        await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({
                title: "tram nam khong quen"
            })
            .expect(400);
    });

    it("creates a ticket with valid inputs", async () => {
        const cookie = await global.getCookie();

        let books = await Book.find({});
        expect(books.length).toEqual(0);

        await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({
                title: "tram nam khong quen",
                price: 20
            })
            .expect(201);

        books = await Book.find({});
        expect(books.length).toEqual(1);
        expect(books[0].price).toEqual(20);
    });

    it("publishes an event", async () => {
        const cookie = await global.getCookie();

        await request(server)
            .post("/api/books")
            .set("Cookie", cookie)
            .send({
                title: "tram nam khong quen",
                price: 20
            })
            .expect(201);

        expect(natsClient.client.publish).toHaveBeenCalled();
    });
});
