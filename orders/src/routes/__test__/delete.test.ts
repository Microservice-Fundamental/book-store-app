import mongoose from 'mongoose';import request from 'supertest';import { OrderStatus } from "@hh-bookstore/common";import { app } from '../../app';import { Book } from "../../models/book";import { Order } from "../../models/order";const createBook = async () => {    const book = Book.build({        title: 'tram nam khong quen',        price: 20    })    return await book.save();};it('returns a 404 if the order is not found', async () => {    const orderId = new mongoose.Types.ObjectId().toHexString();    await request(app)        .delete(`/api/books/${orderId}`)        .send()        .expect(404);});it('returns an error if one user tries to delete another users order', async () => {    const userOne = await global.getCookie();    const userTwo = await global.getCookie();    const book = await createBook();    const { body: order } = await request(app).post('/api/orders')        .set('Cookie', userOne)        .send({            bookId: book.id        })        .expect(201);    await request(app).delete(`/api/orders/${order.id }`)        .set('Cookie', userTwo)        .send()        .expect(401);})it('delete the order if the order is found and is authorised', async () => {    const cookie = await global.getCookie();    const book = Book.build({        title: 'TNKQ',        price: 20    })    await book.save();    const { body: order } = await request(app).post('/api/orders')        .set('Cookie', cookie)        .send({            bookId: book.id        })        .expect(201)    await request(app).delete(`/api/orders/${order.id }`)        .set('Cookie', cookie)        .send()        .expect(204)    const updatedOrder = await Order.findById(order.id);    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);})it.todo('emits a order cancelled event');