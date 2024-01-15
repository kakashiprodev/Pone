import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { createPinia } from 'pinia';
import ToastService from 'primevue/toastservice';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import { useGlobalStore } from './stores/global';

import '@fortawesome/fontawesome-free/css/all.min.css';
// import "primevue/resources/themes/saga-blue/theme.css";
import './styles/custom-theme.css';
import 'primeflex/primeflex.css';

const pinia = createPinia();

export const app = createApp(App)
  .use(router)
  .use(pinia)
  .use(PrimeVue)
  .use(ConfirmationService)
  .use(ToastService);

app.directive('tooltip', Tooltip);

app.mount('#app');

export const globalStore = useGlobalStore();
