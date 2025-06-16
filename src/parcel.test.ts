import { AppProps, CustomProps, ParcelConfig } from "single-spa";
import { expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import Parcel from "./parcel.ts";
import { mountRootParcel } from "single-spa";

test(`can mount and unmount a single-spa parcel`, async () => {
  let mounts: number = 0,
    unmounts: number = 0,
    props: (CustomProps & AppProps) | null = null;

  const config: ParcelConfig = {
    async mount(p) {
      props = p;
      mounts++;
    },
    async unmount(p) {
      unmounts++;
    },
  };

  const wrapper = mount(Parcel, {
    props: {
      config,
      mountParcel: mountRootParcel,
    },
  });

  await tick();

  expect(wrapper.emitted()).toHaveProperty("parcelMounted");
  expect(wrapper.emitted().parcelMounted).toHaveLength(1);

  expect(props!.custom).not.toBeDefined();
  expect(mounts).toBe(1);

  wrapper.unmount();

  await tick();

  expect(unmounts).toBe(1);
});

test("it can update parcel to new props", async () => {
  let mounts: number = 0,
    unmounts: number = 0,
    updates: number = 0,
    props: CustomProps & AppProps & { custom: string };

  const config: ParcelConfig<{ custom: string }> = {
    async mount(p) {
      props = p;
      mounts++;
    },
    async update(p) {
      props = p;
      updates++;
    },
    async unmount(p) {
      unmounts++;
    },
  };

  const wrapper = mount(Parcel, {
    props: {
      config,
      mountParcel: mountRootParcel,
      parcelProps: {},
    },
  });

  await tick();

  expect(wrapper.emitted()).toHaveProperty("parcelMounted");
  expect(wrapper.emitted().parcelMounted).toHaveLength(1);

  expect(mounts).toBe(1);
  expect(updates).toBe(0);

  await wrapper.setProps({
    config,
    mountParcel: mountRootParcel,
    parcelProps: {
      custom: "hi",
    },
  });

  await tick();

  expect(updates).toBe(1);

  expect(wrapper.emitted()).toHaveProperty("parcelUpdated");
  expect(wrapper.emitted().parcelUpdated).toHaveLength(1);
  expect(props!.custom).toBe("hi");

  wrapper.unmount();

  await tick();

  expect(unmounts).toBe(1);
});

test("it emits an error when parcel lifecycles fail", async () => {
  const config: ParcelConfig = {
    async mount() {
      console.trace();
      throw Error("err");
    },
    async unmount() {},
  };

  const wrapper = mount(Parcel, {
    props: {
      config,
      mountParcel: mountRootParcel,
    },
  });

  await tick();

  expect(wrapper.emitted()).toHaveProperty("parcelError");
  expect(wrapper.emitted().parcelError).toHaveLength(1);
  // @ts-expect-error
  expect(wrapper.emitted().parcelError[0][0].message).toMatch(
    /died in status NOT_MOUNTED/,
  );

  wrapper.unmount();

  await tick();
});

function tick() {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    });
  });
}
