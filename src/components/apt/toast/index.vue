<script lang="tsx">
import { createApp, defineComponent } from "vue";

const Toast = defineComponent({
  name: "IToast",
  props: {
    message: String
  },

  setup(props) {
    return () => {
      return (
        <div class="i-toast">
          <div class="i-toast-content">{props.message}</div>
        </div>
      );
    };
  }
});

export async function showToast(message: string, timeout = 3000) {
  const toast = document.createElement("div");
  toast.className = "i-toast-wrapper";
  const app = createApp(Toast, { message });
  app.mount(toast);
  document.body.appendChild(toast);

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      app.unmount();
      document.body.removeChild(toast);
      resolve();
    }, timeout);
  });
}

export default Toast;
</script>

<style lang="scss">
  .i-toast {
    width: 200px;
    height: 32px;
    border-radius: 2px;
    color: white;
    font-size: 14px;
    background: rgb(0, 0, 0, 0.72);
    box-shadow: 1px 1px 2px rgb(18 18 18 / 10%);
    z-index: 999;

    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 4px;

    &.success {
      background-color: #00c48f;
    }
  }

  .i-toast-wrapper {
    position: fixed;
    top: 12px;
    left: calc((100% - 200px) / 2);
  }
</style>
