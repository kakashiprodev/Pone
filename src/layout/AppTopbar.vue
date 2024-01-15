<template>
    <div class="layout-topbar">
        <router-link to="/dashboard" class="app-logo">
            <img src="./../assets/logo-transparent.webp" />
        </router-link>

        <button ref="menubutton" class="topbar-menubutton p-link" type="button" @click="onMenuButtonClick()">
            <span></span>
        </button>

        <ul class="topbar-menu">
            <li v-for="(item, i) in tabs" :key="i">
                <router-link :to="item.to ?? ''" :exact-active-class="'active-route'">
                    <span> {{ item.label ?? '' }}</span>
                </router-link>
                <i class="pi pi-times" @click="onCloseTab(i)"></i>
            </li>
        </ul>

        <ul class="topbar-menu-custom text-xl list-none" v-if="global.isLoggedIn">
            <li style="float: left;" class="ml-5">
                <router-link to="/actions">
                    <i class="fa-solid fa-list-check text-800"></i>
                    <span class="ml-2 text-500">Maßnahmen</span>
                </router-link>
            </li>
            <li style="float: left;" class="ml-5">
                <router-link to="/report-config">
                    <i class="fa-solid fa-building text-800"></i>
                    <span class="ml-2 text-500">Berichtsdaten {{ global.selectedReport?.year }}</span>
                </router-link>
            </li>
            <li style="float: left;" class="ml-5">
                <div class="flex align-content-start flex-wrap">
                    <InputSwitch class="flex align-items-center justify-content-center mt-1"
                        v-model="global.showTooltips" />
                    <span class="ml-2 text-600">Zeige Hilfe</span>
                </div>
            </li>
        </ul>

        <div class="topbar-profile" v-if="global.username !== ''">
            <button class="topbar-profile-button p-link" type="button" @click="toggleUserMenu">
                <i class="fa-solid fa-user mr-3"></i>
                <span class="profile-details">
                    <span class="profile-name">{{ global.username }}</span>
                    <span class="profile-job">{{ global.selectedProject?.name }}</span>
                </span>
                <i class="fa-solid fa-angle-down"></i>
            </button>

            <OverlayPanel ref="userMenuPanel">
                <ul class="list-none m-0 p-0">
                    <li>
                        <a href="/#/project-config" @click="toggleUserMenu"
                            class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                            <i class="fa-solid fa-people-group mr-3"></i>
                            <span>Projekte verwalten</span>
                        </a>
                        <a href="/#/equivalents" @click="toggleUserMenu"
                            class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                            <i class="fa-solid fa-list mr-3"></i>
                            <span>Äquivalente verwalten</span>
                        </a>
                        <a href="/#/user" @click="toggleUserMenu"
                            class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                            <i class="fa-solid fa-user mr-3"></i>
                            <span>Benutzerprofil</span>
                        </a>
                        <a @click="logout()"
                            class="text-800 flex p-2 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer">
                            <i class="fa-solid fa-right-from-bracket mr-3"></i>
                            <span>Ausloggen</span>
                        </a>
                    </li>
                </ul>
            </OverlayPanel>


        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, Ref, watch } from 'vue';
import { useLayout } from './composables/layout';
import { useRouter } from 'vue-router';
import { usePrimeVue } from 'primevue/config';
import { useGlobalStore } from "./../stores/global";
import InputSwitch from 'primevue/inputswitch';
import DataProvider from "./../services/dataprovider";
import Button from 'primevue/button';
import OverlayPanel from 'primevue/overlaypanel';

const $primevue = usePrimeVue();
const global = useGlobalStore();

const userMenuPanel = ref();
const toggleUserMenu = (event: Event) => {
    userMenuPanel.value.toggle(event);
}

const darkMode = ref(false);
watch(darkMode, (newVal) => {
    if (newVal) {
        global.theme = 'dark';
    } else {
        global.theme = 'light';
    }
});

const logout = async () => {
    userMenuPanel.value.hide();
    await DataProvider.logout();
    router.push('/login');
};

defineExpose({
    $primevue
});

const { onMenuToggle, /*layoutConfig,*/ tabs, closeTab } = useLayout();

const outsideClickListener: Ref<any> = ref(null);
const topbarMenuActive = ref(false);

const router = useRouter();
const onCloseTab = (index: any) => {
    if (tabs.value.length > 1) {
        if (index === tabs.value.length - 1) router.push(tabs.value[tabs.value.length - 2].to);
        else router.push(tabs.value[index + 1].to);
    } else {
        router.push('/');
    }
    closeTab(index);
};

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event: any) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
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
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    if (!sidebarEl || !topbarEl) return false;
    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
const onMenuButtonClick = () => {
    onMenuToggle();
};
</script>

<style scoped>
.app-logo {
    background-color: white;
    border-radius: 15px;
}
</style>