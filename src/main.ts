import * as core from "@actions/core";
import * as input from "./input";
import * as download from "./download";
import { Cargo } from "@actions-rs/core";

export interface Options {
  useToolCache: boolean;
  accessKey: string;
  secretKey: string;
  os: string;
}

async function downloadFromToolCache(
  crate: string,
  version: string,
  options: Options
): Promise<void> {
  try {
    await download.downloadFromCache(crate, version, options);
  } catch (error) {
    core.warning(
      `Unable to download ${crate} == ${version} from the tool cache: ${error}`
    );
    throw error;
  }
}

export async function run(
  crate: string,
  version: string,
  options: Options
): Promise<void> {
  try {
    if (options.secretKey === "") {
        core.info("Tool cache secret key was not provided, skipping it");
        throw new Error("Faster installation options failed due to missing secrets");  
    }
    else if (options.useToolCache) {
      try {
        core.info("Tool cache is explicitly enabled via the Action input");
        core.startGroup("Downloading from the tool cache");

        return await downloadFromToolCache(crate, version, options);
      } finally {
        core.endGroup();
      }
    } else {
      core.info("Tool cache is disabled in the Action inputs, skipping it");

      throw new Error("Faster installation options either failed or disabled");
    }
  } catch (error) {
    core.info("Falling back to the `cargo install` command");
    const cargo = await Cargo.get();
    await cargo.installCached(crate, version);
  }
}

async function main(): Promise<void> {
  try {
    const actionInput = input.get();

    await run(actionInput.crate, actionInput.version, {
      useToolCache: actionInput.useToolCache,
      accessKey: actionInput.accessKey,
      secretKey: actionInput.secretKey,
      os: actionInput.os,
    });
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

main();
