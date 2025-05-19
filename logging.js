import winston from "winston";
import "winston-mongodb";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toLocaleString(
        'en-IN',
        { timeZone: 'Asia/Kolkata' }
      )}),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs.log" }),
    new winston.transports.MongoDB({
      db: "mongodb://localhost:27017/socket-chat",
      level: "info",
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "uncaughtExceptions.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "uncaughtRejections.log" }),
  ],
});

export default logger;
