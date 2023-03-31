/**
 * Parse action input into a some proper thing.
 */
import { input } from "@actions-rs/core";
import * as core from "@actions/core";
import os from "os";

// Parsed action input
export interface Input {
  crate: string;
  version: string;
  useToolCache: boolean;
  accessKey: string;
  secretKey: string;
  os: string;
}

export function get(): Input {
  const crate = input.getInput("crate", { required: true });
  const version = input.getInput("version", { required: true });
  const accessKey = input.getInput("accesskey", { required: true });
  const secretKey = input.getInput("secretkey", { required: true });
  let osArch = input.getInput("os", { required: false });
  if (osArch === "undefined" || osArch === undefined) {
    const detected = `${os.platform()}-${os.release()}-${os.arch()}`;
    core.info(`os input not provided, defaulting to ${detected}`);
    osArch = detected;
  }

  return {
    crate: crate,
    version: version,
    useToolCache: true,
    accessKey,
    secretKey,
    os: osArch,
  };
}
