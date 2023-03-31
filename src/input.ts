/**
 * Parse action input into a some proper thing.
 */
import { input } from "@actions-rs/core";
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
  const osArch = input.getInput("os", { required: false });

  return {
    crate: crate,
    version: version,
    useToolCache: true,
    accessKey,
    secretKey,
    os:
      osArch === "undefined" || osArch === undefined
        ? `${os.platform()}-${os.release()}-${os.arch()}`
        : osArch,
  };
}
