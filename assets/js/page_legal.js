const ImprintView = {
    data() {
        return {
            lang: 'de'
        };
    },
    computed: {
        imprintPath() {
            return this.lang === 'de'
                ? 'pages/imprint_DE.html'
                : 'pages/imprint_EN.html';
        }
    },
    template: `
        <div class="container-fluid py-4">
            <div class="row justify-content-center">
                <div class="col-12 col-lg-8 col-xl-7">
                    <div class="card shadow-sm border-0">
                        <div class="card-body p-4 p-md-5">
                            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                                <h1 class="h3 mb-0">Imprint</h1>
                                <div class="btn-group btn-group-sm" role="group" aria-label="Language switch">
                                    <button type="button" class="btn btn-outline-secondary" :class="{ active: lang === 'de' }" @click="lang = 'de'">German</button>
                                    <button type="button" class="btn btn-outline-secondary" :class="{ active: lang === 'en' }" @click="lang = 'en'">English</button>
                                </div>
                            </div>

                            <iframe
                                :src="imprintPath"
                                class="w-100 border rounded"
                                style="height: 70vh; min-height: 520px; background: var(--bs-body-bg);"
                                title="Imprint Document"
                            ></iframe>

                            <div class="small text-secondary mt-3">
                                If the document is not visible, open it directly:
                                <a :href="imprintPath" target="_blank" rel="noopener noreferrer">{{ imprintPath }}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

const PrivacyPolicyView = {
    data() {
        return {
            lang: 'de',
            site: 'main'
        };
    },
    mounted() {
        this.syncSiteFromHash();
        window.addEventListener('hashchange', this.syncSiteFromHash);
    },
    unmounted() {
        window.removeEventListener('hashchange', this.syncSiteFromHash);
    },
    computed: {
        privacyPolicyPath() {
            if (this.site === 'cloud') {
                return this.lang === 'de'
                    ? 'pages/privacy_policy_files_DE.html'
                    : 'pages/privacy_policy_files_EN.html';
            }

            return this.lang === 'de'
                ? 'pages/privacy_policy_DE.html'
                : 'pages/privacy_policy_EN.html';
        }
    },
    methods: {
        syncSiteFromHash() {
            this.site = window.location.hash === '#privacy-policy-cloud' ? 'cloud' : 'main';
        },
        setSite(site) {
            window.location.hash = site === 'cloud' ? 'privacy-policy-cloud' : 'privacy-policy-main';
        }
    },
    template: `
        <div class="container-fluid py-4">
            <div class="row justify-content-center">
                <div class="col-12 col-lg-8 col-xl-7">
                    <div class="card shadow-sm border-0">
                        <div class="card-body p-4 p-md-5">
                            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                <h1 class="h3 mb-0">Privacy Policy</h1>
                                <div class="btn-group btn-group-sm" role="group" aria-label="Language switch">
                                    <button type="button" class="btn btn-outline-secondary" :class="{ active: lang === 'de' }" @click="lang = 'de'">German</button>
                                    <button type="button" class="btn btn-outline-secondary" :class="{ active: lang === 'en' }" @click="lang = 'en'">English</button>
                                </div>
                            </div>
                            <div class="d-flex justify-content-end mb-4">
                                <div class="btn-group btn-group-sm" role="group" aria-label="Website switch">
                                    <button type="button" class="btn btn-outline-secondary" :class="{ active: site === 'main' }" @click="setSite('main')">Main Website</button>
                                    <button type="button" class="btn btn-outline-secondary" :class="{ active: site === 'cloud' }" @click="setSite('cloud')">Cloud</button>
                                </div>
                            </div>

                            <iframe
                                :src="privacyPolicyPath"
                                class="w-100 border rounded"
                                style="height: 70vh; min-height: 520px; background: var(--bs-body-bg);"
                                title="Privacy Policy Document"
                            ></iframe>

                            <div class="small text-secondary mt-3">
                                If the document is not visible, open it directly:
                                <a :href="privacyPolicyPath" target="_blank" rel="noopener noreferrer">{{ privacyPolicyPath }}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
