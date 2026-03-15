USE fulfilment;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  customer_identifier VARCHAR(255) NOT NULL,
  destination_postal_code VARCHAR(20),

  status ENUM('PENDING','CONFIRMED','FAILED') NOT NULL DEFAULT 'PENDING',

  fraud_score INT,
  shipping_amount DECIMAL(10,2),

  latest_error TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  order_id BIGINT NOT NULL,
  sku VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,

  CONSTRAINT fk_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

  CONSTRAINT chk_quantity
    CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS order_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,

  order_id BIGINT NOT NULL,

  event_type VARCHAR(100) NOT NULL,

  event_data JSON,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_order_events_order
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE
);