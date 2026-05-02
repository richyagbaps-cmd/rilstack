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
  SEATABLE_SERVER = "https://cloud.seatable.io",
  SEATABLE_BASE_UUID,
  SEATABLE_API_TOKEN,
  SEATABLE_USERS_TABLE = "Users",
} = process.env;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment.");
}

if (!SEATABLE_BASE_UUID || !SEATABLE_API_TOKEN) {
  throw new Error("Missing SEATABLE_BASE_UUID or SEATABLE_API_TOKEN in environment.");
}

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
  const { Password_Hash, PIN_Hash, ...safe } = row;
  return safe;
}

function generateUserId() {
  const random4 = Math.random().toString(36).slice(2, 6);
  return `usr_${Date.now()}_${random4}`;
}

function isValidNin(value) {
  return /^\d{11}$/.test(String(value || "").trim());
}

function isValidBvn(value) {
  return /^\d{11}$/.test(String(value || "").trim());
}

function isValidNigerianPhone(value) {
  return /^(\+234|234|0)(7|8|9)\d{9}$/.test(String(value || "").trim());
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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

async function insertRow(row) {
  try {
    const response = await seatableApi.post(
      `/api/v2.1/dtables/${SEATABLE_BASE_UUID}/rows/`,
      {
        table_name: SEATABLE_USERS_TABLE,
        rows: [row],
      },
    );

    const first = response.data.first_row || response.data.rows?.[0] || response.data;
    return first;
  } catch (error) {
    const upstream = error?.response?.data?.error_message || error?.response?.data?.error_msg;
    const message = upstream || error.message || "SeaTable insert error";
    const wrapped = new Error(message);
    wrapped.statusCode = 500;
    throw wrapped;
  }
}

async function updateRow(rowId, updates) {
  try {
    await seatableApi.put(
      `/api/v2.1/dtables/${SEATABLE_BASE_UUID}/rows/${rowId}/`,
      {
        table_name: SEATABLE_USERS_TABLE,
        row: updates,
      },
    );
  } catch (error) {
    const upstream = error?.response?.data?.error_message || error?.response?.data?.error_msg;
    const message = upstream || error.message || "SeaTable update error";
    const wrapped = new Error(message);
    wrapped.statusCode = 500;
    throw wrapped;
  }
}

async function findUserByNin(nin) {
  const safeNin = escapeSql(nin);
  const rows = await runSql(
    `SELECT * FROM ${SEATABLE_USERS_TABLE} WHERE NIN='${safeNin}' LIMIT 1`,
  );
  return rows[0] || null;
}

async function findUserByEmail(email) {
  const safeEmail = escapeSql(String(email).trim().toLowerCase());
  const rows = await runSql(
    `SELECT * FROM ${SEATABLE_USERS_TABLE} WHERE Email='${safeEmail}' LIMIT 1`,
  );
  return rows[0] || null;
}

async function findUserByPhone(phone) {
  const safePhone = escapeSql(String(phone).trim());
  const rows = await runSql(
    `SELECT * FROM ${SEATABLE_USERS_TABLE} WHERE Phone='${safePhone}' LIMIT 1`,
  );
  return rows[0] || null;
}

async function findUserByEmailOrPhone(identifier) {
  const raw = String(identifier || "").trim();
  if (!raw) return null;

  if (raw.includes("@")) {
    return findUserByEmail(raw);
  }

  return findUserByPhone(raw);
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.post("/auth/register", async (req, res, next) => {
  try {
    const {
      Surname,
      First_Name,
      Middle_Name = "",
      Email,
      Phone,
      Password,
      PIN,
      Google_ID = "",
      Avatar_URL = "",
      BVN = "",
      NIN,
      Address,
      State,
      LGA,
      ID_Type = "nin",
      ID_Number = "",
      Selfie_URL = "",
      ID_Doc_URL = "",
      Occupation = "",
      Income_Range = "",
      Source_of_Funds = "",
      Privacy_Mode_Enabled = false,
      Biometric_Enabled = false,
      Notification_Prefs = "{}",
    } = req.body || {};

    if (!Surname || !First_Name || !Email || !Phone || !Password || !PIN || !NIN || !Address || !State || !LGA) {
      return res.status(400).json({ error: "Missing required registration fields" });
    }

    if (!isValidNin(NIN)) {
      return res.status(400).json({ error: "Invalid NIN format. Must be 11 digits." });
    }

    if (BVN && !isValidBvn(BVN)) {
      return res.status(400).json({ error: "Invalid BVN format. Must be 11 digits." });
    }

    if (!isValidNigerianPhone(Phone)) {
      return res.status(400).json({ error: "Invalid Nigerian phone number." });
    }

    const existingNin = await findUserByNin(NIN);
    if (existingNin) {
      return res.status(409).json({ error: "NIN already registered" });
    }

    const existingEmail = await findUserByEmail(Email);
    if (existingEmail) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(String(Password), 10);
    const pinHash = await bcrypt.hash(String(PIN), 10);

    const userId = generateUserId();
    const now = new Date().toISOString();

    const newRow = {
      User_ID: userId,
      Surname: String(Surname).trim(),
      First_Name: String(First_Name).trim(),
      Middle_Name: String(Middle_Name || "").trim(),
      Email: String(Email).trim().toLowerCase(),
      Phone: String(Phone).trim(),
      Password_Hash: passwordHash,
      PIN_Hash: pinHash,
      Google_ID: String(Google_ID || "").trim(),
      Avatar_URL: String(Avatar_URL || "").trim(),
      KYC_Status: "pending",
      BVN: String(BVN || "").trim(),
      NIN: String(NIN).trim(),
      Address: String(Address).trim(),
      State: String(State).trim(),
      LGA: String(LGA).trim(),
      ID_Type: String(ID_Type || "nin").trim(),
      ID_Number: String(ID_Number || NIN).trim(),
      Selfie_URL: String(Selfie_URL || "").trim(),
      ID_Doc_URL: String(ID_Doc_URL || "").trim(),
      Occupation: String(Occupation || "").trim(),
      Income_Range: String(Income_Range || "").trim(),
      Source_of_Funds: String(Source_of_Funds || "").trim(),
      Privacy_Mode_Enabled: Boolean(Privacy_Mode_Enabled),
      Biometric_Enabled: Boolean(Biometric_Enabled),
      Notification_Prefs:
        typeof Notification_Prefs === "string"
          ? Notification_Prefs
          : JSON.stringify(Notification_Prefs || {}),
      Created_At: now,
      Last_Login: now,
      Is_Active: true,
      Login_Count: 1,
    };

    const inserted = await insertRow(newRow);
    const rowId = inserted?._id || inserted?.id || null;

    const token = signToken({
      userId,
      rowId,
      email: newRow.Email,
      phone: newRow.Phone,
      nin: newRow.NIN,
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        User_ID: userId,
        _id: rowId,
      },
      token,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/auth/login", async (req, res, next) => {
  try {
    const { identifier, email, phone, password } = req.body || {};
    const loginIdentifier = identifier || email || phone;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: "identifier and password are required" });
    }

    const user = await findUserByEmailOrPhone(loginIdentifier);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const ok = await bcrypt.compare(String(password), String(user.Password_Hash || ""));
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const loginCount = Number(user.Login_Count || 0) + 1;
    const now = new Date().toISOString();

    await updateRow(user._id, {
      Last_Login: now,
      Login_Count: loginCount,
    });

    const token = signToken({
      userId: user.User_ID,
      rowId: user._id,
      email: user.Email,
      phone: user.Phone,
      nin: user.NIN,
    });

    const refreshed = {
      ...user,
      Last_Login: now,
      Login_Count: loginCount,
    };

    return res.json({
      message: "Login successful",
      token,
      user: sanitizeUser(refreshed),
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/profile", authRequired, async (req, res, next) => {
  try {
    const { rowId, email, userId } = req.auth;

    let user = null;

    if (rowId) {
      const rows = await runSql(
        `SELECT * FROM ${SEATABLE_USERS_TABLE} WHERE _id='${escapeSql(rowId)}' LIMIT 1`,
      );
      user = rows[0] || null;
    }

    if (!user && email) {
      user = await findUserByEmail(email);
    }

    if (!user && userId) {
      const rows = await runSql(
        `SELECT * FROM ${SEATABLE_USERS_TABLE} WHERE User_ID='${escapeSql(userId)}' LIMIT 1`,
      );
      user = rows[0] || null;
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.put("/profile", authRequired, async (req, res, next) => {
  try {
    const immutable = new Set(["User_ID", "NIN", "Email", "Created_At", "_id", "Password_Hash", "PIN_Hash"]);

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
      "Privacy_Mode_Enabled",
      "Biometric_Enabled",
      "Notification_Prefs",
      "Avatar_URL",
      "Google_ID",
      "KYC_Status",
      "BVN",
      "Is_Active",
    ];

    const incoming = req.body || {};
    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(incoming, field) && !immutable.has(field)) {
        updates[field] = incoming[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }

    if (updates.Phone && !isValidNigerianPhone(updates.Phone)) {
      return res.status(400).json({ error: "Invalid Nigerian phone number." });
    }

    if (updates.BVN && !isValidBvn(updates.BVN)) {
      return res.status(400).json({ error: "Invalid BVN format. Must be 11 digits." });
    }

    const { rowId, email } = req.auth;

    let user = null;
    if (rowId) {
      const rows = await runSql(
        `SELECT * FROM ${SEATABLE_USERS_TABLE} WHERE _id='${escapeSql(rowId)}' LIMIT 1`,
      );
      user = rows[0] || null;
    }

    if (!user && email) {
      user = await findUserByEmail(email);
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await updateRow(user._id, updates);

    const latestRows = await runSql(
      `SELECT * FROM ${SEATABLE_USERS_TABLE} WHERE _id='${escapeSql(user._id)}' LIMIT 1`,
    );

    const latest = latestRows[0] || { ...user, ...updates };

    return res.json({
      message: "Profile updated successfully",
      user: sanitizeUser(latest),
    });
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
  res.status(status).json({ error: message });
});

app.listen(Number(PORT), () => {
  // eslint-disable-next-line no-console
  console.log(`Rilstack SeaTable auth server running on port ${PORT}`);
});
