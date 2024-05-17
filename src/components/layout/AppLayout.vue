<template>
  <!-- Toolbar -->
  <div
    class="card"
    style="padding-left: 0.5rem; padding-right: 0.5rem; padding-top: 0.5rem"
    :class="{
      lightmode: colorMode === 'light',
      darkmode: colorMode !== 'light',
    }"
  >
    <div
      class="flex overflow-hidden w-full h-24 justify-content-around"
      style="border-radius: 7px; border: 1px solid rgb(209, 209, 209)"
      :class="{
        lightmode: colorMode === 'light',
        darkmode: colorMode !== 'light',
      }"
    >
      <!-- Logo -->
      <div class="flex-none flex items-center justify-centerm-1 w-28">
        <slot name="logo"></slot>
      </div>
      <!-- AppName. Only visible if Desktop -->
      <div
        v-if="!mobile"
        class="flex-none flex items-center justify-center m-1"
      >
        <slot name="appname"></slot>
      </div>
      <!-- First Items -->
      <div class="flex-none flex items-center justify-center m-1">
        <slot name="start"></slot>
      </div>
      <!-- Center Items. Only visible if Desktop -->
      <div
        v-if="!mobile"
        class="grow flex items-center items-center justify-center m-1"
      >
        <slot name="center"></slot>
      </div>
      <!-- Last Items. Only visible if Desktop -->
      <div class="flex-none flex items-center items-center justify-center m-1">
        <slot name="before-end"></slot>
      </div>
      <!-- Menu Items. Will be behind a menu if not Desktop -->
      <div class="flex-none flex items-center items-center justify-center m-1">
        <!-- Desktop Menu -->
        <div
          v-if="!mobile"
          class="desktop-submenu-list flex gap-3 items-center m-3"
        >
          <slot name="end"></slot>
        </div>

        <!-- Mobile Menu -->
        <div
          v-if="mobile"
          class="cursor-pointer"
          @click="showEndMenu = !showEndMenu"
        >
          <i class="fa-solid fa-bars text-3xl"></i>
        </div>

        <div
          v-if="mobile && showEndMenu"
          class="absolute right-0 bg-slate-50 rounded-xl rounded-md shadow-lg w-full p-3 shadow-3 z-1 flex flex-column gap-2"
          :class="{
            'bg-slate-100': colorMode === 'light',
            'bg-slate-900': colorMode !== 'light',
          }"
          style="top: 5rem; min-height: calc(100vh - 5rem)"
        >
          <div class="flex justify-end items-center">
            <slot name="before-end"></slot>
            <slot name="end"></slot>
          </div>

          <div class="flex flex-column grow">
            <slot name="sidebar" />
          </div>

          <div>
            <slot name="submenu"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- sidebar and Content -->
  <div
    class="app-layout__content p-2 grow"
    :class="{
      lightmode: colorMode === 'light',
      darkmode: colorMode !== 'light',
      showSidebar: showSidebar && !!slots.sidebar,
    }"
  >
    <div v-if="showSidebar" style="min-width: 50px">
      <slot name="sidebar" />
    </div>

    <div class="grow pl-5 pr-2 pb-2">
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, computed, onMounted } from 'vue';
import { useGlobalStore } from '../../stores/global';
const $global = useGlobalStore();

const slots = defineSlots<{
  sidebar: any;
  content: any;
  logo: any;
  appname: any;
  start: any;
  center: any;
  'before-end': any;
  end: any;
  submenu: any;
}>();

const props = defineProps({
  hideSidebar: {
    type: Boolean,
    default: false,
  },
});

// mobile mode depends on window size

const mobile = ref(window.innerWidth < 768);

onMounted(() => {
  const onResize = () => {
    mobile.value = window.innerWidth < 768;
  };

  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
  };
});

// sidemenu
const showSidebar = computed(() => {
  if (mobile.value) return false;
  if (props.hideSidebar) return false;
  return true;
});

const showEndMenu = ref(false);

const colorMode = computed(() => {
  return $global.theme;
});

watch(
  () => colorMode.value,
  (newVal) => {
    console.log('mode changed', newVal);
    if (newVal === 'light') {
      toggleToLight();
      $global.theme = 'light';
    } else {
      toggleToDark();
      $global.theme = 'dark';
    }
  },
);

// const fontSize = ref(15);
// const increaseFontSize = (cnt = 1) => {
//     if (fontSize.value >= 24) return;
//     fontSize.value += cnt;
//     document.getElementsByTagName('html')[0].style.fontSize = fontSize.value + 'px';
// }
// const decreaseFontSize = (cnt = 1) => {
//     if (fontSize.value <= 8) return;
//     fontSize.value -= cnt;
//     document.getElementsByTagName('html')[0].style.fontSize = fontSize.value + 'px';
// }

const theme: Ref<string> = ref('aura-light-teal');

const loadStylesheet = (themeName: 'aura-dark-teal' | 'aura-light-teal') => {
  // Remove the existing theme if it's present
  const existingTheme = document.getElementById('theme-toggle');
  if (existingTheme) {
    existingTheme.remove();
  }
  // update theme
  theme.value = themeName;

  // Create a new link element for the desired theme
  const link = document.createElement('link');
  link.id = 'theme-toggle';
  link.rel = 'stylesheet';
  // /themes/md-light-indigo.css
  link.href = `./themes/${themeName}/theme.css`; // adjust the path if needed
  // add to header at first position to not overwrite other styles
  document.head.insertBefore(link, document.head.firstChild);
};

const toggleToDark = () => {
  $global.saveUserSettings();
  loadStylesheet('aura-dark-teal');
  // PV.changeTheme("md-light-indigo", "md-dark-indigo", "theme-toggle", () => { });
};
const toggleToLight = () => {
  $global.saveUserSettings();
  loadStylesheet('aura-light-teal');
  // PV.changeTheme("md-dark-indigo", "md-light-indigo", "theme-toggle", () => { });
};

$global.getUserSettings();

defineExpose({
  closeSidebar: () => {
    showEndMenu.value = false;
  },
});
</script>

<style lang="scss">
html {
  /* initial value */
  font-size: 15px;
}

body {
  margin: 0px !important;
}

#toolbar-desktop {
  background-color: #afafaf;
}

div .darkmode {
  background-color: #252525;
  color: rgb(210, 210, 210);
}

div .lightmode {
  background-color: white;
  color: rgb(87 87 87);
}

ul.desktop-submenu-list > li {
  float: left;
  font-size: 0.9rem;
  padding-left: 5px;
}

ul.mobile-submenu-list {
  padding-left: 0px !important;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 10px;
}

ul.mobile-submenu-list > li {
  padding-top: 10px;
  padding-bottom: 10px;
}

.app-layout {
  &__content {
    display: grid;
    gap: 1rem;

    overflow: auto;

    width: 100%;
    grid-template-columns: max(180px) 1fr;

    &:not(.showSidebar) {
      grid-template-columns: 100%;
    }

    @media screen and (max-width: 768px) {
      grid-template-columns: 100%;
    }
  }
}
</style>
