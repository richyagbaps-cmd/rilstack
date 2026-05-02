require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const {
  PORT = "4000",
  JWT_SECRET,
  JWT_EXPIRES_IN = "7d",
  GOOGLE_PRE_TOKEN_EXPIRES_IN = "15m",
  FRONTEND_URL = "http://localhost:3000",
  FRONTEND_GOOGLE_COMPLETE_URL,
  FRONTEND_GOOGLE_SUCCESS_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  SEATABLE_SERVER = "https://cloud.seatable.io",
  SEATABLE_BASE_UUID,
  SEATABLE_API_TOKEN,
  SEATABLE_USERS_TABLE = "Users",
} = process.env;

if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in environment.");
if (!SEATABLE_BASE_UUID || !SEATABLE_API_TOKEN) {
  throw new Error("Missing SEATABLE_BASE_UUID or SEATABLE_API_TOKEN in environment.");
}

const GOOGLE_AUTH_SCOPE = "openid email profile";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

const seatableApi = axios.create({
  baseURL: SEATABLE_SERVER.replace(/\/+$/, ""),
  timeout: 20000,
  headers: {
    Authorization: `Token ${SEATABLE_API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

function escapeSql(value) {
  return String(value).replace(/'/g, "''");
}

function sanitizeUser(row) {
  if (!row) return row;
  const { Password_Hash, PIN_Hash, ...safe } = row;
  return safe;
}

function generateUserId() {
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `usr_${Date.now()}_${random4}`;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidNin(value) {
  return /^\d{11}$/.test(String(value || "").trim());
}

function isValidBvn(value) {
  return /^\d{11}$/.test(String(value || "").trim());
}

function isValidNigerianPhone(value) {
  return /^(070|080|081|090|091)\d{8}$/.test(String(value || "").trim());
}

function isValidPin(value) {
  return /^\d{4,6}$/.test(String(value || "").trim());
}

function issueAccessToken(userRow) {
  return jwt.sign(
    {
      type: "access",
      userId: userRow.User_ID,
      rowId: userRow._id,
      email: userRow.Email,
      phone: userRow.Phone,
      nin: userRow.NIN,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

function issueGooglePreToken(payload) {
  return jwt.sign(
    {
      type: "google_pre",
      ...payload,
    },
    JWT_SECRET,
    { expiresIn: GOOGLE_PRE_TOKEN_EXPIRES_IN },
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function buildRedirect(pathname) {
  const root = String(FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${root}${pathname}`;
}

async function runSql(sql) {
  try {
    const response = await seatableApi.post(
      `/api-gateway/api/v2/dtables/${SEATABLE_BASE_UUID}/sql/`,
      { sql },
    );
    return response.data.results || response.data.rows || [];
  } catch (error) {
    const upstream = error?.response?.data?.error_message || error?.response?.data?.error_msg;
    const message = upstream || error.message || "SeaTable SQL error";
    const wrapped = new Error(message);
    wrapped.statusCode = 500;
    throw wrapped;
  }
}

async function insertUserRow(row) {
  try {
    const response = await seatableApi.post(`/api/v2.1/dtables/${SEATABLE_BASE_UUID}/rows/`, {
      table_name: SEATABLE_USERS_TABLE,
      rows: [row],
    });

    return response.data.first_row || response.data.rows?.[0] || response.data;
  } catch (error) {
    const upstream = error?.response?.data?.error_message || error?.response?.data?.error_msg;
    const message = upstream || error.message || "SeaTable insert error";
    const wrapped = new Error(message);
    wrapped.statusCode = 500;
    throw wrapped;
  }
}

async function updateUserRow(rowId, updates) {
  try {
    await seatableApi.put(`/api/v2.1/dtables/${SEATABLE_BASE_UUID}/rows/${rowId}/`, {
      table_name: SEATABLE_USERS_TABLE,
      row: updates,
    });
  } catch (error) {
    const upstream = error?.response?.data?.error_message || error?.response?.data?.error_msg;
    const message = upstream || error.message || "SeaTable update error";
    const wrapped = new Error(message);
    wrapped.statusCode = 500;
    throw wrapped;
  }
}

async function findBySqlWhere(whereSql) {
  const rows = await runSql(`SELECT * FROM ${SEATABLE_USERS_TABLE} WHERE ${whereSql} LIMIT 1`);
  return rows[0] || null;
}

async function findUserByNin(nin) {
  return findBySqlWhere(`NIN='${escapeSql(nin)}'`);
}

async function findUserByEmail(email) {
  return findBySqlWhere(`Email='${escapeSql(String(email).trim().toLowerCase())}'`);
}

async function findUserByPhone(phone) {
  return findBySqlWhere(`Phone='${escapeSql(String(phone).trim())}'`);
}

async function findUserById(userId) {
  return findBySqlWhere(`User_ID='${escapeSql(userId)}'`);
}

async function findUserByRowId(rowId) {
  return findBySqlWhere(`_id='${escapeSql(rowId)}'`);
}

async function findUserByEmailOrPhone(identifier) {
  const raw = String(identifier || "").trim();
  if (!raw) return null;
  return raw.includes("@") ? findUserByEmail(raw) : findUserByPhone(raw);
}

async function touchLogin(userRow) {
  const now = new Date().toISOString();
  const nextCount = Number(userRow.Login_Count || 0) + 1;

  await updateUserRow(userRow._id, {
    Last_Login: now,
    Login_Count: nextCount,
  });

  return {
    ...userRow,
    Last_Login: now,
    Login_Count: nextCount,
  };
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    if (decoded.type !== "access") {
      return res.status(401).json({ error: "Invalid token type" });
    }
    req.auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function validateRegistrationFields(payload) {
  const required = [
    "Surname",
    "First_Name",
    "Email",
    "Phone",
    "Password",
    "PIN",
    "NIN",
    "Address",
    "State",
    "LGA",
    "Occupation",
    "Income_Range",
    "Source_of_Funds",
  ];

  const missing = required.filter((field) => !String(payload[field] || "").trim());
  if (missing.length) return `Missing required fields: ${missing.join(", ")}`;

  if (!isValidEmail(payload.Email)) return "Invalid email format.";
  if (!isValidNin(payload.NIN)) return "Invalid NIN format. Must be 11 digits.";
  if (payload.BVN && !isValidBvn(payload.BVN)) return "Invalid BVN format. Must be 11 digits.";
  if (!isValidNigerianPhone(payload.Phone)) {
    return "Invalid phone format. Use Nigerian format e.g. 08012345678.";
  }
  if (!isValidPin(payload.PIN)) return "PIN must be 4-6 digits only.";
  if (String(payload.Password || "").length < 8) return "Password must be at least 8 characters.";

  return null;
}

function buildDefaultUserRow(base) {
  const now = new Date().toISOString();
  return {
    User_ID: base.User_ID,
    Surname: base.Surname,
    First_Name: base.First_Name,
    Middle_Name: base.Middle_Name || "",
    Email: base.Email,
    Phone: base.Phone,
    Password_Hash: base.Password_Hash || "",
    PIN_Hash: base.PIN_Hash || "",
    Google_ID: base.Google_ID || "",
    Avatar_URL: base.Avatar_URL || "",
    KYC_Status: String(base.KYC_Status || "pending").toLowerCase(),
    BVN: base.BVN || "",
    NIN: base.NIN,
    Address: base.Address,
    State: base.State,
    LGA: base.LGA,
    ID_Type: base.ID_Type || "",
    ID_Number: base.ID_Number || "",
    Selfie_URL: base.Selfie_URL || "",
    ID_Doc_URL: base.ID_Doc_URL || "",
    Occupation: base.Occupation || "",
    Income_Range: base.Income_Range || "",
    Source_of_Funds: base.Source_of_Funds || "",
    Privacy_Mode_Enabled: Boolean(base.Privacy_Mode_Enabled),
    Biometric_Enabled: Boolean(base.Biometric_Enabled),
    Notification_Prefs:
      typeof base.Notification_Prefs === "string"
        ? base.Notification_Prefs
        : JSON.stringify(base.Notification_Prefs || {}),
    Login_Count: Number(base.Login_Count || 0),
    Created_At: base.Created_At || now,
    Last_Login: base.Last_Login || now,
    Is_Active: base.Is_Active !== false,
  };
}

async function exchangeGoogleCodeForUser(code) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    const error = new Error("Google OAuth environment is incomplete.");
    error.statusCode = 500;
    throw error;
  }

  const tokenBody = new URLSearchParams({
    code: String(code),
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  }).toString();

  const tokenRes = await axios.post(GOOGLE_TOKEN_URL, tokenBody, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 20000,
  });

  const accessToken = tokenRes.data?.access_token;
  if (!accessToken) {
    const error = new Error("Google token exchange failed.");
    error.statusCode = 500;
    throw error;
  }

  const userInfoRes = await axios.get(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    timeout: 20000,
  });

  const profile = userInfoRes.data || {};
  const email = String(profile.email || "").trim().toLowerCase();
  if (!email) {
    const error = new Error("Google account has no email.");
    error.statusCode = 400;
    throw error;
  }

  return {
    email,
    firstName: String(profile.given_name || "").trim(),
    lastName: String(profile.family_name || "").trim(),
    avatarUrl: String(profile.picture || "").trim(),
    googleId: String(profile.sub || "").trim(),
  };
}

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.post("/auth/register", async (req, res, next) => {
  try {
    const payload = req.body || {};
    const validationError = validateRegistrationFields(payload);
    if (validationError) return res.status(400).json({ error: validationError });

    const email = String(payload.Email).trim().toLowerCase();
    const nin = String(payload.NIN).trim();

    const existingNin = await findUserByNin(nin);
    if (existingNin) return res.status(409).json({ error: "NIN already registered" });

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(String(payload.Password), 10);
    const pinHash = await bcrypt.hash(String(payload.PIN), 10);

    const rowToInsert = buildDefaultUserRow({
      ...payload,
      User_ID: generateUserId(),
      Email: email,
      NIN: nin,
      Password_Hash: passwordHash,
      PIN_Hash: pinHash,
      Is_Active: true,
      KYC_Status: "pending",
      Login_Count: 0,
    });

    const inserted = await insertUserRow(rowToInsert);
    const stored = { ...rowToInsert, _id: inserted?._id || inserted?.id || null };

    const touched = await touchLogin(stored);
    const token = issueAccessToken(touched);

    return res.status(201).json({
      message: "Registration successful. Welcome to Rilstack!",
      token,
      user: {
        User_ID: touched.User_ID,
        Surname: touched.Surname,
        First_Name: touched.First_Name,
        Email: touched.Email,
        KYC_Status: touched.KYC_Status,
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/auth/login", async (req, res, next) => {
  try {
    const { identifier, password } = req.body || {};
    const loginIdentifier = String(identifier || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: "Missing identifier or password" });
    }

    const user = await findUserByEmailOrPhone(loginIdentifier);
    if (!user) {
      return res.status(404).json({
        error: "No account found. Please register.",
        redirect: "/register",
      });
    }

    if (!Boolean(user.Is_Active)) {
      return res.status(403).json({ error: "Account deactivated" });
    }

    if (!user.Password_Hash) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const valid = await bcrypt.compare(String(password), String(user.Password_Hash));
    if (!valid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const touched = await touchLogin(user);
    const token = issueAccessToken(touched);

    return res.status(200).json({
      message: "Login successful. Welcome back!",
      token,
      user: sanitizeUser(touched),
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/auth/google", async (req, res, next) => {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
      return res.status(500).json({ error: "Google OAuth is not configured" });
    }

    const state = Buffer.from(
      JSON.stringify({ ts: Date.now(), nonce: Math.random().toString(36).slice(2) }),
    ).toString("base64url");

    const authUrl = new URL(GOOGLE_AUTH_URL);
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", GOOGLE_AUTH_SCOPE);
    authUrl.searchParams.set("access_type", "online");
    authUrl.searchParams.set("prompt", "select_account");
    authUrl.searchParams.set("state", state);

    return res.redirect(302, authUrl.toString());
  } catch (error) {
    return next(error);
  }
});

app.get("/auth/google/callback", async (req, res, next) => {
  try {
    const code = String(req.query.code || "").trim();
    if (!code) return res.status(400).json({ error: "Missing authorization code" });

    const profile = await exchangeGoogleCodeForUser(code);
    const existing = await findUserByEmail(profile.email);

    if (existing) {
      if (!Boolean(existing.Is_Active)) {
        const loginUrl = buildRedirect("/login?error=deactivated");
        return res.redirect(302, loginUrl);
      }

      const touched = await touchLogin(existing);
      const accessToken = issueAccessToken(touched);

      const successUrl = new URL(
        FRONTEND_GOOGLE_SUCCESS_URL || buildRedirect("/dashboard"),
      );
      successUrl.searchParams.set("token", accessToken);
      return res.redirect(302, successUrl.toString());
    }

    const preToken = issueGooglePreToken({
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.avatarUrl,
      googleId: profile.googleId,
    });

    const completeUrl = new URL(
      FRONTEND_GOOGLE_COMPLETE_URL || buildRedirect("/complete-registration"),
    );
    completeUrl.searchParams.set("pre_token", preToken);
    return res.redirect(302, completeUrl.toString());
  } catch (error) {
    return next(error);
  }
});

app.post("/auth/google/complete", async (req, res, next) => {
  try {
    const {
      pre_token: preToken,
      NIN,
      Phone,
      Middle_Name = "",
      BVN = "",
      Address,
      State,
      LGA,
      Occupation,
      Income_Range,
      Source_of_Funds,
      PIN,
      ID_Type = "",
      ID_Number = "",
      Selfie_URL = "",
      ID_Doc_URL = "",
    } = req.body || {};

    if (!preToken) return res.status(400).json({ error: "pre_token is required" });

    let decoded;
    try {
      decoded = verifyToken(String(preToken));
    } catch {
      return res.status(401).json({ error: "Invalid or expired pre_token" });
    }

    if (decoded.type !== "google_pre") {
      return res.status(401).json({ error: "Invalid token type" });
    }

    const required = [NIN, Phone, Address, State, LGA, Occupation, Income_Range, Source_of_Funds, PIN];
    if (required.some((v) => !String(v || "").trim())) {
      return res.status(400).json({ error: "Missing required completion fields" });
    }

    if (!isValidNin(NIN)) return res.status(400).json({ error: "Invalid NIN format. Must be 11 digits." });
    if (BVN && !isValidBvn(BVN)) {
      return res.status(400).json({ error: "Invalid BVN format. Must be 11 digits." });
    }
    if (!isValidNigerianPhone(Phone)) {
      return res.status(400).json({ error: "Invalid phone format. Use Nigerian format e.g. 08012345678." });
    }
    if (!isValidPin(PIN)) return res.status(400).json({ error: "PIN must be 4-6 digits only." });

    const existingNin = await findUserByNin(String(NIN).trim());
    if (existingNin) return res.status(409).json({ error: "NIN already registered" });

    const existingEmail = await findUserByEmail(String(decoded.email || "").trim().toLowerCase());
    if (existingEmail) return res.status(409).json({ error: "Email already registered" });

    const pinHash = await bcrypt.hash(String(PIN), 10);

    const rowToInsert = buildDefaultUserRow({
      User_ID: generateUserId(),
      Surname: String(decoded.lastName || "").trim(),
      First_Name: String(decoded.firstName || "").trim(),
      Middle_Name: String(Middle_Name || "").trim(),
      Email: String(decoded.email || "").trim().toLowerCase(),
      Phone: String(Phone).trim(),
      Password_Hash: "",
      PIN_Hash: pinHash,
      Google_ID: String(decoded.googleId || "").trim(),
      Avatar_URL: String(decoded.avatarUrl || "").trim(),
      KYC_Status: "pending",
      BVN: String(BVN || "").trim(),
      NIN: String(NIN).trim(),
      Address: String(Address).trim(),
      State: String(State).trim(),
      LGA: String(LGA).trim(),
      ID_Type: String(ID_Type || "").trim(),
      ID_Number: String(ID_Number || "").trim(),
      Selfie_URL: String(Selfie_URL || "").trim(),
      ID_Doc_URL: String(ID_Doc_URL || "").trim(),
      Occupation: String(Occupation).trim(),
      Income_Range: String(Income_Range).trim(),
      Source_of_Funds: String(Source_of_Funds).trim(),
      Is_Active: true,
      Login_Count: 0,
    });

    const inserted = await insertUserRow(rowToInsert);
    const stored = { ...rowToInsert, _id: inserted?._id || inserted?.id || null };
    const touched = await touchLogin(stored);
    const token = issueAccessToken(touched);

    return res.status(201).json({
      message: "Registration successful. Welcome to Rilstack!",
      token,
      user: {
        User_ID: touched.User_ID,
        Surname: touched.Surname,
        First_Name: touched.First_Name,
        Email: touched.Email,
        KYC_Status: touched.KYC_Status,
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/profile", authRequired, async (req, res, next) => {
  try {
    const { rowId, email, userId } = req.auth;

    let user = null;
    if (rowId) user = await findUserByRowId(rowId);
    if (!user && email) user = await findUserByEmail(email);
    if (!user && userId) user = await findUserById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.put("/profile", authRequired, async (req, res, next) => {
  try {
    const immutable = new Set([
      "User_ID",
      "NIN",
      "Email",
      "Created_At",
      "Password_Hash",
      "PIN_Hash",
      "Google_ID",
      "KYC_Status",
      "Is_Active",
      "Login_Count",
    ]);

    const incoming = req.body || {};
    const immutableAttempt = Object.keys(incoming).find((field) => immutable.has(field));
    if (immutableAttempt) {
      return res.status(400).json({
        error: `Field ${immutableAttempt} is immutable and cannot be updated`,
      });
    }

    const allowedFields = [
      "Surname",
      "First_Name",
      "Middle_Name",
      "Phone",
      "Address",
      "State",
      "LGA",
      "ID_Type",
      "ID_Number",
      "Selfie_URL",
      "ID_Doc_URL",
      "Occupation",
      "Income_Range",
      "Source_of_Funds",
      "Avatar_URL",
      "BVN",
      "Privacy_Mode_Enabled",
      "Biometric_Enabled",
      "Notification_Prefs",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(incoming, field)) {
        updates[field] = incoming[field];
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }

    if (updates.Phone && !isValidNigerianPhone(updates.Phone)) {
      return res.status(400).json({ error: "Invalid phone format. Use Nigerian format e.g. 08012345678." });
    }

    if (updates.BVN && !isValidBvn(updates.BVN)) {
      return res.status(400).json({ error: "Invalid BVN format. Must be 11 digits." });
    }

    const { rowId, email, userId } = req.auth;
    let user = null;
    if (rowId) user = await findUserByRowId(rowId);
    if (!user && email) user = await findUserByEmail(email);
    if (!user && userId) user = await findUserById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    await updateUserRow(user._id, updates);
    const latest = await findUserByRowId(user._id);

    return res.status(200).json({ user: sanitizeUser(latest || { ...user, ...updates }) });
  } catch (error) {
    return next(error);
  }
});

app.use((err, req, res, next) => {
  const status = Number(err.statusCode || 500);
  const message = err.message || "Internal server error";
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error("Server error:", err);
  }
  return res.status(status).json({ error: message });
});

app.listen(Number(PORT), () => {
  // eslint-disable-next-line no-console
  console.log(`Rilstack backend running on port ${PORT}`);
});
