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
import ProductModel from "../schema/Product.model";
import mongoose, { ClientSession, ObjectId } from "mongoose";
import MemberService from "./Member.service";
import { ProductStatus } from "../libs/enums/product.enum";

interface NormalizedOrderItem {
  productId: ObjectId;
  itemQuantity: number;
}

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly productModel;
  private readonly memberService;

  constructor() {
    this.orderModel = orderModel;
    this.orderItemModel = orderItemModel;
    this.productModel = ProductModel;
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

    const normalizedItems = this.normalizeOrderItems(items);
    const session = await mongoose.startSession();
    try {
      let newOrder: Order | undefined;

      await session.withTransaction(async () => {
        const orderItems = await this.reserveStockAndPrice(
          normalizedItems,
          session
        );
        const subtotal = orderItems.reduce(
          (total, item) => total + item.itemPrice * item.itemQuantity,
          0
        );
        const orderDelivery = subtotal < 100 ? 5 : 0;

        const createdOrders = await this.orderModel.create(
          [
            {
              orderTotal: subtotal + orderDelivery,
              orderDelivery,
              memberId,
              shippingAddress,
              orderPaymentMethod,
            },
          ],
          { session }
        );
        newOrder = createdOrders[0] as Order;

        await this.orderItemModel.insertMany(
          orderItems.map((item) => ({
            ...item,
            orderId: newOrder!._id,
          })),
          { session }
        );
      });

      if (!newOrder) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
      return newOrder;
    } catch (err) {
      console.log("Error, model:createOrder:", err);
      if (err instanceof Errors) throw err;
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    } finally {
      await session.endSession();
    }
  }

  private normalizeOrderItems(input: OrderItemInput[]): NormalizedOrderItem[] {
    if (!Array.isArray(input) || input.length === 0) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER_ITEM);
    }

    const quantities = new Map<string, NormalizedOrderItem>();
    for (const item of input) {
      if (
        !item ||
        !Number.isInteger(item.itemQuantity) ||
        item.itemQuantity <= 0 ||
        !mongoose.isValidObjectId(item.productId)
      ) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER_ITEM);
      }

      const productId = shapeIntoMongooseIdObjectId(item.productId);
      const existing = quantities.get(productId.toString());
      if (existing) {
        existing.itemQuantity += item.itemQuantity;
      } else {
        quantities.set(productId.toString(), {
          productId,
          itemQuantity: item.itemQuantity,
        });
      }
    }

    return [...quantities.values()];
  }

  private async reserveStockAndPrice(
    items: NormalizedOrderItem[],
    session: ClientSession
  ) {
    const orderItems: Array<{
      productId: ObjectId;
      itemQuantity: number;
      itemPrice: number;
    }> = [];

    for (const item of items) {
      const product = await this.productModel
        .findOneAndUpdate(
          {
            _id: item.productId,
            productStatus: ProductStatus.PROCESS,
            productLeftCount: { $gte: item.itemQuantity },
          },
          { $inc: { productLeftCount: -item.itemQuantity } },
          { new: true, session }
        )
        .exec();

      if (!product) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.PRODUCT_UNAVAILABLE);
      }

      orderItems.push({
        productId: item.productId,
        itemQuantity: item.itemQuantity,
        itemPrice: product.productPrice,
      });
    }

    return orderItems;
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
