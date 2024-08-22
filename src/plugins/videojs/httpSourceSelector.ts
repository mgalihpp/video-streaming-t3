/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import type { ReactNode } from "react";
import type QualityLevelList from "videojs-contrib-quality-levels/dist/types/quality-level-list";

const MenuButton = videojs.getComponent("MenuButton");
const MenuItem = videojs.getComponent("MenuItem");

interface Options {
  selectable: boolean;
  multiSelectable: boolean;
}

type SourceMenuItemOptions = {
  index: number;
  label: string;
  selected: boolean;
  selectable: boolean;
  multiSelectable: boolean;
  sortVal: number;
  children?: ReactNode[];
  handleClick?: (event: Event) => void;
};
type Quality = QualityLevelList[] & {
  enabled: boolean;
  selectedIndex: number;
  height: number;
  bitrate: number;
};

type VideoJsPlayer = Player & {
  httpSourceSelector?: () => void;
  qualityLevels?: () => Quality;
  videojs_http_source_selector_initialized?: boolean;
  techName_?: string;
  controlBar: {
    getChild: (name: string) => {
      el: () => HTMLElement;
    };
    el: () => HTMLElement;
    addChild: (
      name: string,
      options?: Options,
    ) => {
      el: () => HTMLElement;
    };
  };
};

class SourceMenuItem extends MenuItem {
  constructor(player: VideoJsPlayer, options: SourceMenuItemOptions) {
    super(player, options);
  }

  handleClick(event: Event) {
    console.log("SourceMenuItem clicked");
    const childNodes = this.el()?.parentNode?.children;
    const selected = this.options_ as SourceMenuItemOptions;
    const levels = (
      this.player() as unknown as VideoJsPlayer
    ).qualityLevels?.();

    if (childNodes) {
      for (const child of childNodes) {
        child.classList.remove("vjs-selected");
      }
    }

    if (levels) {
      for (let i = 0; i < levels.length; i++) {
        (levels[i]! as unknown as Quality).enabled = false;
        if (selected.index === levels.length) {
          (levels[i]! as unknown as Quality).enabled = true;
        } else if (selected.index === i) {
          (levels[i]! as unknown as Quality).enabled = true;
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super.handleClick(event);
  }

  buildCSSClass(): string {
    return `vjs-chapters-button ${super.buildCSSClass()}`;
  }
}

class SourceMenuButton extends MenuButton {
  declare options_: SourceMenuItemOptions;
  createEl() {
    return videojs.dom.createEl("div", {
      className:
        "vjs-http-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button",
    });
  }

  buildCSSClass(): string {
    return `${super.buildCSSClass()} vjs-icon-cog`;
  }

  // update() {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  //   return super.update();
  // }

  createItems() {
    this.options_.selectable = true;
    this.options_.multiSelectable = false;

    const qualityLevels: Quality | [] =
      (this.player() as unknown as VideoJsPlayer).qualityLevels?.() ?? [];
    const menuItems: SourceMenuItem[] = [];
    const labels: string[] = [];

    console.log("Quality Levels:", qualityLevels.length);

    for (let i = 0; i < qualityLevels.length; i++) {
      const index = qualityLevels.length - (i + 1);
      const selected =
        index ===
        (this.player() as unknown as VideoJsPlayer).qualityLevels?.()
          .selectedIndex;
      let label = `${index}`;
      let sortVal = index;

      if ((qualityLevels[index]! as unknown as Quality).height) {
        label = `${(qualityLevels[index]! as unknown as Quality).height}p`;
        sortVal = parseInt(
          `${(qualityLevels[index]! as unknown as Quality).height}`,
          10,
        );
      } else if ((qualityLevels[index]! as unknown as Quality).bitrate) {
        label = `${Math.floor((qualityLevels[index]! as unknown as Quality).bitrate / 1e3)} kbps`;
        sortVal = parseInt(
          `${(qualityLevels[index]! as unknown as Quality).bitrate}`,
          10,
        );
      }

      if (labels.includes(label)) {
        continue;
      }

      labels.push(label);
      menuItems.push(
        new SourceMenuItem(this.player_ as VideoJsPlayer, {
          label,
          index,
          selected,
          sortVal,
          selectable: true,
          multiSelectable: false,
        }),
      );
    }

    console.log("Menu Items:", menuItems);

    if (qualityLevels.length > 1) {
      menuItems.push(
        new SourceMenuItem(this.player_ as VideoJsPlayer, {
          label: "Auto",
          index: qualityLevels.length,
          selected: false,
          sortVal: 99999,
          selectable: true,
          multiSelectable: false,
        }),
      );
    }

    return menuItems.sort((a, b) => {
      return (
        (b.options_ as SourceMenuItemOptions).sortVal -
        (a.options_ as SourceMenuItemOptions).sortVal
      );
    });
  }
}

const onPlayerReady = (player: VideoJsPlayer, options: unknown) => {
  player.addClass("vjs-http-source-selector");
  videojs.log("videojs-http-source-selector initialized!");
  videojs.log(`player.techName_: ${player.techName_}`);
  console.log(options);

  if (player.techName_ !== "Html5") return false;

  player.on("loadedmetadata", () => {
    videojs.log("loadedmetadata event");
    if (
      typeof player.videojs_http_source_selector_initialized === "undefined" ||
      player.videojs_http_source_selector_initialized !== true
    ) {
      player.videojs_http_source_selector_initialized = true;
      const controlBar = player.controlBar;
      const fullscreenToggle = controlBar.getChild("fullscreenToggle");

      // Create the SourceMenuButton
      const sourceButton = controlBar.addChild("SourceMenuButton");

      // Insert the SourceMenuButton before the fullscreen toggle
      if (fullscreenToggle) {
        controlBar.el().insertBefore(sourceButton.el(), fullscreenToggle.el());
      } else {
        // If fullscreenToggle is not found, just append it at the end
        controlBar.el().appendChild(sourceButton.el());
      }

      // Debugging the hidden class
      if (sourceButton.el().classList.contains("vjs-hidden")) {
        videojs.log(
          "SourceMenuButton is hidden, attempting to remove vjs-hidden class...",
        );
        sourceButton.el().classList.remove("vjs-hidden");
      }
    }
  });
};

const httpSourceSelector = function (this: VideoJsPlayer, options: Options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions({}, options));
  });
  videojs.registerComponent("SourceMenuButton", SourceMenuButton);
  videojs.registerComponent("SourceMenuItem", SourceMenuItem);
};

videojs.registerPlugin("httpSourceSelector", httpSourceSelector);

export default httpSourceSelector;
