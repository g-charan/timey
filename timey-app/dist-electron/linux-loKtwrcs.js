import process from "node:process";
import { promisify } from "node:util";
import fs from "node:fs";
import childProcess from "node:child_process";
const execFile = promisify(childProcess.execFile);
const readFile = promisify(fs.readFile);
const readlink = promisify(fs.readlink);
const xpropBinary = "xprop";
const xwininfoBinary = "xwininfo";
const xpropActiveArguments = ["-root", "	$0", "_NET_ACTIVE_WINDOW"];
const xpropDetailsArguments = ["-id"];
const processOutput = (output) => {
  const result = {};
  for (const row of output.trim().split("\n")) {
    if (row.includes("=")) {
      const [key, value] = row.split("=");
      result[key.trim()] = value.trim();
    } else if (row.includes(":")) {
      const [key, value] = row.split(":");
      result[key.trim()] = value.trim();
    }
  }
  return result;
};
const parseLinux = ({ stdout, boundsStdout, activeWindowId }) => {
  const result = processOutput(stdout);
  const bounds = processOutput(boundsStdout);
  const windowIdProperty = "WM_CLIENT_LEADER(WINDOW)";
  const resultKeys = Object.keys(result);
  const windowId = resultKeys.indexOf(windowIdProperty) > 0 && Number.parseInt(result[windowIdProperty].split("#").pop(), 16) || activeWindowId;
  const processId = Number.parseInt(result["_NET_WM_PID(CARDINAL)"], 10);
  if (Number.isNaN(processId)) {
    throw new Error("Failed to parse process ID");
  }
  return {
    platform: "linux",
    title: JSON.parse(result["_NET_WM_NAME(UTF8_STRING)"] || result["WM_NAME(STRING)"]) || null,
    id: windowId,
    owner: {
      name: JSON.parse(result["WM_CLASS(STRING)"].split(",").pop()),
      processId
    },
    bounds: {
      x: Number.parseInt(bounds["Absolute upper-left X"], 10),
      y: Number.parseInt(bounds["Absolute upper-left Y"], 10),
      width: Number.parseInt(bounds.Width, 10),
      height: Number.parseInt(bounds.Height, 10)
    }
  };
};
const getActiveWindowId = (activeWindowIdStdout) => Number.parseInt(activeWindowIdStdout.split("	")[1], 16);
const getMemoryUsageByPid = async (pid) => {
  const statm = await readFile(`/proc/${pid}/statm`, "utf8");
  return Number.parseInt(statm.split(" ")[1], 10) * 4096;
};
const getPathByPid = (pid) => readlink(`/proc/${pid}/exe`);
async function getWindowInformation(windowId) {
  const [{ stdout }, { stdout: boundsStdout }] = await Promise.all([
    execFile(xpropBinary, [...xpropDetailsArguments, windowId], { env: { ...process.env, LC_ALL: "C.utf8" } }),
    execFile(xwininfoBinary, [...xpropDetailsArguments, windowId])
  ]);
  const data = parseLinux({
    activeWindowId: windowId,
    boundsStdout,
    stdout
  });
  const [memoryUsage, path] = await Promise.all([
    getMemoryUsageByPid(data.owner.processId),
    getPathByPid(data.owner.processId).catch(() => {
    })
  ]);
  data.memoryUsage = memoryUsage;
  data.owner.path = path;
  return data;
}
async function activeWindow() {
  try {
    const { stdout: activeWindowIdStdout } = await execFile(xpropBinary, xpropActiveArguments);
    const activeWindowId = getActiveWindowId(activeWindowIdStdout);
    if (!activeWindowId) {
      return;
    }
    return getWindowInformation(activeWindowId);
  } catch {
    return void 0;
  }
}
export {
  activeWindow
};
