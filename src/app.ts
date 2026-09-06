import cors from "cors";
import express from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { MORGAN_FORMAT } from "./libs/config";

import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";

const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL;

if (isProduction && !frontendUrl) {
  throw new Error("FRONTEND_URL must be configured in production.");
}

let allowedOrigins = ["http://localhost:3000"];
if (isProduction) {
  const frontendOrigin = new URL(frontendUrl as string);
  if (frontendOrigin.protocol !== "https:") {
    throw new Error("FRONTEND_URL must use HTTPS in production.");
  }
  allowedOrigins = [frontendOrigin.origin];
}

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
  uri: String(process.env.MONGO_URL),
  collection: "sessions",
});

/** 1-ENTERANCE **/
const app = express();
if (isProduction) app.set("trust proxy", 1);
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static( "./uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS policy."));
    },
  })
);
app.use(cookieParser());
app.use(morgan(MORGAN_FORMAT));

/** 2-SESSIONS **/
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    cookie: {
      maxAge: 1000 * 3600 * 6, // 6h
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  const sessionInstance = req.session as T;
  res.locals.member = sessionInstance.member;
  next();
});

/** 3-VIEWS **/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** 4-ROUTERS **/
app.use("/admin", routerAdmin); // SSR: EJS
app.use("/", router); // SPA: REACT

export default app;
