import { shapeIntoMongooseIdObjectId } from "../libs/config";
import { OrderStatus, PaymentMethod } from "../libs/enums/order.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import { T } from "../libs/types/common";
import {
  CreateOrderInput,
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import orderModel from "../schema/Order.model";
import orderItemModel from "../schema/OrderItem.model";
import mongoose, { ObjectId } from "mongoose";
import MemberService from "./Member.service";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;

  constructor() {
    this.orderModel = orderModel;
    this.orderItemModel = orderItemModel;
    this.memberService = new MemberService();
  }

  public async createOrder(
    member: Member,
    input: CreateOrderInput
  ): Promise<Order> {
    const memberId = shapeIntoMongooseIdObjectId(member._id);
    const { shippingAddress, items } = input;
    const orderPaymentMethod =
      input.orderPaymentMethod ?? PaymentMethod.PAY_ON_DELIVERY;
    if (!Object.values(PaymentMethod).includes(orderPaymentMethod)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
    const amount = items.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);
    const delivery = amount < 100 ? 5 : 0;
    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: memberId,
        shippingAddress: shippingAddress,
        orderPaymentMethod,
      });

      console.log("orderId", newOrder._id);
      const orderId = newOrder._id;
      await this.recordOrderItem(orderId, items);

      return newOrder;
    } catch (err) {
      console.log("Error, model:createOrder:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private async recordOrderItem(
    orderId: ObjectId,
    input: OrderItemInput[]
  ): Promise<void> {
    const promisedList = input.map(async (item: OrderItemInput) => {
      item.orderId = orderId;
      item.productId = shapeIntoMongooseIdObjectId(item.productId);
      await this.orderItemModel.create(item);
      return "INSERTED";
    });

    console.log("promisedList:", promisedList);
    const orderItemState = await Promise.all(promisedList);
    console.log("orderItemState", orderItemState);
  }

  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseIdObjectId(member._id);
    const matches: T = { memberId: memberId };
    if (inquiry.orderStatus) matches.orderStatus = inquiry.orderStatus;

    const result = await this.orderModel
      .aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
        ...this.orderDetailsLookups(),
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async getMyOrder(member: Member, id: string): Promise<Order> {
    const memberId = shapeIntoMongooseIdObjectId(member._id);
    const orderId = this.getOrderObjectId(id);

    const result = await this.orderModel
      .aggregate([
        { $match: { _id: orderId, memberId } },
        ...this.orderDetailsLookups(),
      ])
      .exec();
    if (!result[0]) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result[0];
  }

  public async updateOrder(
    member: Member,
    input: OrderUpdateInput
  ): Promise<Order> {
    if (!Object.values(OrderStatus).includes(input.orderStatus)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER_STATUS);
    }

    const memberId = shapeIntoMongooseIdObjectId(member._id);
    const orderId = this.getOrderObjectId(input.orderId);
    const orderStatus = input.orderStatus;

    const existingOrder = await this.orderModel
      .findOne({ memberId, _id: orderId })
      .exec();
    if (!existingOrder) {
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    }

    if (existingOrder.orderStatus === orderStatus) return existingOrder;

    const allowedTransition =
      (existingOrder.orderStatus === OrderStatus.PENDING &&
        orderStatus === OrderStatus.PROCESS) ||
      ((existingOrder.orderStatus === OrderStatus.PENDING ||
        existingOrder.orderStatus === OrderStatus.PROCESS) &&
        orderStatus === OrderStatus.DELETE);
    if (!allowedTransition) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }

    const result = await this.orderModel
      .findOneAndUpdate(
        {
          memberId,
          _id: orderId,
          orderStatus: existingOrder.orderStatus,
        },
        { orderStatus: orderStatus },
        { new: true }
      )
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    if (
      existingOrder.orderStatus !== OrderStatus.PROCESS &&
      orderStatus === OrderStatus.PROCESS
    ) {
      await this.memberService.addUserPoint(member, 1);
    }
    return result;
  }

  private orderDetailsLookups() {
    return [
      {
        $lookup: {
          from: "orderItems",
          localField: "_id",
          foreignField: "orderId",
          as: "orderItems",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
    ];
  }

  private getOrderObjectId(id: string): ObjectId {
    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
    return shapeIntoMongooseIdObjectId(id);
  }
}

export default OrderService;
