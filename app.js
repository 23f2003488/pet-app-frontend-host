const { createApp } = Vue;

const App = {
    data() {
        return {
            currentRoute: window.location.hash || '#/home'
        };
    },
    computed: {
        CurrentComponent() {
            return routes[this.currentRoute] || NotFound;
        }
    },
    mounted() {
        if (!window.location.hash) {
            window.location.hash = '#/home';
        }
        window.addEventListener('hashchange', () => {
            this.currentRoute = window.location.hash;
        });
    },
    template: `<component :is="CurrentComponent"></component>`
};

createApp(App).mount('#app');