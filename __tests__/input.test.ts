import * as input from "../src/input";
import os from "os";

const testEnvVars = {
  INPUT_CRATE: "cross",
  INPUT_VERSION: "latest",
  INPUT_ACCESSKEY: "AKIUASth78970",
  INPUT_SECRETKEY: "oeatnsuhonsteahuoeu0oe8",
  INPUT_OS: "ubuntu-22.04",
};

describe("actions-rs/install/input", () => {
  beforeEach(() => {
    for (const key in testEnvVars)
      process.env[key] = testEnvVars[key as keyof typeof testEnvVars];
  });

  afterEach(() => {
    for (const key in testEnvVars) process.env[key] = undefined;
  });

  it("Parses action input into install input", () => {
    const result = input.get();

    expect(result.crate).toBe(testEnvVars.INPUT_CRATE);
    expect(result.version).toBe(testEnvVars.INPUT_VERSION);
    expect(result.accessKey).toBe(testEnvVars.INPUT_ACCESSKEY);
    expect(result.secretKey).toBe(testEnvVars.INPUT_SECRETKEY);
    expect(result.os).toBe(testEnvVars.INPUT_OS);
  });

  it("Defaults the os if it's undefined", () => {
    const nodeOsString = `${os.platform()}-${os.release()}-${os.arch()}`;
    process.env["INPUT_OS"] = undefined;
    const result = input.get();

    expect(result.crate).toBe(testEnvVars.INPUT_CRATE);
    expect(result.version).toBe(testEnvVars.INPUT_VERSION);
    expect(result.accessKey).toBe(testEnvVars.INPUT_ACCESSKEY);
    expect(result.secretKey).toBe(testEnvVars.INPUT_SECRETKEY);
    expect(result.os).toBe(nodeOsString);
  });
});
