import { AxiosInstance } from "axios";

export interface ConcurrencyInstance {
  queue: [];
  running: [];
  shiftInitial: () => void;
  push: (reqHandler: never) => void;
  shift: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestHandler: (req: any) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseHandler: (res: any) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseErrorHandler: (res: any) => Promise<any>;
  interceptors: {
    request: null;
    response: null;
  };
  detach: () => void;
}

export const ConcurrencyManager = (
  axios: AxiosInstance,
  MAX_CONCURRENT = 10
) => {
  if (MAX_CONCURRENT < 1)
    throw "Concurrency Manager Error: minimun concurrent requests is 1";
  const instance: ConcurrencyInstance = {
    queue: [],
    running: [],
    shiftInitial: () => {
      setTimeout(() => {
        if (instance.running.length < MAX_CONCURRENT) {
          instance.shift();
        }
      }, 0);
    },
    push: (reqHandler: never) => {
      instance.queue.push(reqHandler);
      instance.shiftInitial();
    },
    shift: () => {
      if (instance.queue.length) {
        const queued = instance.queue.shift();
        if (queued) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          queued.resolver(queued.request);
          instance.running.push(queued);
        }
      }
    },
    // Use as interceptor. Queue outgoing requests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requestHandler: (req: any) => {
      return new Promise(resolve => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        instance.push({ request: req, resolver: resolve });
      });
    },
    // Use as interceptor. Execute queued request upon receiving a response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responseHandler: (res: any) => {
      instance.running.shift();
      instance.shift();
      return res;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responseErrorHandler: (res: any) => {
      return Promise.reject(instance.responseHandler(res));
    },
    interceptors: {
      request: null,
      response: null
    },
    detach: () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      axios.interceptors.request.eject(instance.interceptors.request);
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      axios.interceptors.response.eject(instance.interceptors.response);
    }
  };
  // queue concurrent requests
  instance.interceptors.request = axios.interceptors.request.use(
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    instance.requestHandler
  );
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  instance.interceptors.response = axios.interceptors.response.use(
    instance.responseHandler,
    instance.responseErrorHandler
  );
  return instance;
};
