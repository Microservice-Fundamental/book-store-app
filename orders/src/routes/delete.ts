import express, { NextFunction, Request, Response} from "express";
import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from "@hh-bookstore/common";

import { Order } from "../models/order";
import { natsClient } from "../connections/nats-client";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";

const router = express.Router();

router.delete("/api/orders/:orderId", requireAuth, async (req: Request, res:Response, next: NextFunction) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("book");

    if (!order) {
        return next(new NotFoundError());
    }

    if (order.userId !== req.currentUser!.id) {
        return next(new NotAuthorizedError());
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    await new OrderCancelledPublisher(natsClient.client).publish({
        id: order.id,
        version: order.version,
        book: {
            id: order.book.id,
        },
    });

    res.status(204).send(order);
});

export { router as deleteOrderRouter };
