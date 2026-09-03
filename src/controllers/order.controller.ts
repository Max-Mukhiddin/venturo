import { Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { ExtendedRequest } from "../libs/types/member";
import OrderService from "../models/Order.service";
import { OrderStatus } from "../libs/enums/order.enum";
import {
  CreateOrderInput,
  OrderInquiry,
  OrderUpdateInput,
} from "../libs/types/order";

const orderService = new OrderService();
const orderController: T = {};
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("createOrder");
    const input: CreateOrderInput = req.body;
    const result = await orderService.createOrder(req.member, input);

    res.status(HttpCode.CREATED).json({ result });
  } catch (err) {
    console.log("Error, createOrder:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMyOrders");
    const { page, limit, orderStatus } = req.query;

    if (
      orderStatus !== undefined &&
      !Object.values(OrderStatus).includes(orderStatus as OrderStatus)
    ) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER_STATUS);
    }

    const requestedPage = Number(page);
    const requestedLimit = Number(limit);
    const inquiry: OrderInquiry = {
      page:
        Number.isInteger(requestedPage) && requestedPage > 0
          ? requestedPage
          : DEFAULT_PAGE,
      limit:
        Number.isInteger(requestedLimit) && requestedLimit > 0
          ? Math.min(requestedLimit, MAX_LIMIT)
          : DEFAULT_LIMIT,
      orderStatus: orderStatus as OrderStatus,
    };
    console.log("inquiry:", inquiry);
    const result = await orderService.getMyOrders(req.member, inquiry);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMyOrders:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

orderController.getMyOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMyOrder");
    const result = await orderService.getMyOrder(req.member, req.params.id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMyOrder:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateOrder");
    const input: OrderUpdateInput = req.body;
    if (!Object.values(OrderStatus).includes(input.orderStatus)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER_STATUS);
    }
    const result = await orderService.updateOrder(req.member, input);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, updateOrder:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default orderController;
