const ytdlPatch = async () => {
  const fs = await import("fs");
  const fsPromise = await import("fs/promises");
  const { Readable } = await import("stream");
  const { finished } = await import("stream/promises");

  const patchFile = async (file, patchUrl) => {
    const stream = fs.createWriteStream(file);
    const { body } = await fetch(patchUrl);
    return finished(Readable.fromWeb(body).pipe(stream));
  };

  const replaceInFile = (file, find, replace) =>
    fsPromise
      .readFile(file)
      .then((data) => data.toString().replace(find, replace))
      .then((data) => fsPromise.writeFile(file, data));

  // https://github.com/distubejs/ytdl-core/pull/163
  const patchBaseUrl =
    "https://raw.githubusercontent.com/ToddyTheNoobDud/ytdl-core-stuff/37acb1c7ca203bb33c1219bffe5fb2b820b52f69/";
  const buggedInfo = "./node_modules/@distube/ytdl-core/lib/info.js";
  const buggedUtils = "./node_modules/@distube/ytdl-core/lib/utils.js";
  const buggedYoutubeIndex = "./node_modules/@distube/youtube/dist/index.js";
  await patchFile(buggedInfo, patchBaseUrl + "lib/info.js");
  await patchFile(buggedUtils, patchBaseUrl + "lib/utils.js");

  await replaceInFile(
    buggedUtils,
    `["WEB", "WEB_CREATOR", "IOS", "WEBEMBEDDED", "MWEB"]`,
    `["WEB", "WEB_CREATOR", "IOS", "WEBEMBEDDED", "MWEB", "ANDROID"]`
  );

  await replaceInFile(
    buggedYoutubeIndex,
    `const info = await import_ytdl_core.default.getInfo(song.url, this.ytdlOptions);`,
    `let info = await import_ytdl_core.default.getInfo(song.url, this.ytdlOptions);
      info.formats = info.formats.filter((f) => f.hasAudio); /* 403 Error Workaround */`
  );

  console.log(
    `Applied hotfix for DisTubeError "ffmpeg exited with code 1" or 403 Errors`
  );
};

export default ytdlPatch;
