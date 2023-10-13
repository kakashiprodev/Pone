<script setup>
import Sidebar from 'primevue/sidebar';
import { usePrimeVue } from 'primevue/config';
import { ref, watch, computed } from 'vue';
import { useLayout } from './composables/layout';

defineProps({
    simple: {
        type: Boolean,
        default: false
    }
});

const $primevue = usePrimeVue();
const rippleActive = computed(() => $primevue.config.ripple);
const inputStyle = computed(() => $primevue.config.inputStyle);
const { setScale, layoutConfig, layoutState, onConfigSidebarToggle } = useLayout();

const componentThemes = ref([
    { name: 'indigo', color: '#3F51B5' },
    { name: 'blue', color: '#2196F3' },
    { name: 'green', color: '#4CAF50' },
    { name: 'deeppurple', color: '#673AB7' },
    { name: 'orange', color: '#FF9800' },
    { name: 'cyan', color: '#00BCD4' },
    { name: 'yellow', color: '#FFB340' },
    { name: 'pink', color: '#E91E63' },
    { name: 'purple', color: '#9C27B0' },
    { name: 'lime', color: '#CDDC39' }
]);

const scales = ref([12, 13, 14, 15, 16]);

watch(layoutConfig.menuMode, (newVal) => {
    if (newVal === 'static') {
        layoutState.staticMenuDesktopInactive.value = false;
    }
});

const menuTheme = ref('colorScheme');

const colorScheme = ref('light');

const changeColorScheme = (colorScheme) => {
    const themeLink = document.getElementById('theme-link');
    const themeLinkHref = themeLink.getAttribute('href');
    const currentColorScheme = 'theme-' + layoutConfig.colorScheme.value.toString();
    const newColorScheme = 'theme-' + colorScheme;
    const newHref = themeLinkHref.replace(currentColorScheme, newColorScheme);

    replaceLink(themeLink, newHref, () => {
        layoutConfig.colorScheme.value = colorScheme;
    });
};
const changeLayoutTheme = (layoutTheme) => {
    const themeLink = document.getElementById('theme-link');
    const themeLinkHref = themeLink.getAttribute('href');
    const currentColorScheme = 'theme-' + layoutConfig.layoutTheme.value.toString();
    const newColorScheme = 'theme-' + layoutTheme;
    const newHref = themeLinkHref.replace(currentColorScheme, newColorScheme);

    replaceLink(themeLink, newHref, () => {
        layoutConfig.layoutTheme.value = layoutTheme;
    });
};

const changeTheme = (theme) => {
    const themeLink = document.getElementById('theme-link');
    const themeHref = themeLink.getAttribute('href');
    const newHref = themeHref.replace(layoutConfig.theme.value, theme);

    replaceLink(themeLink, newHref, () => {
        layoutConfig.theme.value = theme;
    });
};

const replaceLink = (linkElement, href, onComplete) => {
    if (!linkElement || !href) {
        return;
    }

    const id = linkElement.getAttribute('id');
    const cloneLinkElement = linkElement.cloneNode(true);

    cloneLinkElement.setAttribute('href', href);
    cloneLinkElement.setAttribute('id', id + '-clone');

    linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

    cloneLinkElement.addEventListener('load', () => {
        linkElement.remove();

        const element = document.getElementById(id);
        element && element.remove();

        cloneLinkElement.setAttribute('id', id);
        onComplete && onComplete();
    });
};
const decrementScale = () => {
    setScale(layoutConfig.scale.value - 1);
    applyScale();
};
const incrementScale = () => {
    setScale(layoutConfig.scale.value + 1);
    applyScale();
};

const applyScale = () => {
    document.documentElement.style.fontSize = layoutConfig.scale.value + 'px';
};

const onInputStyleChange = (value) => {
    $primevue.config.inputStyle = value;
};
const onRippleChange = (value) => {
    $primevue.config.ripple = value;
};
</script>

