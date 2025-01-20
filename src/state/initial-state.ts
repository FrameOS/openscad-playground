// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

// import defaultScad from "./default-scad.ts";
import { Source, State } from "./app-state.ts";

import models from "../models.json";

const defaultScad = models["mark1.scad"];
export const defaultSourcePath = "/mark1.scad";
export const defaultModelColor = "#f9d72c";
// const defaultBlurhash =
//   "|KSPX^%3~qtjMx$lR*x]t7n,R%xuxbM{WBt7ayfk_3bY9FnAt8XOxanjNF%fxbMyIn%3t7NFoLaeoeV[WBo{xar^IoS1xbxcR*S0xbofRjV[j[kCNGofxaWBNHW-xasDR*WTkBxuWBM{s:t7bYahRjfkozWUadofbIW:jZ";

export function createInitialState(
  state: State | null,
  source?: { content?: string; path?: string; url?: string; blurhash?: string }
): State {
  type Mode = State["view"]["layout"]["mode"];

  const mode: Mode = window.matchMedia("(min-width: 768px)").matches
    ? "multi"
    : "single";

  let initialState: State;
  if (state) {
    if (source) throw new Error("Cannot provide source when state is provided");
    initialState = state;
  } else {
    let content, path, url, blurhash;
    // if (source) {
    //   content = source.content;
    //   path = source.path;
    //   url = source.url;
    //   blurhash = source.blurhash;
    // } else {
    //   content = models["mark1.scad"];
    //   path = defaultSourcePath;
    //   blurhash = defaultBlurhash;
    // }

    const sources: Source[] = Object.entries(models).map(([path, content]) => ({
      path: `/${path}`,
      content,
    }));

    let activePath =
      path ??
      (url && new URL(url).pathname.split("/").pop()) ??
      defaultSourcePath;

    initialState = {
      params: {
        activePath,
        sources,
        features: [],
        exportFormat2D: "svg",
        exportFormat3D: "stl",
      },
      view: {
        layout: {
          mode: "multi",
          editor: true,
          viewer: true,
          customizer: false,
        } as any,

        color: defaultModelColor,
      },
      preview: blurhash ? { blurhash } : undefined,
    };
  }

  if (initialState.view.layout.mode != mode) {
    if (mode === "multi" && initialState.view.layout.mode === "single") {
      initialState.view.layout = {
        mode,
        editor: true,
        viewer: true,
        customizer: initialState.view.layout.focus == "customizer",
      };
    } else if (mode === "single" && initialState.view.layout.mode === "multi") {
      initialState.view.layout = {
        mode,
        focus: initialState.view.layout.viewer
          ? "viewer"
          : initialState.view.layout.customizer
          ? "customizer"
          : "editor",
      };
    }
  }

  initialState.view.showAxes ??= true;

  // fs.writeFile(initialState.params.sourcePath, initialState.params.source);
  // if (initialState.params.sourcePath !== defaultSourcePath) {
  //   fs.writeFile(defaultSourcePath, defaultScad);
  // }

  const defaultFeatures = ["lazy-union"];
  defaultFeatures.forEach((f) => {
    if (initialState.params.features.indexOf(f) < 0)
      initialState.params.features.push(f);
  });

  return initialState;
}

export function getBlankProjectState() {
  return createInitialState(null, {
    path: defaultSourcePath,
    content: defaultScad,
  });
}
