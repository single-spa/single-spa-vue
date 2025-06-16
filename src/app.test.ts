import { test, expect, beforeAll, afterEach } from "vitest";
import singleSpaVue from "./single-spa-vue";
import {
  createApp,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
} from "vue";
import { createRouter, createWebHistory } from "vue-router";
import {
  navigateToUrl,
  getAppStatus,
  getAppNames,
  AppOrParcelStatus,
  triggerAppChange,
  start,
  registerApplication,
  unregisterApplication,
} from "single-spa";

beforeAll(() => {
  start();
});

afterEach(async () => {
  getAppNames().forEach(unregisterApplication);

  navigateToUrl("/");
  await triggerAppChange();
  await nextTick();
});

test("can mount and unmount a vue component as a single-spa-application", async () => {
  let buttonRef,
    unmounted: boolean = false;

  const Root = {
    props: ["mountParcel"],
    setup(props) {
      buttonRef = useTemplateRef("button");
      onUnmounted(() => {
        unmounted = true;
      });
      const count = ref(0);
      return { count };
    },
    template: `
      <button @click="count++" ref="button">
        {{ count }} clicks
      </button>
    `,
    mounted() {},
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

  expect(getAppStatus("test")).toBe(AppOrParcelStatus.MOUNTED);

  const selector = `#${CSS.escape(`single-spa-application:test`)} button`;

  const button = document.querySelector<HTMLButtonElement>(selector);
  expect(button).toBeTruthy();
  expect(button!.isConnected).toBeTruthy();
  expect(unmounted).toBe(false);
  expect(button!.textContent!.trim()).toEqual("0 clicks");
  buttonRef.value.click();
  await nextTick();
  expect(button!.textContent!.trim()).toEqual("1 clicks");

  navigateToUrl("/");
  await triggerAppChange();

  expect(getAppStatus("test")).toBe(AppOrParcelStatus.NOT_MOUNTED);
  expect(unmounted).toBe(true);
  expect(document.querySelector(selector)).toBe(null);

  unregisterApplication("test");
});

test(`receives single-spa props`, async () => {
  const Root = {
    props: ["name"],
    setup() {},
    template: `
      <p>{{ name }} is the best dog</p>
    `,
  };

  registerApplication({
    name: "Franklin",
    app: singleSpaVue({
      createApp,
      rootComponent: Root,
    }),
    activeWhen: ["/franklin"],
  });

  navigateToUrl("/franklin");

  await triggerAppChange();

  const paragraphElement = document.querySelector<HTMLParagraphElement>("p");
  expect(paragraphElement).toBeTruthy();
  expect(paragraphElement!.textContent!.trim()).toEqual(
    "Franklin is the best dog",
  );

  navigateToUrl("/");
  await triggerAppChange();
  unregisterApplication("Franklin");
});

test(`receives single-spa custom props`, async () => {
  const Root = {
    props: ["bestDog"],
    setup() {},
    template: `
      <p>{{ bestDog }} is the best dog</p>
    `,
  };

  registerApplication({
    name: "test",
    app: singleSpaVue({
      createApp,
      rootComponent: Root,
    }),
    activeWhen: ["/test"],
    customProps: {
      bestDog: "Franklin",
    },
  });

  navigateToUrl("/test");

  await triggerAppChange();

  const paragraphElement = document.querySelector<HTMLParagraphElement>("p");
  expect(paragraphElement).toBeTruthy();
  expect(paragraphElement!.textContent!.trim()).toEqual(
    "Franklin is the best dog",
  );

  navigateToUrl("/");
  await triggerAppChange();
  unregisterApplication("test");
});

test(`Can route`, async () => {
  const Root = {
    setup() {},
    template: `
      <h1>Routes</h1>
      <nav>
        <RouterLink to="/test/home">Home</RouterLink>
        <RouterLink to="/test/dogs">Dogs</RouterLink>
      </nav>
      <main>
        <RouterView />
      </main>
    `,
  };

  const HomeView = {
    setup() {},
    template: `
      <p>Home</p>
    `,
  };

  const DogsView = {
    setup() {},
    template: `
      <div>Dogs</div>
    `,
  };

  const history = createWebHistory();

  const router = createRouter({
    history,
    routes: [
      { path: "/test/home", component: HomeView },
      { path: "/test/dogs", component: DogsView },
    ],
  });

  let routerNavigationResolve: ((val?: unknown) => void) | null = null;

  router.afterEach(() => {
    if (routerNavigationResolve) {
      routerNavigationResolve();
    }
  });

  registerApplication({
    name: "test",
    app: singleSpaVue({
      createApp,
      rootComponent: Root,
      setupInstance(app) {
        app.use(router);
      },
    }),
    activeWhen(location) {
      return location.pathname.startsWith("/test");
    },
  });

  router.push("/test/home");
  navigateToUrl("/test/home");
  await triggerAppChange();
  await new Promise((resolve) => {
    routerNavigationResolve = resolve;
  });

  expect(getAppStatus("test")).toEqual(AppOrParcelStatus.MOUNTED);
  expect(document.querySelector("h1")?.textContent).toEqual("Routes");
  expect(document.querySelector("main")?.textContent).toEqual("Home");

  navigateToUrl("/test/dogs");
  await triggerAppChange();
  await new Promise((resolve) => {
    routerNavigationResolve = resolve;
  });

  expect(document.querySelector("h1")?.textContent).toEqual("Routes");
  expect(document.querySelector("main")?.textContent).toEqual("Dogs");

  navigateToUrl("/test/home");
  await triggerAppChange();
  await new Promise((resolve) => {
    routerNavigationResolve = resolve;
  });

  expect(document.querySelector("h1")?.textContent).toEqual("Routes");
  expect(document.querySelector("main")?.textContent).toEqual("Home");
});

test(`validation errors`, () => {
  // @ts-expect-error
  expect(() => singleSpaVue()).toThrowError(`single-spa-vue: opts required`);

  // @ts-expect-error
  expect(() => singleSpaVue({})).toThrowError(
    `single-spa-vue: opts.rootComponent required`,
  );

  // @ts-expect-error
  expect(() => singleSpaVue({ rootComponent() {} })).toThrowError(
    `single-spa-vue: opts.createApp must be a function`,
  );
});
