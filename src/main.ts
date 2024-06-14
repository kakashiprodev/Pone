import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import i18n from '@/i18n.ts';
import ToastService from 'primevue/toastservice';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import { useGlobalStore } from './stores/global';
import { useInputStore } from './stores/inputs';
import { useAuthStore } from './stores/auth';
import { createPinia } from 'pinia';

// Auth0
import { createAuth0 } from '@auth0/auth0-vue';

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
import RadioButton from 'primevue/radiobutton';

import '@fortawesome/fontawesome-free/css/all.min.css';
import './style.css';

const pinia = createPinia();

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

const app = createApp(App)
  .use(pinia)
  .use(router)
  .use(i18n)
  .use(PrimeVue)
  .use(ConfirmationService)
  .use(ToastService)
  .use(VueApexCharts)
  .use(
    createAuth0({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL,
      },
    }),
  )

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
  .component('RadioButton', RadioButton)

  .directive('tooltip', Tooltip);

export const globalStore = useGlobalStore();
export const inputStore = useInputStore();
export const authStore = useAuthStore();

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
