/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace Astro {
  interface Locals {
    user?: {
      id: string;
      username: string;
    };
  }
}
