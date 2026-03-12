'use strict';

const grpc = require('@grpc/grpc-js');

async function bindGrpcServer(server, address, label) {
  const port = await new Promise((resolve, reject) => {
    server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (error, boundPort) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(boundPort);
    });
  });

  console.log(`[${label}] gRPC listening on ${address} (port ${port})`);
  return { server, port };
}

function toServiceError(error, fallbackMessage) {
  const serviceError = error && typeof error === 'object' ? error : null;
  const message = serviceError && typeof serviceError.message === 'string'
    ? serviceError.message
    : fallbackMessage;

  return {
    name: serviceError && typeof serviceError.name === 'string' ? serviceError.name : 'UnknownError',
    message,
    details: serviceError && typeof serviceError.details === 'string' ? serviceError.details : message,
    code: serviceError && typeof serviceError.code === 'number' ? serviceError.code : grpc.status.INTERNAL,
    metadata: serviceError && serviceError.metadata instanceof grpc.Metadata ? serviceError.metadata : new grpc.Metadata(),
  };
}

function createServiceError(code, message, metadata = new grpc.Metadata()) {
  const error = new Error(message);
  error.name = 'ServiceError';
  error.code = code;
  error.details = message;
  error.metadata = metadata;
  return error;
}

function handleUnary(requestMap, handler, responseMap, fallbackMessage) {
  return (call, callback) => {
    Promise.resolve()
      .then(() => requestMap(call.request))
      .then((input) => handler(input))
      .then((output) => callback(null, responseMap(output)))
      .catch((error) => callback(toServiceError(error, fallbackMessage)));
  };
}

module.exports = {
  bindGrpcServer,
  createServiceError,
  handleUnary,
  toServiceError,
};
