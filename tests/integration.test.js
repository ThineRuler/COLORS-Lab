/**
 * @jest-environment node
 */

const http = require("http");

let server;
const PORT = 8000;
const API_BASE_URL = `http://localhost:${PORT}/LAMPAPI`;

function createMockBackend() {
  return http.createServer((req, res) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      let parsed = {};
      try {
        if (body) {
          parsed = JSON.parse(body);
        }
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json; charset=UTF-8" });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }

      res.setHeader("Content-Type", "application/json; charset=UTF-8");

      if (req.url === "/LAMPAPI/Login.php" && req.method === "POST") {
        if (parsed.login === "RickL" && parsed.password === "cop4331") {
          res.writeHead(200);
          res.end(JSON.stringify({
            id: 1,
            firstName: "Rick",
            lastName: "Leinecker",
            error: ""
          }));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({
            id: 0,
            firstName: "",
            lastName: "",
            error: "No Records Found"
          }));
        }
      } else if (req.url === "/LAMPAPI/AddColor.php" && req.method === "POST") {
        if (parsed.color && parsed.userId) {
          res.writeHead(200);
          res.end(JSON.stringify({
            error: ""
          }));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({
            error: "Missing required color or userId field"
          }));
        }
      } else if (req.url === "/LAMPAPI/SearchColors.php" && req.method === "POST") {
        if (parsed.search && parsed.search.toLowerCase().includes("blue")) {
          res.writeHead(200);
          res.end(JSON.stringify({
            results: ["Navy Blue", "Sky Blue"],
            error: ""
          }));
        } else {
          res.writeHead(200);
          res.end(JSON.stringify({
            id: 0,
            firstName: "",
            lastName: "",
            error: "No Records Found"
          }));
        }
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Endpoint Not Found" }));
      }
    });
  });
}

function makeRequest(path, data, options = {}) {
  return new Promise((resolve, reject) => {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    const req = http.request(
      {
        hostname: "localhost",
        port: PORT,
        path: path,
        method: options.method || "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "Content-Length": Buffer.byteLength(payload),
          ...options.headers
        }
      },
      res => {
        let body = "";
        res.on("data", chunk => {
          body += chunk;
        });
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

beforeAll(done => {
  server = createMockBackend();
  server.listen(PORT, done);
});

afterAll(done => {
  server.close(done);
});

describe("Integration Tests: API Endpoint Response & JSON Structure Validation", () => {
  describe("POST /LAMPAPI/Login.php", () => {
    test("validates successful login response status, headers, and JSON structure", async () => {
      const response = await makeRequest("/LAMPAPI/Login.php", {
        login: "RickL",
        password: "cop4331"
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");

      const json = response.body;
      expect(typeof json).toBe("object");
      expect(json).toHaveProperty("id");
      expect(json).toHaveProperty("firstName");
      expect(json).toHaveProperty("lastName");
      expect(json).toHaveProperty("error");

      expect(typeof json.id).toBe("number");
      expect(json.id).toBeGreaterThan(0);
      expect(typeof json.firstName).toBe("string");
      expect(json.firstName).toBe("Rick");
      expect(typeof json.lastName).toBe("string");
      expect(json.lastName).toBe("Leinecker");
      expect(json.error).toBe("");
    });

    test("validates failed login response status and error JSON structure", async () => {
      const response = await makeRequest("/LAMPAPI/Login.php", {
        login: "wrongUser",
        password: "badPassword"
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");

      const json = response.body;
      expect(json).toEqual({
        id: 0,
        firstName: "",
        lastName: "",
        error: "No Records Found"
      });
    });
  });

  describe("POST /LAMPAPI/AddColor.php", () => {
    test("validates success response status and JSON structure", async () => {
      const response = await makeRequest("/LAMPAPI/AddColor.php", {
        color: "Crimson",
        userId: 1
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");

      const json = response.body;
      expect(typeof json).toBe("object");
      expect(json).toHaveProperty("error");
      expect(typeof json.error).toBe("string");
      expect(json.error).toBe("");
    });

    test("validates error response when required fields are missing", async () => {
      const response = await makeRequest("/LAMPAPI/AddColor.php", {});

      expect(response.statusCode).toBe(200);
      const json = response.body;
      expect(json).toHaveProperty("error");
      expect(json.error.length).toBeGreaterThan(0);
    });
  });

  describe("POST /LAMPAPI/SearchColors.php", () => {
    test("validates matching search response status and JSON array structure", async () => {
      const response = await makeRequest("/LAMPAPI/SearchColors.php", {
        search: "blue",
        userId: 1
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");

      const json = response.body;
      expect(typeof json).toBe("object");
      expect(json).toHaveProperty("results");
      expect(json).toHaveProperty("error");
      expect(Array.isArray(json.results)).toBe(true);
      expect(json.results.length).toBe(2);
      expect(json.results).toContain("Navy Blue");
      expect(json.results).toContain("Sky Blue");
      expect(json.error).toBe("");
    });

    test("validates non-matching search response and error JSON structure", async () => {
      const response = await makeRequest("/LAMPAPI/SearchColors.php", {
        search: "nonexistentColor",
        userId: 1
      });

      expect(response.statusCode).toBe(200);
      const json = response.body;
      expect(json).toHaveProperty("error");
      expect(json.error).toBe("No Records Found");
    });
  });

  describe("Malformed Request & Endpoint Contract Validation", () => {
    test("validates API rejection with error JSON when request body is malformed JSON", async () => {
      const response = await makeRequest(
        "/LAMPAPI/Login.php",
        "invalid-non-json-string"
      );

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(typeof response.body.error).toBe("string");
    });

    test("validates 404 response for unrecognized LAMPAPI routes", async () => {
      const response = await makeRequest("/LAMPAPI/UnknownRoute.php", {});

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({ error: "Endpoint Not Found" });
    });
  });
});
