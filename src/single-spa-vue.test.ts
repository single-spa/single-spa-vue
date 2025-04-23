import { test, expect, beforeAll } from "vitest";
import singleSpaVue from "./single-spa-vue";
import { createApp, nextTick, ref } from "vue";
import {
  navigateToUrl,
  getAppStatus,
  MOUNTED,
  NOT_MOUNTED,
  triggerAppChange,
  start,
  registerApplication,
  unregisterApplication,
} from "single-spa";

beforeAll(() => {
  start();
});

test("can mount and unmount a vue component as a single-spa-application", async () => {
  let buttonRef,
    unmounted: boolean = false;

  const Root = {
    props: ["mountParcel"],
    setup(props) {
      const count = ref(0);
      return { count };
    },
    template: `
      <button @click="count++" ref="button">
        {{ count }} clicks
      </button>
    `,
    mounted() {
      buttonRef = this.$refs.button;
    },
    unmounted() {
      unmounted = true;
    },
  };

  registerApplication({
    name: "test",
    activeWhen: ["/test"],
    app: singleSpaVue({
      createApp,
      rootComponent: Root,
    }),
  });

  navigateToUrl("/test");
  await triggerAppChange();

  expect(getAppStatus("test")).toBe(MOUNTED);

  const selector = `#${CSS.escape(`single-spa-application:test`)} button`;

  const button = document.querySelector<HTMLButtonElement>(selector);
  expect(button).toBeTruthy();
  expect(button!.isConnected).toBeTruthy();
  expect(unmounted).toBe(false);
  expect(button!.textContent!.trim()).toEqual("0 clicks");
  buttonRef.click();
  await nextTick();
  expect(button!.textContent!.trim()).toEqual("1 clicks");

  navigateToUrl("/");
  await triggerAppChange();

  expect(getAppStatus("test")).toBe(NOT_MOUNTED);
  expect(unmounted).toBe(true);
  expect(document.querySelector(selector)).toBe(null);

  unregisterApplication("test");
});

test(`can mount and unmount vue 2 component`, async () => {});
