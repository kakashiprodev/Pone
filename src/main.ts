import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { createPinia } from 'pinia';
import ToastService from 'primevue/toastservice';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import { useGlobalStore } from './stores/global';

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
import Chart from 'primevue/chart';
import ToggleButton from 'primevue/togglebutton';
import Listbox from 'primevue/listbox';

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'primeflex/primeflex.css';

const pinia = createPinia();

export const app = createApp(App)
  .use(router)
  .use(pinia)
  .use(PrimeVue)
  .use(ConfirmationService)
  .use(ToastService);

app.component('MultiSelect', MultiSelect);
app.component('Button', Button);
app.component('Checkbox', Checkbox);
app.component('Dropdown', Dropdown);
app.component('Card', Card);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('InputText', InputText);
app.component('InputNumber', InputNumber);
app.component('Textarea', Textarea);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Toolbar', Toolbar);
app.component('ConfirmDialog', ConfirmDialog);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ConfirmPopup', ConfirmPopup);
app.component('Dialog', Dialog);
app.component('InlineMessage', InlineMessage);
app.component('Calendar', Calendar);
app.component('Editor', Editor);
app.component('Slider', Slider);
app.component('PanelMenu', PanelMenu);
app.component('InputSwitch', InputSwitch);
app.component('Divider', Divider);
app.component('Toast', Toast);
app.component('Chart', Chart);
app.component('ToggleButton', ToggleButton);
app.component('Listbox', Listbox);


app.directive('tooltip', Tooltip);

app.mount('#app');

export const globalStore = useGlobalStore();
