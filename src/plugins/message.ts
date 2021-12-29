import { h, VNode } from "vue";
export type MessageModel = "alert" | "prompt" | "confirm";
export type MessageType = "" | "success" | "info" | "warning" | "error";
type RenderFunc = () => VNode;
type BeforeCloseFunction = (
  result: boolean,
  modal: any,
  close: () => void
) => any;
type ValidatorResult = { valid: boolean; message: string };
type MessageReturn = { result: boolean; value?: string | number };
type Validator = (value: string | number) => ValidatorResult;
export interface MessageOptions {
  successIcon?: string;
  infoIcon?: string;
  warningIcon?: string;
  errorIcon?: string;
  title?: string;
  icon?: string;
  iconSize?: number;
  mode?: MessageModel;
  type?: MessageType;
  content?: string | RenderFunc;
  width?: number | string;
  maxWidth?: number | string;
  className?: string;
  transition?: string;
  beforeClose?: BeforeCloseFunction;
  okLabel?: string;
  cancelLabel?: string;
  inputType?: string;
  inputPlaceholder?: string;
  inputValue?: string | number;
  validator?: Validator;
}
export async function prompt(
  content: string,
  title: string,
  options: MessageOptions
) {
  return { result: true, value: "" } as MessageReturn;
}
