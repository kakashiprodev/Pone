<template>
    <div class="layout-container" :class="containerClass">
        <AppTopbar ref="topbarRef"></AppTopbar>
        <AppSidebar></AppSidebar>
        <div class="layout-content-wrapper">
            <div class="layout-content">
                <div class="layout-content-inner">
                    <!-- <AppBreadcrumb></AppBreadcrumb> -->
                    <router-view></router-view>
                    <AppFooter></AppFooter>
                </div>
            </div>
        </div>
        <!-- <Toast /> -->
        <!-- <AppConfig></AppConfig> -->
    </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onBeforeUnmount, Ref } from 'vue';
// import Toast from 'primevue/toast';
// import { usePrimeVue } from 'primevue/config';
import AppTopbar from './AppTopbar.vue';
// import AppConfig from './AppConfig.vue';
// import AppBreadcrumb from './AppBreadcrumb.vue';
import AppSidebar from './AppSidebar.vue';
import AppFooter from './AppFooter.vue';
import { useLayout } from './composables/layout';
import { useGlobalStore } from "./../stores/global";

const global = useGlobalStore();

// const $primevue = usePrimeVue();
const { layoutConfig, layoutState, isSidebarActive } = useLayout();

const outsideClickListener: Ref<any> = ref(null);
const topbarRef = ref(null);

watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const containerClass = computed(() => {
    return [
        {
            'layout-slim': layoutConfig.menuMode.value === 'slim',
            'layout-slim-plus': layoutConfig.menuMode.value === 'slim-plus',
            // 'layout-static': layoutConfig.menuMode.value === 'static',
            'layout-overlay': layoutConfig.menuMode.value === 'overlay',
            'layout-overlay-active': layoutState.overlayMenuActive.value,
            'layout-mobile-active': layoutState.staticMenuMobileActive.value,
            // 'layout-static-inactive': layoutState.staticMenuDesktopInactive.value && layoutConfig.menuMode.value === 'static',
            // 'p-input-filled': $primevue.config.inputStyle === 'filled',
            // 'p-ripple-disabled': $primevue.config.ripple === false,
            'layout-light': global.theme === 'light',
            'layout-dark': global.theme === 'dark',
            // 'layout-primary': layoutConfig.colorScheme.value !== 'dark' && layoutConfig.layoutTheme.value === 'primaryColor',
        }
    ];
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event: any) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive.value = false;
                layoutState.overlaySubmenuActive.value = false;
                layoutState.staticMenuMobileActive.value = false;
                layoutState.menuHoverActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener as any);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event: any) => {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.topbar-menubutton');

    return !(sidebarEl?.isSameNode(event.target) || sidebarEl?.contains(event.target) || topbarEl?.isSameNode(event.target) || topbarEl?.contains(event.target));
};
</script>