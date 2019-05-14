// @flow
/*eslint quotes: ["error", "double", { "avoidEscape": true }]*/
import semver from "semver";
import { isUnreleasedVersion, prettifyVersion, semverify } from "./utils";

import type { Targets } from "./types";

const wordEnds = (size: number) => {
  return size > 1 ? "s" : "";
};

// Outputs a message that shows which target(s) caused an item to be included:
// transform-foo { "edge":"13", "firefox":"49", "ie":"10" }
export const logPluginOrPolyfill = (
  item: string,
  targetVersions: Targets,
  list: { [key: string]: Targets },
) => {
  const minVersions = list[item] || {};

  const filteredList = Object.keys(targetVersions).reduce((result, env) => {
    const minVersion = minVersions[env];
    const targetVersion = targetVersions[env];

    if (!minVersion) {
      result[env] = prettifyVersion(targetVersion);
    } else {
      const minIsUnreleased = isUnreleasedVersion(minVersion, env);
      const targetIsUnreleased = isUnreleasedVersion(targetVersion, env);

      if (
        !targetIsUnreleased &&
        (minIsUnreleased ||
          semver.lt(targetVersion.toString(), semverify(minVersion)))
      ) {
        result[env] = prettifyVersion(targetVersion);
      }
    }

    return result;
  }, {});

  const formattedTargets = JSON.stringify(filteredList)
    .replace(/,/g, ", ")
    .replace(/^\{"/, '{ "')
    .replace(/"\}$/, '" }');

  console.warn(`  ${item} ${formattedTargets}`);
};

export const logEntryPolyfills = (
  polyfillName: string,
  importPolyfillIncluded: boolean,
  polyfills: Set<string>,
  filename: string,
  polyfillTargets: Targets,
  allBuiltInsList: { [key: string]: Targets },
) => {
  if (!importPolyfillIncluded) {
    console.warn(`\n[${filename}] Import of ${polyfillName} was not found.`);
    return;
  }
  if (!polyfills.size) {
    console.warn(
      `\n[${filename}] Based on your targets, polyfills were not added.`,
    );
    return;
  }

  console.warn(
    `\n[${filename}] Replaced ${polyfillName} entries with the following polyfill${wordEnds(
      polyfills.size,
    )}:`,
  );
  for (const polyfill of polyfills) {
    logPluginOrPolyfill(polyfill, polyfillTargets, allBuiltInsList);
  }
};

export const logUsagePolyfills = (
  polyfills: Set<string>,
  filename: string,
  polyfillTargets: Targets,
  allBuiltInsList: { [key: string]: Targets },
) => {
  if (!polyfills.size) {
    console.warn(
      `\n[${filename}] Based on your code and targets, core-js polyfills were not added.`,
    );
    return;
  }
  console.warn(
    `\n[${filename}] Added following core-js polyfill${wordEnds(
      polyfills.size,
    )}:`,
  );
  for (const polyfill of polyfills) {
    logPluginOrPolyfill(polyfill, polyfillTargets, allBuiltInsList);
  }
};
