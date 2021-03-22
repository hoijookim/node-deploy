const { createLogger, format, transports } = require("winston");

// createLogger 메서드로 logger 생성
const logger = createLogger({
  // logger에 대한 설정(level, format, transports)
  // level: 로그 심각도
  level: "info",
  // format: 로그 형식
  format: format.json(),
  // transports: 로그 저장 방식
  transports: [
    new transports.File({ filename: "combined.log" }),
    new transports.File({ filename: "error.log", level: "error" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;
