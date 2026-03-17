/// <reference types="vite/client" />

declare module "react-toggle" {
  import { Component, InputHTMLAttributes } from "react";
  interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
    icons?: boolean | { checked: React.ReactNode; unchecked: React.ReactNode };
  }
  export default class Toggle extends Component<ToggleProps> {}
}

declare module "react-toggle/style.css";
