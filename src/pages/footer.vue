<script lang="tsx">
import { useDateFormat } from "@vueuse/core";
import { defineComponent } from "vue";

export default defineComponent(() => {
  const lastModified = useDateFormat(__LAST_MODIFIED__, "YYYY-MM-DD HH:mm:ss");

  return () => {
    return (
      <div class="flex flex-wrap h-20 text-center text-dark text-sm py-4 lt-sm:h-auto items-center justify-center">
        <div>
          <p class="flex flex-wrap m-0 w-full items-center justify-center">
            <a class="text-primary" href="//github.com/d-mod/avatar">
                DAvatar&nbsp;Ver&nbsp;
              {__APP_VERSION__}
            </a>
            <span class="text-primary ml-4">
                最后更新于:
              {lastModified.value}
            </span>
          </p>
          <p class="m-0 w-full">
            <span>
                Copyright © 2017-present
              <a class="mx-1 text-primary" href="//github.com/chizukicn">
                  Chizuki
              </a>
                .
            </span>
            <span> All&nbsp;rights&nbsp;reserved.</span>
          </p>
        </div>
      </div>
    );
  };
});
</script>
