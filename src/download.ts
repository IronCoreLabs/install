import os from "os";
import { promises as fs } from "fs";
import path from "path";

import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as http from "@actions/http-client";
import AWS, { Credentials } from "aws-sdk";
import { Options } from "./main";

// Path to the public key of the sign certificate.
// It is resolved either from compiled `dist/index.js` during usual Action run,
// or from this one file and always points to the file at the repo root.
// const CACHE_PUBLIC_KEY = path.resolve(__dirname, "..", "public.pem");

async function resolveVersion(crate: string): Promise<string> {
  const url = `https://crates.io/api/v1/crates/${crate}`;
  const client = new http.HttpClient(
    "@actions-rs (https://github.com/actions-rs/)"
  );

  const resp: {
    result: {
      crate: { newest_version: string };
    } | null;
  } = await client.getJson(url);
  if (resp.result == null) {
    throw new Error("Unable to fetch latest crate version");
  }

  return resp.result["crate"]["newest_version"];
}

function binPath(): string {
  return path.join(os.homedir(), ".cargo", "bin");
}

function targetPath(crate: string): string {
  const filename = `${crate}.zip`;

  return path.join(os.tmpdir(), filename);
}

export async function downloadFromCache(
  crate: string,
  version: string,
  options: Options
): Promise<void> {
  if (version == "latest") {
    core.debug(`Latest version requested for ${crate}, querying crates.io`);
    version = await resolveVersion(crate);
    core.info(`Newest ${crate} version available at crates.io: ${version}`);
  }

  const path = targetPath(crate);
  core.info(path);

  try {
    await fs.access(path);
    core.warning(`Crate ${crate} already exist at ${path}`);
  } catch (error) {
    const runner = options.os;
    const toolCacheKey = `${crate}/${runner}/${crate}-${version}.zip`;
    core.info(
      `Downloading ${crate} == ${version} into ${path} from tool cache key ${toolCacheKey}`
    );

    const creds = new Credentials(options.accessKey, options.secretKey);
    AWS.config.update({ region: "us-west-2", credentials: creds });
    const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    const getObjectRequest = {
      Bucket: "rust-tool-cache",
      Key: toolCacheKey,
      Expires: 30,
    };
    const url = s3.getSignedUrl("getObject", getObjectRequest);
    await tc.downloadTool(url, path);
    const cargoBinPath = binPath();
    core.info(`Extracting files into ${cargoBinPath}`);
    await tc.extractZip(path, cargoBinPath);
    await fs.chmod(path, 0o755);
  }
}
