/**
 * Parse action input into a some proper thing.
 */

import { input } from "@actions-rs/core";

// Parsed action input
export interface Input {
  crate: string;
  version: string;
  useToolCache: boolean;
  accessKey: string;
  secretKey: string;
}

export function get(): Input {
  const crate = input.getInput("crate", { required: true });
  const version = input.getInput("version", { required: true });
  const accessKey = input.getInput("accesskey", { required: true });
  const secretKey = input.getInput("secretkey", { required: true });

  return {
    crate: crate,
    version: version,
    useToolCache: true,
    accessKey,
    secretKey,
  };
}
