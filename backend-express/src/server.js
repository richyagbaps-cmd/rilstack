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
  GOOGLE_TEMP_TOKEN_EXPIRES_IN = "15m",
  FRONTEND_GOOGLE_COMPLETE_URL = "http://localhost:3000/signup?provider=google",
  FRONTEND_GOOGLE_SUCCESS_URL = "http://localhost:3000/dashboard",
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
  if (!row) return row;
  const { Password_Hash, PIN_Hash, ...safe } = row;
  return safe;
}

function generateUserId() {
  const random4 = Math.floor(1000 + Math.random() * 9000);
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

function issueGoogleTempToken(payload) {
  return jwt.sign(
    {
      type: "google_temp",
      ...payload,
    },
    JWT_SECRET,
    { expiresIn: GOOGLE_TEMP_TOKEN_EXPIRES_IN },
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
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

async function updateUserRow(rowId, updates) {
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
  if (raw.includes("@")) return findUserByEmail(raw);
  return findUserByPhone(raw);
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
  if (missing.length) {
    return `Missing required fields: ${missing.join(", ")}`;
  }

  if (!isValidNin(payload.NIN)) {
    return "Invalid NIN format. Must be 11 digits.";
  }

  if (payload.BVN && !isValidBvn(payload.BVN)) {
    return "Invalid BVN format. Must be 11 digits.";
  }

  if (!isValidNigerianPhone(payload.Phone)) {
    return "Invalid Nigerian phone number.";
  }

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
    KYC_Status: "pending",
    BVN: base.BVN || "",
    NIN: base.NIN,
    Address: base.Address,
    State: base.State,
    LGA: base.LGA,
    ID_Type: base.ID_Type || "nin",
    ID_Number: base.ID_Number || base.NIN,
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
    Created_At: base.Created_At || now,
    Last_Login: base.Last_Login || now,
    Is_Active: base.Is_Active !== false,
    Login_Count: Number(base.Login_Count || 1),
  };
}

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.post("/auth/register", async (req, res, next) => {
  try {
    const payload = req.body || {};
    const validationError = validateRegistrationFields(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const email = String(payload.Email).trim().toLowerCase();
    const nin = String(payload.NIN).trim();

    const existingNin = await findUserByNin(nin);
    if (existingNin) {
      return res.status(409).json({ error: "NIN already registered" });
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: "Email already registered" });
    }

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
      Login_Count: 1,
    });

    const inserted = await insertUserRow(rowToInsert);
    const stored = {
      ...rowToInsert,
      _id: inserted?._id || inserted?.id || null,
    };

    const token = issueAccessToken(stored);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: sanitizeUser(stored),
    });
  } catch (error) {
    return next(error);
  }
});

app.post("/auth/login", async (req, res, next) => {
  try {
    const { identifier, email, phone, password } = req.body || {};
    const loginIdentifier = String(identifier || email || phone || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: "identifier and password are required" });
    }

    const user = await findUserByEmailOrPhone(loginIdentifier);
    if (!user) {
      return res.status(404).json({ error: "No account found. Please sign up." });
    }

    if (!user.Password_Hash) {
      return res.status(401).json({ error: "This account uses Google sign-in. Use Google login." });
    }

    const valid = await bcrypt.compare(String(password), String(user.Password_Hash));
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const touched = await touchLogin(user);
    const token = issueAccessToken(touched);

    return res.json({
      message: "Login successful",
      token,
      user: sanitizeUser(touched),
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/auth/google", async (req, res, next) => {
  try {
    const mode = String(req.query.mode || "login").trim().toLowerCase();
    const email = String(req.query.email || "").trim().toLowerCase();
    const firstName = String(req.query.first_name || req.query.firstName || "").trim();
    const lastName = String(req.query.last_name || req.query.lastName || "").trim();
    const avatarUrl = String(req.query.avatar_url || req.query.avatarUrl || "").trim();
    const googleId = String(req.query.google_id || req.query.googleId || "").trim();

    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        error: "email, first_name and last_name are required in Google callback placeholder",
      });
    }

    const existing = await findUserByEmail(email);

    if (mode !== "signup") {
      if (!existing) {
        return res.status(404).json({ error: "No account found. Please sign up." });
      }

      const touched = await touchLogin(existing);
      const accessToken = issueAccessToken(touched);

      const redirectUrl = new URL(FRONTEND_GOOGLE_SUCCESS_URL);
      redirectUrl.searchParams.set("token", accessToken);
      redirectUrl.searchParams.set("provider", "google");
      return res.redirect(302, redirectUrl.toString());
    }

    if (existing) {
      const touched = await touchLogin(existing);
      const accessToken = issueAccessToken(touched);
      const redirectUrl = new URL(FRONTEND_GOOGLE_SUCCESS_URL);
      redirectUrl.searchParams.set("token", accessToken);
      redirectUrl.searchParams.set("provider", "google");
      redirectUrl.searchParams.set("existing", "true");
      return res.redirect(302, redirectUrl.toString());
    }

    const tempToken = issueGoogleTempToken({
      email,
      firstName,
      lastName,
      avatarUrl,
      googleId,
    });

    const redirectUrl = new URL(FRONTEND_GOOGLE_COMPLETE_URL);
    redirectUrl.searchParams.set("google_temp_token", tempToken);
    return res.redirect(302, redirectUrl.toString());
  } catch (error) {
    return next(error);
  }
});

