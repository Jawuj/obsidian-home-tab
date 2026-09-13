import type { App as ObsidianApp, Plugin as ObsidianPlugin, WorkspaceSplit } from 'obsidian';

declare global {
  const app: ObsidianApp;
  type Plugin_2 = ObsidianPlugin;
}

declare module 'obsidian' {
  interface Plugin_2 extends ObsidianPlugin {}
  export { Plugin_2 };
}
