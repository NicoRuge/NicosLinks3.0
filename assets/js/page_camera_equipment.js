const CameraEquipmentView = {
    data() {
        return {
            affiliateNoticeLanguage: 'de',
            cameras: [
                { name: 'Sony Alpha 7 III', detail: 'ILCE-7M3', affiliateUrl: 'https://amzn.to/4atHut9' },
                { name: 'Praktica Mat', detail: '35mm (ca. 1965)', affiliateUrl: '' },
                { name: 'Polaroid Supercolor 635CL', detail: '(ca. 1981)', affiliateUrl: '' },
                { name: 'Google Pixel 9 Pro', detail: '', affiliateUrl: 'https://amzn.to/46y93jM' }
            ],
            lenses: [
                { name: 'Sony FE 70-200mm f/4 G OSS', detail: '', affiliateUrl: 'https://amzn.to/4tswZim' },
                { name: 'Sigma Makro 105mm f/2.8 DG OS HSM', detail: '', affiliateUrl: 'https://amzn.to/4cuZp5f' },
                { name: 'Sony FE 28-70 f/3.5-5.6', detail: '', affiliateUrl: '' },
                { name: 'Samyang T1.5 24mm ED AS IF UMC II', detail: '', affiliateUrl: 'https://amzn.to/4asct8Y' }
            ],
            storageInCamera: [
                { name: 'RAW - SanDisk Extreme Pro 256 GB', detail: '', affiliateUrl: 'https://amzn.to/4tJrR9V' },
                { name: 'JPEG - SanDisk Ultra 32 GB', detail: '', affiliateUrl: 'https://amzn.to/4ahPuyv' }
            ],
            storageExternal: [
                { name: 'Samsung T7 500 GB', detail: '', affiliateUrl: 'https://amzn.to/4qEVPJn' },
                { name: 'WD MyBook 4 TB', detail: '', affiliateUrl: '' },
                { name: 'Google Photos', detail: '', affiliateUrl: '' }
            ],
            flashItems: [
                { name: 'Yongnou Speedlite YN560 IV', detail: '', affiliateUrl: 'https://amzn.to/4kKcb24' }
            ],
            software: [
                { name: 'Affinity', detail: '', affiliateUrl: '' },
                { name: 'Adobe Lightroom Classic', detail: '', affiliateUrl: '' },
                { name: 'Adobe Photoshop', detail: '', affiliateUrl: '' }
            ]
        };
    },
    computed: {
        equipmentSections() {
            return [
                {
                    id: 'cameras',
                    title: 'Cameras',
                    icon: 'bi-camera',
                    tone: 'camera',
                    description: 'Bodies currently used across digital, film, and instant workflows.',
                    items: this.cameras
                },
                {
                    id: 'lenses',
                    title: 'Lenses',
                    icon: 'bi-vinyl',
                    tone: 'lens',
                    description: 'Main focal lengths for travel, portraits, and macro.',
                    items: this.lenses
                },
                {
                    id: 'storage',
                    title: 'Storage',
                    icon: 'bi-hdd-fill',
                    tone: 'storage',
                    description: 'Capture media and archival destinations.',
                    groups: [
                        { title: 'In-Camera', items: this.storageInCamera },
                        { title: 'External', items: this.storageExternal }
                    ]
                },
                {
                    id: 'flash',
                    title: 'Flash',
                    icon: 'bi-lightning-fill',
                    tone: 'flash',
                    description: 'Portable lighting used for controlled scenes.',
                    items: this.flashItems
                },
                {
                    id: 'software',
                    title: 'Software',
                    icon: 'bi-display',
                    tone: 'software',
                    description: 'Editing and post-production stack.',
                    items: this.software
                }
            ];
        }
    },
    methods: {
        hasAffiliateUrl(item) {
            return !!(item && item.affiliateUrl && item.affiliateUrl.trim());
        },
        setAffiliateNoticeLanguage(language) {
            this.affiliateNoticeLanguage = language === 'en' ? 'en' : 'de';
        },
        getAffiliateNoticeText() {
            if (this.affiliateNoticeLanguage === 'en') {
                return 'Some links on this page are affiliate links. If you buy something through them, I may receive a small commission. The price stays the same for you.';
            }

            return 'Einige der Links auf dieser Seite sind Affiliate Links. Wenn du darüber etwas kaufst, bekomme ich eine kleine Provision. Der Preis für dich bleibt gleich.';
        }
    },
    template: `
        <div class="container-fluid py-4 camera-equipment-page">
            <div class="row justify-content-center">
                <div class="col-12 hero-page-shell">
                    <section class="portfolio-hero equipment-hero rounded-4 p-4 p-lg-5 mb-4">
                        <div class="d-flex flex-column flex-lg-row justify-content-between gap-3">
                            <div>
                                <h1 class="hero-title mb-2">Camera Equipment</h1>
                                <p class="mb-0 hero-subtitle">Current gear and software used in this photography setup.</p>
                            </div>
                            <div class="btn-group btn-group-sm align-self-start align-self-lg-center" role="group" aria-label="Affiliate notice language">
                                <button type="button" class="btn" :class="affiliateNoticeLanguage === 'de' ? 'btn-light text-dark' : 'btn-outline-light'" @click="setAffiliateNoticeLanguage('de')">DE</button>
                                <button type="button" class="btn" :class="affiliateNoticeLanguage === 'en' ? 'btn-light text-dark' : 'btn-outline-light'" @click="setAffiliateNoticeLanguage('en')">EN</button>
                            </div>
                        </div>
                        <div class="mt-3 mb-0 small text-white-50">
                            <i class="bi bi-info-circle me-2"></i>
                            {{ getAffiliateNoticeText() }}
                            <a href="#privacy-policy-main" class="ms-1 link-light fw-semibold">{{ affiliateNoticeLanguage === 'de' ? 'Hier geht es zur Datenschutzerklaerung.' : 'See the Privacy Policy here.' }}</a>
                        </div>
                    </section>

                    <div class="row g-4 equipment-grid">
                        <div v-for="section in equipmentSections" :key="section.id" class="col-12 col-md-6">
                            <article class="card equipment-collection border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                                <div class="card-body p-3 p-lg-4">
                                    <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
                                        <div class="d-flex align-items-center gap-3">
                                            <span class="equipment-icon" :class="'equipment-icon--' + section.tone">
                                                <i class="bi" :class="section.icon"></i>
                                            </span>
                                            <h2 class="h5 mb-0">{{ section.title }}</h2>
                                        </div>
                                    </div>
                                    <p class="equipment-section-note small text-secondary mb-3">{{ section.description }}</p>

                                    <template v-if="section.groups">
                                        <div v-for="group in section.groups" :key="section.id + '-' + group.title" class="equipment-group mb-3">
                                            <h3 class="small text-uppercase fw-semibold text-secondary mb-2">{{ group.title }}</h3>
                                            <ul class="list-unstyled mb-0 d-flex flex-column gap-2">
                                                <li v-for="item in group.items" :key="group.title + '-' + item.name" class="equipment-item-row">
                                                    <div class="flex-grow-1">
                                                        <div class="fw-semibold">{{ item.name }}</div>
                                                        <small v-if="item.detail" class="text-secondary">{{ item.detail }}</small>
                                                    </div>
                                                    <a v-if="hasAffiliateUrl(item)" :href="item.affiliateUrl" target="_blank" rel="sponsored noopener noreferrer" class="btn btn-sm btn-outline-secondary equipment-affiliate-btn">Amazon</a>
                                                </li>
                                            </ul>
                                        </div>
                                    </template>

                                    <template v-else>
                                        <ul class="list-unstyled mb-0 d-flex flex-column gap-2">
                                            <li v-for="item in section.items" :key="section.id + '-' + item.name" class="equipment-item-row">
                                                <div class="flex-grow-1">
                                                    <div class="fw-semibold">{{ item.name }}</div>
                                                    <small v-if="item.detail" class="text-secondary">{{ item.detail }}</small>
                                                </div>
                                                <a v-if="hasAffiliateUrl(item)" :href="item.affiliateUrl" target="_blank" rel="sponsored noopener noreferrer" class="btn btn-sm btn-outline-secondary equipment-affiliate-btn">Amazon</a>
                                            </li>
                                        </ul>
                                    </template>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
