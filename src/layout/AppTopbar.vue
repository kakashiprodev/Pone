<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useLayout } from './composables/layout';
import { useRouter } from 'vue-router';
import { usePrimeVue } from 'primevue/config';

const $primevue = usePrimeVue();

defineExpose({
    $primevue
});

const { onMenuToggle, layoutConfig, tabs, closeTab } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const searchActive = ref(false);

const router = useRouter();

const activateSearch = () => {
    searchActive.value = true;
    setTimeout(() => {
        const input = document.querySelector('.searchInput');
        input.focus();
    }, 100);
};

const deactivateSearch = () => {
    searchActive.value = false;
};
const onCloseTab = (index) => {
    if (tabs.value.length > 1) {
        if (index === tabs.value.length - 1) router.push(tabs.value[tabs.value.length - 2].to);
        else router.push(tabs.value[index + 1].to);
    } else {
        router.push('/');
    }
    closeTab(index);
};

const logo = computed(() => {
    const path = '/layout/images/logo-';
    let logo;
    if (layoutConfig.layoutTheme.value === 'primaryColor' && layoutConfig.theme.value !== 'yellow') {
        logo = 'light.png';
    } else {
        logo = layoutConfig.colorScheme.value === 'light' ? 'dark.png' : 'light.png';
    }
    return path + logo;
});

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
const onMenuButtonClick = () => {
    onMenuToggle();
};
</script>

<template>
    <div class="layout-topbar">
        <router-link to="/login" class="app-logo">
            <img src="./../assets/logo.webp" />
            <span class="app-name">Pone Sustainability Manager</span>
        </router-link>

        <button ref="menubutton" class="topbar-menubutton p-link" type="button" @click="onMenuButtonClick()">
            <span></span>
        </button>

        <ul class="topbar-menu">
            <li v-for="(item, i) in tabs" :key="i">
                <router-link :to="item.to" :exact-active-class="'active-route'">
                    <span> {{ item.label }}</span>
                </router-link>
                <i class="pi pi-times" @click="onCloseTab(i)"></i>
            </li>
            <!-- <li v-if="!tabs || tabs.length === 0" class="topbar-menu-empty">Use (cmd + click) to open a tab</li> -->
        </ul>

        <!-- <div class="topbar-search" :class="{ 'topbar-search-active': searchActive }">
            <Button class="topbar-searchbutton p-link" type="button" @click="activateSearch()">
                <i class="pi pi-search"></i>
            </Button>

            <div class="search-input-wrapper">
                <span class="p-input-icon-right">
                    <InputText class="searchInput" type="text" placeholder="Search" @blur="deactivateSearch()"
                        @keydown.escape="deactivateSearch()" />
                    <i class="pi pi-search"></i>
                </span>
            </div>
        </div> -->

        <div class="topbar-profile">
            <button class="topbar-profile-button p-link" type="button"
                v-styleclass="{ selector: '@next', enterClass: 'hidden', enterActiveClass: 'scalein', leaveToClass: 'hidden', leaveActiveClass: 'fadeout', hideOnOutsideClick: 'true' }">
                <i class="fa-solid fa-user mr-3"></i>
                <span class="profile-details">
                    <span class="profile-name">{{  "username" }}</span>
                    <span class="profile-job">{{ "company" }}</span>
                </span>
                <i class="fa-solid fa-angle-down"></i>
            </button>
            <ul
                class="list-none p-3 m-0 border-round shadow-2 hidden absolute surface-overlay origin-top w-full sm:w-12rem mt-2 right-0 top-auto">
                <li>
                    <a v-ripple
                        class="p-ripple flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                        <i class="fa-solid fa-user mr-3"></i>
                        <span>Profile</span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>
