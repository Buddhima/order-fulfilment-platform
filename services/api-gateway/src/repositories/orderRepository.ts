// @ts-nocheck

import type { Pool } from "mysql2/promise";
import { IOrderRepository } from "../types/repositoryType";
import { Order } from "../types/resolverTypes";


export class OrderRepository implements IOrderRepository {
  constructor(private readonly pool: Pool) { }

  /**
   * Create Order with items
   */
  async createOrder(order: any) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const [orderResult] = await connection.execute(
        `INSERT INTO orders
       (customer_identifier, destination_postal_code, status)
       VALUES (?, ?, 'PENDING')`,
        [
          order.customerIdentifier,
          order.destinationPostalCode ?? null
        ]
      );

      const orderId = orderResult.insertId;

      const itemSql =
        "INSERT INTO order_items (order_id, sku, quantity) VALUES (?, ?, ?)";

      for (const item of order.items) {
        await connection.execute(itemSql, [
          orderId,
          item.sku,
          item.quantity
        ]);
      }

      await connection.execute(
        `INSERT INTO order_events (order_id, event_type) VALUES (?, 'ORDER_CREATED')`,
        [orderId]
      );

      await connection.commit();

      return {
        id: orderId,
        ...order
      };

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Fetch single order with items
   */
  async getOrderById(id: number | string) {
    const [orders] = await this.pool.execute(
      `SELECT * FROM orders WHERE id = ?`,
      [id]
    );

    if (orders.length === 0) return null;

    const order = orders[0];

    const [items] = await this.pool.execute(
      `SELECT sku, quantity
     FROM order_items
     WHERE order_id = ?`,
      [id]
    );

    return this.mapOrder(order, items);
  }

  /**
   * Fetch all orders
   */
  async getOrders() {

    const [orders] = await this.pool.query(
      `SELECT * FROM orders ORDER BY created_at DESC`
    );

    const [items] = await this.pool.query(
      `SELECT order_id, sku, quantity FROM order_items`
    );

    const itemsByOrder = this.groupItems(items);

    return orders.map(o =>
      this.mapOrder(o, itemsByOrder[o.id] || [])
    );
  }

  async getOrdersByStatus(status: string) {

    const [orders] = await this.pool.query(
      `SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC`, [status]
    );

    const [items] = await this.pool.query(
      `SELECT order_id, sku, quantity FROM order_items`
    );

    const itemsByOrder = this.groupItems(items);

    return orders.map(o =>
      this.mapOrder(o, itemsByOrder[o.id] || [])
    );
  }

  /**
   * Update confirmation data
   */
  async confirmOrder(id: number | string, fraudScore: number | null, shippingAmount: number | null) {

    await this.pool.execute(
      `UPDATE orders
     SET status = 'CONFIRMED',
         fraud_score = ?,
         shipping_amount = ?
     WHERE id = ?`,
      [fraudScore, shippingAmount, id]
    );
  }

  /**
   * Mark order as failed
   */
  async failOrder(id: number | string, error: string | null) {

    await this.pool.execute(
      `UPDATE orders
     SET status = 'FAILED',
         latest_error = ?
     WHERE id = ?`,
      [error, id]
    );
  }

  /**
   * Record event failures 
   */
  async recordOrderEvent(orderId: number | string, eventType: string, eventData: any = null) {

    await this.pool.execute(
      `INSERT INTO order_events (order_id, event_type, event_data)
     VALUES (?, ?, ?)`,
      [
        orderId,
        eventType,
        eventData ? JSON.stringify(eventData) : null
      ]
    );
  }

  async getOrderEvents(orderId: number | string) {

    const [events] = await this.pool.query(
      `SELECT event_type, event_data, created_at
     FROM order_events
     WHERE order_id = ?
     ORDER BY created_at`,
      [orderId]
    );

    return events.map(e => ({
      type: e.event_type,
      data: e.event_data ? JSON.parse(e.event_data) : null,
      createdAt: e.created_at
    }));
  }

  private mapOrder(row, items) {
    return {
      id: row.id,
      customerIdentifier: row.customer_identifier,
      destinationPostalCode: row.destination_postal_code,
      status: row.status,
      fraudScore: row.fraud_score,
      shippingAmount: row.shipping_amount,
      latestError: row.latest_error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      items
    };
  }

  private groupItems(rows) {

    const map = {};

    for (const r of rows) {
      if (!map[r.order_id]) map[r.order_id] = [];

      map[r.order_id].push({
        sku: r.sku,
        quantity: r.quantity
      });
    }

    return map;
  }

}