import * as grpc from "@grpc/grpc-js";

/** Result returned after a gRPC server binds successfully. */
export interface StartedGrpcService {
  /** The bound gRPC server instance. */
  server: grpc.Server;
  /** The resolved port returned by `server.bindAsync(...)`. */
  port: number;
}

/**
 * Bind a gRPC server with insecure credentials and log the bound address.
 * Rejects if the server cannot bind.
 */
export declare function bindGrpcServer(
  server: grpc.Server,
  address: string,
  label: string,
): Promise<StartedGrpcService>;

/**
 * Normalize an unknown thrown value into a `grpc.ServiceError`.
 * Uses `fallbackMessage` when the thrown value is not an `Error`.
 */
export declare function toServiceError(
  error: unknown,
  fallbackMessage: string,
): grpc.ServiceError;

/**
 * Create a `grpc.ServiceError` with an explicit status code and message.
 * Useful for deterministic transport-level mock failures.
 */
export declare function createServiceError(
  code: grpc.status,
  message: string,
  metadata?: grpc.Metadata,
): grpc.ServiceError;

/**
 * Adapt plain sync or async business logic into a unary gRPC handler.
 * Maps the request message into internal input, runs the handler, maps the
 * output into a response message, and converts failures with `toServiceError`.
 */
export declare function handleUnary<TRequest, TInput, TOutput, TResponse>(
  /** Convert the generated request message into an internal input shape. */
  requestMap: (request: TRequest) => TInput,
  /** Execute business logic for the mapped input. */
  handler: (input: TInput) => TOutput | Promise<TOutput>,
  /** Convert the internal result into the generated response message. */
  responseMap: (output: TOutput) => TResponse,
  /** Fallback error text used when the thrown value is not an `Error`. */
  fallbackMessage: string,
): grpc.handleUnaryCall<TRequest, TResponse>;
