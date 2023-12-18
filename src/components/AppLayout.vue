<template>
    <!-- Toolbar -->
    <div class="card pt-1 pb-1" :class="{ 'lightmode': colorMode === 'light', 'darkmode': colorMode !== 'light' }">
        <div class="flex overflow-hidden w-full h-6rem"
            :class="{ 'lightmode': colorMode === 'light', 'darkmode': colorMode !== 'light' }">
            <!-- Logo -->
            <div class="flex-none flex align-items-center justify-content-center ml-4 m-1 w-3rem">
                <slot name="logo"></slot>
            </div>
            <!-- AppName. Only visible if Desktop -->
            <div v-if="!mobile" class="flex-none flex align-items-center justify-content-center m-1">
                <slot name="appname"></slot>
            </div>
            <!-- First Items -->
            <div class="flex-none flex align-items-center justify-content-center m-1">
                <slot name="start"></slot>
            </div>
            <!-- Center Items. Only visible if Desktop -->
            <div v-if="!mobile"
                class="flex-grow-1 flex align-items-center align-items-center justify-content-center m-1">
                <slot name="center"></slot>
            </div>
            <!-- Last Items. Only visible if Desktop -->
            <div class="flex-none flex align-items-center align-items-center justify-content-center m-1">
                <slot name="before-end"></slot>
            </div>
            <!-- Menu Items. Will be behind a menu if not Desktop -->
            <div class="flex-none flex align-items-center align-items-center justify-content-center m-1">
                <!-- Desktop Menu -->
                <ul v-if="!mobile" class="list-none desktop-submenu-list">
                    <slot name="end"></slot>
                    <li>
                        <div class="flex justify-content-end align-content-center mt-2 ml-4 mr-1">
                            <InputSwitch v-model="$global.mode" class="mr-2" :true-value="'dark'" :false-value="'light'" />
                            <i v-if="colorMode === 'dark'" class="fa-solid fa-moon text-xl"></i>
                            <i v-if="colorMode === 'light'" class="fa-solid fa-sun text-xl"></i>
                        </div>
                    </li>
                </ul>

                <!-- Mobile Menu -->
                <div v-if="mobile" class="cursor-pointer" @click="showEndMenu = !showEndMenu">
                    <i class="fa-solid fa-bars text-3xl"></i>
                </div>
                <div v-if="mobile && showEndMenu"
                    class="absolute right-0 surface-10 border-round-xl rounded-md shadow-lg z-10 w-full p-3 shadow-3"
                    :class="{ 'bg-white': colorMode === 'light', 'surface-100': colorMode !== 'light' }" style="top: 5rem;">
                    <ul class="m-0 list-none mobile-submenu-list">
                        <li>
                            <div class="flex justify-content-end">
                                <i v-if="colorMode === 'dark'" class="fa-solid fa-moon"></i>
                                <i v-if="colorMode === 'light'" class="fa-solid fa-sun"></i>
                                <InputSwitch v-model="$global.mode" class="ml-3" :true-value="'dark'"
                                    :false-value="'light'" />
                            </div>
                        </li>
                        <slot name="end">
                        </slot>
                    </ul>
                    <slot name="submenu"></slot>
                </div>
            </div>
        </div>
    </div>
    <!-- sidebar and Content -->
    <div class="grid w-full" :class="{ 'lightmode': colorMode === 'light', 'darkmode': colorMode !== 'light' }">
        <div v-if="showSidebar" class="col-1" style="height: calc(100vh - 6rem);">
            <slot name="sidebar" />
        </div>
        <div :class="{ 'col-11': showSidebar, 'col-12': !showSidebar, 'p-3': !showSidebar }">
            <slot name="content" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, computed } from 'vue';
import InputSwitch from 'primevue/inputswitch';
import { useGlobalStore } from './../stores/global';
const $global = useGlobalStore();

const props = defineProps({
    hideSidebar: {
        type: Boolean,
        default: false
    },
});

// mobile mode depends on window size
const mobile = computed(() => {
    return window.innerWidth < 768;
});

// sidemenu
const showSidebar = computed(() => {
    if (mobile.value) return false;
    if (props.hideSidebar) return false;
    return true;
});

const showEndMenu = ref(false);

const colorMode = computed(() => {
    return $global.mode;
});

watch(() => colorMode.value, (newVal) => {
    console.log('mode changed', newVal);
    if (newVal === 'light') {
        toggleToLight();
        $global.mode = 'light';
    } else {
        toggleToDark();
        $global.mode = 'dark';
    }
});

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

const theme: Ref<'md-light-indigo' | 'md-dark-indigo'> = ref('md-light-indigo');

const loadStylesheet = (themeName: 'md-light-indigo' | 'md-dark-indigo') => {
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
    link.href = `./themes/${themeName}.css`; // adjust the path if needed
    // add to header at first position to not overwrite other styles
    document.head.insertBefore(link, document.head.firstChild);
};

const toggleToDark = () => {
    $global.saveUserSettings();
    loadStylesheet("md-dark-indigo");
    // PV.changeTheme("md-light-indigo", "md-dark-indigo", "theme-toggle", () => { });
};
const toggleToLight = () => {
    $global.saveUserSettings();
    loadStylesheet("md-light-indigo");
    // PV.changeTheme("md-dark-indigo", "md-light-indigo", "theme-toggle", () => { });
};


$global.getUserSettings();
</script>

<style>
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

ul.desktop-submenu-list>li {
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

ul.mobile-submenu-list>li {
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>