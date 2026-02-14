const PhotographyView = {
    template: `
        <div class="container-fluid py-4">
            <div class="row justify-content-center">
                <div class="col-12 col-xl-10" style="max-width: 1200px;">
                    <h1 class="h3 mb-4">Photography</h1>

                    <div class="row g-4">
                        <div v-for="carousel in carousels" :key="carousel.id" class="col-12 col-md-6">
                            <h3 class="h5 mb-3 text-secondary text-start">{{ carousel.title }}</h3>
                            <div :id="carousel.id" class="carousel slide carousel-fade shadow rounded-4 overflow-hidden photo-carousel" data-bs-ride="carousel">
                                <div class="carousel-indicators">
                                    <button
                                        v-for="(slide, index) in carousel.slides"
                                        :key="carousel.id + '-indicator-' + index"
                                        type="button"
                                        :data-bs-target="'#' + carousel.id"
                                        :data-bs-slide-to="index"
                                        :class="{ active: index === 0 }"
                                        :aria-current="index === 0 ? 'true' : null"
                                        :aria-label="'Slide ' + (index + 1)"
                                    ></button>
                                </div>
                                <div class="carousel-inner" @click="handleCarouselClick">
                                    <div
                                        v-for="(slide, index) in carousel.slides"
                                        :key="carousel.id + '-slide-' + index"
                                        class="carousel-item"
                                        :class="{ active: index === 0 }"
                                        :data-bs-interval="carousel.interval"
                                    >
                                        <img
                                            :src="getSlideImageUrl(slide)"
                                            :data-internal-id="slide.internalId || null"
                                            :data-photo-id="slide.photoId || null"
                                            class="d-block w-100 photo-carousel-img"
                                            :alt="slide.alt || (carousel.title + ' ' + (index + 1))"
                                        >
                                    </div>
                                </div>
                                <button class="carousel-control-prev" type="button" :data-bs-target="'#' + carousel.id" data-bs-slide="prev">
                                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Previous</span>
                                </button>
                                <button class="carousel-control-next" type="button" :data-bs-target="'#' + carousel.id" data-bs-slide="next">
                                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span class="visually-hidden">Next</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="modal fade" id="photoLightboxModal" tabindex="-1" aria-hidden="true" ref="photoLightboxModal">
                        <div class="modal-dialog modal-dialog-centered modal-xl">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">{{ lightboxTitle }}</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body p-0 bg-body-tertiary">
                                    <img v-if="lightboxImage" :src="lightboxImage" :alt="lightboxTitle" class="d-block w-100 photo-lightbox-img">
                                </div>
                                <div class="modal-footer">
                                    <a v-if="lightboxFullResUrl" class="btn btn-outline-secondary" :href="lightboxFullResUrl" target="_blank" rel="noopener noreferrer">
                                        Open on Unsplash to download
                                        <i class="bi bi-box-arrow-up-right ms-1"></i>
                                    </a>
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            carousels: [
                {
                    id: 'carouselPhoto1',
                    title: 'Trains',
                    interval: 4500,
                    slides: [
                        { internalId: '1709192525551-2147fccfaf12', photoId: 'yTPd7pUBpRM', alt: 'Trains 1' },
                        { internalId: '1768213021718-9f738eabb363', photoId: 'GmG8EMXZWEU', alt: 'Trains 2' },
                        { internalId: '1752312304247-b920759fc551', photoId: 'k5x-_6dljUI', alt: 'Trains 3' },
                        { internalId: '1723816254296-6b8bf36e1cc9', photoId: 'wTqJM-x9plo', alt: 'Trains 4' },
                        { internalId: '1708753662011-7db4eed9d054', photoId: 'Yt-MnkoOF2U', alt: 'Trains 5' },
                        { internalId: '1768160308364-2ecc0d70f364', photoId: 'E2IAeEVz3uI', alt: 'Trains 6' },
                    ]
                },
                {
                    id: 'carouselPhoto2',
                    title: 'Urban & Architecture',
                    interval: 4500,
                    slides: [
                        { internalId: '1680681590567-ff13632428e7', photoId: 'VralncbzdlY', alt: 'Urban 1' },
                        { internalId: '1672430455100-c4d2b27612a3', photoId: 'knMaF4lYPCw', alt: 'Urban 2' },
                        { internalId: '1652546129961-bba64fc0920f', photoId: 'gfyLJog41i0', alt: 'Urban 3' },
                        { internalId: '1768165085210-6832ccd35ff0', photoId: 'xFsHtFEgcOc', alt: 'Urban 4' }
                    ]
                },
                {
                    id: 'carouselPhoto3',
                    title: 'Animals',
                    interval: 4500,
                    slides: [
                        { internalId: '1672855415934-d9bb7f4d8b19', photoId: 'v9J36Vz9e8c', alt: 'Animals 1' },
                        { internalId: '1704662370387-b9328e6a7089', photoId: 'Bh9LJv_kUwE', alt: 'Animals 2' },
                        { internalId: '1752312303988-f2663ed2dbfa', photoId: 'mQHNZZkPijE', alt: 'Animals 3' },
                        { internalId: '1752312304011-5c34edeb20cb', photoId: 'fOiAXX4bl5o', alt: 'Animals 4' },
                        { internalId: '1653211072239-aa054221e1ec', photoId: 'mv6fXQT58', alt: 'Animals 5' }
                    ]
                },
                {
                    id: 'carouselPhoto4',
                    title: 'Events',
                    interval: 4500,
                    slides: [
                        { internalId: '', photoId: '', alt: 'Events 1' },
                        { internalId: '', photoId: '', alt: 'Events 2' },
                        { internalId: '', photoId: '', alt: 'Events 3' },
                        { internalId: '', photoId: '', alt: 'Events 4' },
                        { internalId: '', photoId: '', alt: 'Events 5' }
                    ]
                }
            ],
            lightboxImage: '',
            lightboxFullResUrl: '',
            lightboxTitle: 'Image',
            _photoLightboxModalInstance: null
        }
    },
    methods: {
        getCroppedUnsplashUrl(internalId) {
            if (!internalId) return ''
            return `https://images.unsplash.com/photo-${internalId}?q=80&w=1080&auto=format&fit=crop`
        },
        getUnsplashPhotoPageUrl(photoId) {
            if (!photoId) return ''
            return `https://unsplash.com/photos/${photoId}`
        },
        getSlideImageUrl(slide) {
            if (slide?.internalId) return this.getCroppedUnsplashUrl(slide.internalId)
            return slide?.imageUrl || ''
        },
        handleCarouselClick(event) {
            const img = event?.target?.closest?.('img.photo-carousel-img')
            if (!img) return

            const internalId = img.getAttribute('data-internal-id') || ''
            const photoId = img.getAttribute('data-photo-id') || ''
            this.lightboxImage = internalId ? this.getCroppedUnsplashUrl(internalId) : (img.getAttribute('src') || '')
            this.lightboxFullResUrl = photoId ? this.getUnsplashPhotoPageUrl(photoId) : (img.getAttribute('src') || '')
            this.lightboxTitle = img.getAttribute('alt') || 'Image'

            this.$nextTick(() => {
                const modalEl = this.$refs.photoLightboxModal
                if (!modalEl || !window.bootstrap) return
                this._photoLightboxModalInstance = window.bootstrap.Modal.getOrCreateInstance(modalEl)
                this._photoLightboxModalInstance.show()
            })
        }
    },
    beforeUnmount() {
        if (this._photoLightboxModalInstance) {
            this._photoLightboxModalInstance.hide()
        }
    }
};
