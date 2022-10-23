const express = require("express");
const crypto = require("crypto");
const pprof = require("pprof");
const fs = require("fs");
const dir = "/opt/dumps/example2";

// The average number of bytes between samples.
const intervalBytes = 512 * 1024;
// The maximum stack depth for samples collected.
const stackDepth = 64;
pprof.heap.start(intervalBytes, stackDepth);

// original code came from https://nodejs.org/en/docs/guides/simple-profiling/

async function prof() {
  console.log("start to profile >>>");
  const profile = await pprof.time.profile({
    durationMillis: 5000,
  });

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const buf = await pprof.encode(profile);
  fs.writeFile(`${dir}/wall-${Date.now()}.pb.gz`, buf, (err) => {
    if (err) {
      throw err;
    }
  });
  console.log("<<< finished to profile");
}

async function cpuProfile() {
  console.log("start to collect cpu profile >>>");
  const profile = await pprof.heap.profile();

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const buf = await pprof.encode(profile);
  fs.writeFile(`${dir}/heap-${Date.now()}.pb.gz`, buf, (err) => {
    if (err) {
      throw err;
    }
  });
  console.log("<<< finished to collect cpu profile");
}

const users = {};

const app = express();

app.get("/newUser", (req, res) => {
  let username = req.query.username || "";
  const password = req.query.password || "";

  username = username.replace(/[!@#$%^&*]/g, "");

  if (!username || !password || users[username]) {
    return res.sendStatus(400);
  }

  const salt = crypto.randomBytes(128).toString("base64");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");

  users[username] = { salt, hash };

  res.sendStatus(200);
});

app.get("/auth", (req, res) => {
  let username = req.query.username || "";
  const password = req.query.password || "";

  username = username.replace(/[!@#$%^&*]/g, "");

  if (!username || !password || !users[username]) {
    return res.sendStatus(400);
  }

  const { salt, hash } = users[username];
  const encryptHash = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");

  if (crypto.timingSafeEqual(hash, encryptHash)) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.get("/heapdump", (req, res) => {
  prof().then(() => cpuProfile());
  res.send(`triggered profiling`);
});

const server = app.listen(3000, () => {
  const addr = server.address();
  console.log("under listening: http://%s:%s", addr.address, addr.port);
});
