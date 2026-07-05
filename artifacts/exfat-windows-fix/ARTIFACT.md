# exFAT Windows Fix for Next.js / Webpack

**Kind:** finding · **Category:** infra · **Status:** stable

Building a Next.js/Webpack project from a Windows **exFAT** drive fails with
`EISDIR: illegal operation on a directory, readlink`. The fix: shim `fs.readlink`
via a `-r` preload so the error code webpack expects (`EINVAL`) is restored, *before*
webpack captures the function reference.

---

## Why this exists

exFAT does not support symlinks, so `fs.readlink()` returns `EISDIR` instead of
`EINVAL`. Webpack''s `PackFileCacheStrategy` only handles `EINVAL` — on `EISDIR` it
crashes the build fatally. Patching inside `next.config.mjs` is too late: webpack has
already captured `fs.readlink` before config runs. The reliable fix is a Node `-r`
preload that patches `fs` before anything imports webpack.

## Diagnose

```powershell
fsutil fsinfo volumeinfo D: | Select-String "File System"
# "exFAT" -> this fix applies
```

## Fix

1. Create `fix-exfat.cjs` in the project root:

```javascript
"use strict";
const fs = require("fs");

const _readlink = fs.readlink;
fs.readlink = function (path) {
  const args = Array.prototype.slice.call(arguments, 1);
  const cb = args.pop();
  args.push(function (err) {
    if (err && err.code === "EISDIR") { err.code = "EINVAL"; err.errno = -4071; }
    cb.apply(null, arguments);
  });
  args.unshift(path);
  return _readlink.apply(fs, args);
};

const _readlinkSync = fs.readlinkSync;
fs.readlinkSync = function () {
  try { return _readlinkSync.apply(fs, arguments); }
  catch (err) {
    if (err && err.code === "EISDIR") { err.code = "EINVAL"; err.errno = -4071; }
    throw err;
  }
};

if (fs.promises) {
  const _p = fs.promises.readlink;
  fs.promises.readlink = function () {
    return _p.apply(fs.promises, arguments).catch(function (err) {
      if (err && err.code === "EISDIR") { err.code = "EINVAL"; err.errno = -4071; }
      throw err;
    });
  };
}
```

2. Preload it in `package.json` scripts:

```json
{
  "scripts": {
    "dev": "node -r ./fix-exfat.cjs ./node_modules/next/dist/bin/next dev",
    "build": "node -r ./fix-exfat.cjs ./node_modules/next/dist/bin/next build"
  }
}
```

3. `.gitignore` it — it is machine-specific and a no-op on NTFS/Linux:

```
fix-exfat.cjs
```

## Attempts that FAIL (do not repeat)

- `config.resolve.symlinks = false` — only affects module resolution, not the cache snapshotter.
- `config.cache = false` — `readlink` is called in the compilation phase, not just caching.
- Inline patch in `next.config.mjs` / a webpack callback — too late; webpack already captured the reference.

## Notes

- Safe on NTFS/Linux: `EISDIR` never occurs, so the shim never triggers.
- Verified with Next.js 15 + Payload CMS v3 + Node 22 on a Windows 11 exFAT external drive.

---

*Open source — use it wisely.*