<template>
    <button class="layout-config-button config-link" @click="onConfigSidebarToggle()">
        <i class="pi pi-cog"></i>
    </button>
    <Sidebar v-model:visible="layoutState.configSidebarVisible.value" position="right" class="w-full sm:w-18rem">
        <template v-if="!simple">
            <h5>Menu Type</h5>
            <div class="flex flex-wrap row-gap-3">
                <div class="flex align-items-center gap-2 w-6">
                    <RadioButton name="menuMode" value="static" v-model="layoutConfig.menuMode.value" inputId="mode1"></RadioButton>
                    <label for="mode1">Static</label>
                </div>

                <div class="flex align-items-center gap-2 w-6 pl-2">
                    <RadioButton name="menuMode" value="overlay" v-model="layoutConfig.menuMode.value" inputId="mode2"></RadioButton>
                    <label for="mode2">Overlay</label>
                </div>
                <div class="flex align-items-center gap-2 w-6">
                    <RadioButton name="menuMode" value="slim" v-model="layoutConfig.menuMode.value" inputId="mode3"></RadioButton>
                    <label for="mode3">Slim</label>
                </div>
                <div class="flex align-items-center gap-2 w-6 pl-2">
                    <RadioButton name="menuMode" value="slim-plus" v-model="layoutConfig.menuMode.value" inputId="mode4"></RadioButton>
                    <label for="mode4">Slim+</label>
                </div>
            </div>
            <hr />
        </template>

        <h5>Color Scheme</h5>
        <div class="flex">
            <div class="field-radiobutton flex-auto">
                <RadioButton name="colorScheme" value="light" v-model="colorScheme" id="theme3" @change="changeColorScheme('light')"></RadioButton>
                <label for="theme3">Light</label>
            </div>

            <div class="field-radiobutton flex-auto">
                <RadioButton name="colorScheme" value="dark" v-model="colorScheme" id="theme1" @change="changeColorScheme('dark')"></RadioButton>
                <label for="theme1">Dark</label>
            </div>
        </div>

        <template v-if="!simple">
            <h5>Layout Theme</h5>
            <div class="field-radiobutton">
                <RadioButton name="menuTheme" value="colorScheme" v-model="menuTheme" inputId="menutheme-colorscheme" @change="changeLayoutTheme('colorScheme')"></RadioButton>
                <label for="menutheme-colorscheme">Color Scheme</label>
            </div>
            <div class="field-radiobutton">
                <RadioButton name="menuTheme" value="primaryColor" v-model="menuTheme" inputId="menutheme-primarycolor" @change="changeLayoutTheme('primaryColor')" :disabled="layoutConfig.colorScheme.value === 'dark'"></RadioButton>
                <label for="menutheme-primarycolor">Primary Color (Light Only)</label>
            </div>
        </template>

        <h5>Themes</h5>
        <div class="flex flex-wrap gap-3">
            <div v-for="(theme, i) in componentThemes" :key="i">
                <a
                    :autoFocus="layoutConfig.theme === theme.name"
                    @click="() => changeTheme(theme.name)"
                    :style="{ 'background-color': theme.color }"
                    class="w-2rem h-2rem cursor-pointer hover:shadow-4 border-round transition-duration-150 flex align-items-center justify-content-center"
                >
                    <i v-if="theme.name === layoutConfig.theme.value" class="pi pi-check text-white"></i>
                </a>
            </div>
        </div>

        <h5>Scale</h5>
        <div class="flex align-items-center">
            <Button icon="pi pi-minus" type="button" @click="decrementScale()" class="p-button-text p-button-rounded w-2rem h-2rem mr-2" :disabled="layoutConfig.scale.value === scales[0]"></Button>
            <div class="flex gap-3 align-items-center">
                <i class="pi pi-circle-fill text-300" v-for="s in scales" :key="s" :class="{ 'text-primary-500': s === layoutConfig.scale.value }"></i>
            </div>
            <Button icon="pi pi-plus" type="button" pButton @click="incrementScale()" class="p-button-text p-button-rounded w-2rem h-2rem ml-2" :disabled="layoutConfig.scale.value === scales[scales.length - 1]"></Button>
        </div>

        <h5>Input Style</h5>
        <div class="flex">
            <div class="field-radiobutton flex-1">
                <RadioButton :modelValue="inputStyle" name="inputStyle" value="outlined" inputId="outlined_input" @update:modelValue="onInputStyleChange"></RadioButton>
                <label for="outlined_input">Outlined</label>
            </div>
            <div class="field-radiobutton flex-1">
                <RadioButton :modelValue="inputStyle" name="inputStyle" value="filled" inputId="filled_input" @update:modelValue="onInputStyleChange"></RadioButton>
                <label for="filled_input">Filled</label>
            </div>
        </div>

        <h5>Ripple Effect</h5>
        <InputSwitch :modelValue="rippleActive" @update:modelValue="onRippleChange"></InputSwitch>
    </Sidebar>
</template>
