/// <reference types="vite/client" />

type BuildInfo = {
  commit: string
  branch: string
  url: string
  isPages: boolean
}

declare const __BUILD_INFO__: BuildInfo
