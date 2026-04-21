declare module "react-youtube" {
  import { Component } from "react";

  interface Options {
    height?: string;
    width?: string;
    playerVars?: {
      autoplay?: 0 | 1;
      rel?: 0 | 1;
      [key: string]: unknown;
    };
  }

  interface YouTubeProps {
    videoId: string;
    opts?: Options;
    className?: string;
    onReady?: (event: unknown) => void;
    onPlay?: (event: unknown) => void;
    onPause?: (event: unknown) => void;
    onEnd?: (event: unknown) => void;
    onError?: (event: unknown) => void;
  }

  export default class YouTube extends Component<YouTubeProps> {}
}
