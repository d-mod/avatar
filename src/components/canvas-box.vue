<script lang="tsx">
import type { PropType } from "vue";
import { syncRef } from "@vueuse/core";
import { computed, defineComponent, reactive, ref, shallowRef, watch } from "vue";

interface Point {
  x: number;
  y: number;
}

interface Image {
  url: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  img?: HTMLImageElement;
}

/**
@author Chizuki
@date 2018/9/20 12:03
 */
export default defineComponent({
  name: "CanvasBox",
  props: {
    width: {
      type: Number,
      default: () => 300
    },
    height: {
      type: Number,
      default: () => 200
    },
    images: {
      type: Array as PropType<Image[]>,
      default: () => []
    },
    canvasClass: {
      type: [String, Array],
      default: ""
    },
    scale: {
      type: Number,
      default: () => 1.0
    },
    loading: {
      type: Boolean,
      default: () => false
    }
  },
  setup(props) {
    const canvasRef = shallowRef<HTMLCanvasElement>();

    const startOffset: Point = reactive({
      x: 0,
      y: 0
    });

    const location: Point = reactive({
      x: 0,
      y: 0
    });

    const movable = ref(false);

    watch([() => props.images, () => props.scale], draw);

    const loading = ref(props.loading);

    syncRef(
      computed(() => props.loading),
      loading,
      {
        direction: "ltr"
      }
    );

    const time = ref(0);

    async function loadImage(src: string, now: number): Promise<HTMLImageElement | undefined> {
      return new Promise((resolve) => {
        if (now !== time.value) {
          resolve(undefined);
          return;
        }
        const img = new Image();
        img.onload = () => {
          resolve(img);
        };
        img.onerror = () => {
          resolve(undefined);
        };
        img.src = src;
      });
    }

    async function draw() {
      loading.value = true;
      try {
        const width = props.width;
        const height = props.height;

        const now = new Date().getTime();
        time.value = now;

        let images = Array.from(props.images);

        images.sort((a, b) => {
          if (a.z === b.z) {
            return 0;
          }
          if (a.z < 0) {
            return 1;
          }
          return a.z - b.z;
        });

        const tasks = images.map(async (e) => {
          if (!e.img) {
            e.img = await loadImage(e.url, now);
            e.width = e.img?.width ?? e.width;
            e.height = e.img?.height ?? e.height;
          }
          return e;
        });

        images = await Promise.all(tasks);

        let x = props.width;
        let y = props.height;
        let w = 0;
        let h = 0;
        for (const image of images) {
          if (image.width * image.height === 1) {
            continue;
          }
          x = Math.min(image.x, x);
          y = Math.min(image.y, y);
          w = Math.max(image.width, w);
          h = Math.max(image.height, h);
        }

        images = images.map((e) => {
          return {
            ...e,
            x: e.x - x,
            y: e.y - y
          };
        });

        let offsetX = Math.round((props.width - w) / 2 + location.x);
        let offsetY = Math.round((props.height - h) / 2 + location.y);

        offsetX = Math.max(0, offsetX);
        offsetX = Math.min(props.width - w, offsetX);
        offsetY = Math.max(0, offsetY);
        offsetY = Math.min(props.height - h, offsetY);

        const context = canvasRef.value?.getContext("2d");

        if (context) {
          const scale = props.scale;
          context.clearRect(0, 0, width, height);

          images.forEach((e) => {
            const lx = Math.round((e.x + offsetX) * scale);
            const ly = Math.round((e.y + offsetY) * scale);
            const lw = Math.round(e.width * scale);
            const lh = Math.round(e.height * scale);
            if (e.img) {
              context.drawImage(e.img, lx, ly, lw, lh);
            }
          });
        }
      } finally {
        loading.value = false;
      }
    }

    function mouseDown({ x, y }: MouseEvent) {
      movable.value = true;
      startOffset.x = x;
      startOffset.y = y;
    }

    function mouseUp() {
      movable.value = false;
    }

    function mouseMove(e: MouseEvent) {
      if (movable.value) {
        location.x += (e.clientX - startOffset.x) / props.scale;
        location.y += (e.clientY - startOffset.y) / props.scale;

        startOffset.x = e.clientX;
        startOffset.y = e.clientY;

        draw();
      }
    }

    const canvasStyle = computed(() => {
      return {
        width: props.width ? `${props.width}px` : "0",
        height: props.height ? `${props.height}px` : "0"
      };
    });

    return () => {
      return (
        <div style={canvasStyle.value} class="relative">
          <apt-loading loading={loading.value} />
          <canvas
            ref={canvasRef}
            style={canvasStyle.value}
            class={[props.canvasClass].concat("cursor-move", "select-none")}
            width={props.width}
            height={props.height}
            onMouseleave={mouseUp}
            onMousedown={mouseDown}
            onMouseup={mouseUp}
            onMousemove={mouseMove}
          >
          </canvas>
        </div>
      );
    };
  }
});
</script>

<style></style>
