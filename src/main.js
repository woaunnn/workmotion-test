import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#1976d2',
                    secondary: '#424242',
                    accent: '#82B1FF',
                    error: '#d32f2f',
                    info: '#0288d1',
                    success: '#4CAF50',
                    warning: '#f57c00',
                },
            },
        },
    },
})

const app = createApp(App)

app.use(router)
app.use(vuetify)

app.mount('#app')
