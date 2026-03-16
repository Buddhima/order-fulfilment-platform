export interface RuntimeConfig {
  port: number;
  corsOrigin: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  inventoryServiceAddress: string;
  shippingServiceAddress: string;
  fraudServiceAddress: string;
}