app.post("/auth/google/complete", async (req, res, next) => {
  try {
    const {
      google_temp_token: googleTempToken,
      Middle_Name = "",
      Phone,
      NIN,
      BVN = "",
      Address,
      State,
      LGA,
      Occupation,
      Income_Range,
      Source_of_Funds,
      PIN,
      ID_Type = "nin",
      ID_Number,
      Selfie_URL = "",
      ID_Doc_URL = "",
      Privacy_Mode_Enabled = false,
      Biometric_Enabled = false,
      Notification_Prefs = "{}",
    } = req.body || {};

    if (!googleTempToken) {
      return res.status(400).json({ error: "google_temp_token is required" });
    }

    let decoded;
    try {
      decoded = verifyToken(String(googleTempToken));
    } catch {
      return res.status(401).json({ error: "Invalid or expired Google completion token" });
    }

    if (decoded.type !== "google_temp") {
      return res.status(401).json({ error: "Invalid token type for Google completion" });
    }

    if (!Phone || !NIN || !Address || !State || !LGA || !Occupation || !Income_Range || !Source_of_Funds || !PIN) {
      return res.status(400).json({
        error: "Missing required fields for Google registration completion",
      });
    }

    if (!isValidNigerianPhone(Phone)) {
      return res.status(400).json({ error: "Invalid Nigerian phone number." });
    }

    if (!isValidNin(NIN)) {
      return res.status(400).json({ error: "Invalid NIN format. Must be 11 digits." });
    }

    if (BVN && !isValidBvn(BVN)) {
      return res.status(400).json({ error: "Invalid BVN format. Must be 11 digits." });
    }

    const existingNin = await findUserByNin(NIN);
    if (existingNin) {
      return res.status(409).json({ error: "NIN already registered" });
    }

    const existingEmail = await findUserByEmail(decoded.email);
    if (existingEmail) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const pinHash = await bcrypt.hash(String(PIN), 10);

    const rowToInsert = buildDefaultUserRow({
      User_ID: generateUserId(),
      Surname: decoded.lastName,
      First_Name: decoded.firstName,
      Middle_Name: String(Middle_Name || "").trim(),
      Email: String(decoded.email).trim().toLowerCase(),
      Phone: String(Phone).trim(),
      Password_Hash: "",
      PIN_Hash: pinHash,
      Google_ID: String(decoded.googleId || "").trim(),
      Avatar_URL: String(decoded.avatarUrl || "").trim(),
      BVN: String(BVN || "").trim(),
      NIN: String(NIN).trim(),
      Address: String(Address).trim(),
      State: String(State).trim(),
      LGA: String(LGA).trim(),
      ID_Type: String(ID_Type || "nin").trim(),
      ID_Number: String(ID_Number || NIN).trim(),
      Selfie_URL: String(Selfie_URL || "").trim(),
      ID_Doc_URL: String(ID_Doc_URL || "").trim(),
      Occupation: String(Occupation).trim(),
      Income_Range: String(Income_Range).trim(),
      Source_of_Funds: String(Source_of_Funds).trim(),
      Privacy_Mode_Enabled,
      Biometric_Enabled,
      Notification_Prefs,
      Is_Active: true,
      KYC_Status: "pending",
      Login_Count: 1,
    });

    const inserted = await insertUserRow(rowToInsert);
    const stored = {
      ...rowToInsert,
      _id: inserted?._id || inserted?.id || null,
    };

    const token = issueAccessToken(stored);

    return res.status(201).json({
      message: "Google registration completed successfully",
      token,
      user: sanitizeUser(stored),
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

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }

    if (updates.Phone && !isValidNigerianPhone(updates.Phone)) {
      return res.status(400).json({ error: "Invalid Nigerian phone number." });
    }

    if (updates.BVN && !isValidBvn(updates.BVN)) {
      return res.status(400).json({ error: "Invalid BVN format. Must be 11 digits." });
    }

    const { rowId, email, userId } = req.auth;
    let user = null;

    if (rowId) user = await findUserByRowId(rowId);
    if (!user && email) user = await findUserByEmail(email);
    if (!user && userId) user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await updateUserRow(user._id, updates);

    const latest = await findUserByRowId(user._id);

    return res.json({
      message: "Profile updated successfully",
      user: sanitizeUser(latest || { ...user, ...updates }),
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
  return res.status(status).json({ error: message });
});

app.listen(Number(PORT), () => {
  // eslint-disable-next-line no-console
  console.log(`Rilstack SeaTable auth server running on port ${PORT}`);
});
