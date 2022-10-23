const express = require("express");
const app = express();
const port = 3000;

// pprof
const pprof = require("pprof");
const fs = require("fs");
const dir = "/opt/dumps/example1";

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

// global const leads to memory leak
const requests = [];

app.get("/", (req, res) => {
  requests.push(new Array(10000).fill(1));
  res.send(`Hello World! - current request size : ${requests.length}`);
});

app.get("/heapdump", (req, res) => {
  prof();
  res.send(`triggered profiling`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
