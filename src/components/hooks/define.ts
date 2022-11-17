import { reactiveComputed } from "@vueuse/core";
import type { ComponentObjectPropsOptions, ExtractPropTypes, SetupContext } from "vue";

export function defineHooks<R, P = ComponentObjectPropsOptions>(_: P, setup: (props: ExtractPropTypes<P>, context: SetupContext) => R) {
  return (props: ExtractPropTypes<P> | (() => ExtractPropTypes<P>), context: SetupContext) => {
    const p = props instanceof Function ? reactiveComputed(() => props()) : props;
    return setup(p, context);
  };
}
