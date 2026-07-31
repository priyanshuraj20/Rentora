  import { Queue } from "bullmq";
  import { redisConnection } from "../config/redis"; //bullmq ko redis chiaye isliye whi connection reuse kiya 

  //creating emailQueue
  export const emailQueue = new Queue("emailQueue", {
    connection: redisConnection as any,
  });
  //creating bookigStatus queue
  export const bookingStatusQueue = new Queue("bookingStatusQueue", {
    connection: redisConnection as any,
  });
