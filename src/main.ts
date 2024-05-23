import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { createPinia } from 'pinia';
import ToastService from 'primevue/toastservice';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import { GlobalActions, GlobalState, useGlobalStore } from './stores/global';
import { InputsActions, InputsState, useInputStore } from './stores/inputs';

/* Apex charts */
// @ts-ignore
import VueApexCharts from 'vue3-apexcharts';

/* PrimeVue components */
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Card from 'primevue/card';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import ProgressSpinner from 'primevue/progressspinner';
import Toolbar from 'primevue/toolbar';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ConfirmPopup from 'primevue/confirmpopup';
import Dialog from 'primevue/dialog';
import Calendar from 'primevue/calendar';
import Editor from 'primevue/editor';
import Slider from 'primevue/slider';
import InlineMessage from 'primevue/inlinemessage';
import PanelMenu from 'primevue/panelmenu';
import InputSwitch from 'primevue/inputswitch';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import ToggleButton from 'primevue/togglebutton';
import Listbox from 'primevue/listbox';
import Panel from 'primevue/panel';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import Chip from 'primevue/chip';
import Sidebar from 'primevue/sidebar';
import Avatar from 'primevue/avatar';
import FileUpload from 'primevue/fileupload';
import MeterGroup from 'primevue/metergroup';

import '@fortawesome/fontawesome-free/css/all.min.css';
import './style.css';
import { AuthStoreActions, AuthStoreState, useAuthStore } from './stores/auth';
import keycloakService from './services/provider/keycloak';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const AuthStorePlugin = {
  async install(_: any, option: any) {
    const store = useAuthStore(option.pinia);
    // // Global store
    // app.config.globalProperties.$authStore = store;
    // Store keycloak user data into store
    await keycloakService.CallInitStore(store);
  },
};

export let app: any;
export let globalStore: GlobalState & GlobalActions;
export let inputStore: InputsState & InputsActions;
export let authStore: AuthStoreState & AuthStoreActions;

export let info = (
  _body: string,
  _title: string = 'Info',
  _duration: number,
) => {};
export let error = (
  _body: string,
  _title: string = 'Error',
  _duration: number,
) => {};
export let warn = (
  _body: string,
  _title: string = 'Warning',
  _duration: number,
) => {};

const renderApp = () => {
  app = createApp(App)
    .use(pinia)
    .use(AuthStorePlugin, { pinia })
    .use(router)
    .use(PrimeVue)
    .use(ConfirmationService)
    .use(ToastService)
    .use(VueApexCharts)

    .component('MultiSelect', MultiSelect)
    .component('Button', Button)
    .component('Checkbox', Checkbox)
    .component('Dropdown', Dropdown)
    .component('Card', Card)
    .component('TabView', TabView)
    .component('TabPanel', TabPanel)
    .component('InputText', InputText)
    .component('InputNumber', InputNumber)
    .component('Textarea', Textarea)
    .component('ProgressSpinner', ProgressSpinner)
    .component('Toolbar', Toolbar)
    .component('ConfirmDialog', ConfirmDialog)
    .component('DataTable', DataTable)
    .component('Column', Column)
    .component('ConfirmPopup', ConfirmPopup)
    .component('Dialog', Dialog)
    .component('InlineMessage', InlineMessage)
    .component('Calendar', Calendar)
    .component('Editor', Editor)
    .component('Slider', Slider)
    .component('PanelMenu', PanelMenu)
    .component('InputSwitch', InputSwitch)
    .component('Divider', Divider)
    .component('Toast', Toast)
    .component('ToggleButton', ToggleButton)
    .component('Listbox', Listbox)
    .component('Panel', Panel)
    .component('ProgressBar', ProgressBar)
    .component('Tag', Tag)
    .component('Chip', Chip)
    .component('Sidebar', Sidebar)
    .component('Avatar', Avatar)
    .component('FileUpload', FileUpload)
    .component('MeterGroup', MeterGroup)

    .directive('tooltip', Tooltip);

  globalStore = useGlobalStore();
  inputStore = useInputStore();
  authStore = useAuthStore();

  console.log(app.config.globalProperties);

  info = (body: string, title: string = 'Info', duration: number): void =>
    app.config.globalProperties.$toast.add({
      severity: 'success',
      summary: title,
      detail: body,
      life: duration,
    });

  error = (body: string, title: string = 'Error', duration: number): void =>
    app.config.globalProperties.$toast.add({
      severity: 'error',
      summary: title,
      detail: body,
      life: duration,
    });

  warn = (body: string, title: string = 'Warning', duration: number): void =>
    app.config.globalProperties.$toast.add({
      severity: 'warn',
      summary: title,
      detail: body,
      life: duration,
    });

  // Mount the app
  app.mount('#app');
};

// Call keycloak service to init on render
keycloakService.CallInit(renderApp);
