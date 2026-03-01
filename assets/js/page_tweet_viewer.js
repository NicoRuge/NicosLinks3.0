const TweetViewerView = {
    template: `
        <div class="container-fluid px-4 tweet-viewer-page">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
                <div>
                    <h1 class="h3 mb-1">Post Viewer</h1>
                    <p class="text-secondary mb-0">Paste a tweet or Bluesky post URL to generate a shareable card.</p>
                </div>
            </div>

            <div class="row g-4 align-items-start">
                <!-- Input panel -->
                <div class="col-12 col-xl-4">
                    <div class="card shadow-sm">
                        <div class="card-header bg-body-tertiary fw-semibold">Input</div>
                        <div class="card-body">
                            <label for="tweet-url-input" class="form-label fw-semibold mb-2">Post URL</label>
                            <div class="input-group">
                                <input
                                    id="tweet-url-input"
                                    type="url"
                                    class="form-control font-monospace"
                                    placeholder="https://x.com/user/status/... or bsky.app/..."
                                    v-model.trim="tweetUrl"
                                    @keydown.enter="fetchTweet"
                                    :disabled="loading"
                                />
                                <button
                                    class="btn btn-primary"
                                    type="button"
                                    @click="fetchTweet"
                                    :disabled="loading || !tweetUrl"
                                >
                                    <span v-if="loading" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
                                    <span v-else class="me-1">&#x2192;</span>
                                    Load
                                </button>
                            </div>
                            <div class="form-text mt-2">Supports x.com, twitter.com and bsky.app URLs.</div>

                            <div v-if="error" class="alert alert-danger mt-3 mb-0 d-flex align-items-start justify-content-between gap-3" role="alert">
                                <div>
                                    <div class="fw-semibold mb-1">Couldn't load post</div>
                                    <div class="small">{{ error }}</div>
                                </div>
                                <button type="button" class="btn-close" aria-label="Close" @click="error = ''"></button>
                            </div>

                            <div v-if="tweet" class="mt-4">
                                <div class="fw-semibold mb-2">Card style</div>
                                <div class="d-flex flex-wrap gap-2">
                                    <div v-for="style in cardStyles" :key="style.id">
                                        <input
                                            class="btn-check"
                                            type="radio"
                                            name="tweet-card-style"
                                            :id="'tcs-' + style.id"
                                            :value="style.id"
                                            v-model="cardStyle"
                                            autocomplete="off"
                                        />
                                        <label class="btn btn-sm btn-outline-secondary" :for="'tcs-' + style.id">
                                            {{ style.label }}
                                        </label>
                                    </div>
                                </div>

                                <div class="mt-3 d-flex gap-2">
                                    <button class="btn btn-sm btn-outline-secondary flex-fill" @click="copyCard">
                                        <i class="bi bi-clipboard me-1"></i>
                                        Copy
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary flex-fill" @click="saveCard">
                                        <i class="bi bi-download me-1"></i>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card preview -->
                <div class="col-12 col-xl-8">
                    <div v-if="!tweet && !loading" class="text-secondary text-center py-5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-3 opacity-25" aria-hidden="true">
                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                        </svg>
                        <p class="mb-0">No tweet loaded yet. Paste a URL and click Load.</p>
                    </div>

                    <div v-if="loading" class="text-center py-5">
                        <div class="spinner-border text-secondary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="text-secondary mt-3 mb-0">Fetching tweet data…</p>
                    </div>

                    <!-- Tweet Card -->
                    <div v-if="tweet && !loading" class="tweet-card-wrapper">
                        <div
                            ref="tweetCard"
                            class="tweet-card"
                            :class="'tweet-card--' + cardStyle"
                        >
                            <!-- Card Header -->
                            <div class="tweet-card__header">
                                <div class="tweet-card__avatar-wrap">
                                    <img
                                        v-if="tweet.avatarUrl"
                                        :src="tweet.avatarUrl"
                                        alt=""
                                        class="tweet-card__avatar"
                                        referrerpolicy="no-referrer"
                                        loading="lazy"
                                        @error="onAvatarError"
                                    />
                                    <div v-else class="tweet-card__avatar-fallback">
                                        {{ avatarLetter }}
                                    </div>
                                </div>
                                <div class="tweet-card__author">
                                    <div class="tweet-card__display-name">
                                        {{ tweet.displayName }}
                                        <svg v-if="tweet.verified" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="tweet-card__verified" aria-label="Verified">
                                            <path d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.491 4.491 0 0 1-3.497-1.307 4.491 4.491 0 0 1-1.307-3.497A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25z"/>
                                        </svg>
                                    </div>
                                    <div class="tweet-card__handle">@{{ tweet.handle }}</div>
                                </div>
                                <div class="tweet-card__x-logo ms-auto">
                                    <!-- Bluesky logo -->
                                    <img v-if="tweet.platform === 'bluesky'" src="assets/icons/bluesky.svg" class="tweet-card__bluesky-logo" aria-hidden="true" />
                                    <!-- Twitter bird -->
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                                    </svg>
                                </div>
                            </div>

                            <!-- Tweet Text -->
                            <div class="tweet-card__text" v-html="formattedText"></div>

                            <!-- Media (if any) -->
                            <div v-if="tweet.mediaUrl" class="tweet-card__media">
                                <img :src="tweet.mediaUrl" alt="Tweet media" class="tweet-card__media-img" referrerpolicy="no-referrer" />
                            </div>

                            <!-- Date & Time -->
                            <div class="tweet-card__datetime">{{ tweet.formattedDate }}</div>

                            <!-- Divider -->
                            <div class="tweet-card__divider"></div>

                            <!-- Stats + Footer link on same row -->
                            <div class="tweet-card__stats-row">
                                <div class="tweet-card__stats">
                                    <div v-if="tweet.views != null" class="tweet-card__stat">
                                        <span class="tweet-card__stat-value">{{ formatNum(tweet.views) }}</span>
                                        <span class="tweet-card__stat-label">Views</span>
                                    </div>
                                    <div v-if="tweet.likes != null" class="tweet-card__stat">
                                        <span class="tweet-card__stat-value">{{ formatNum(tweet.likes) }}</span>
                                        <span class="tweet-card__stat-label">Likes</span>
                                    </div>
                                    <div v-if="tweet.retweets != null" class="tweet-card__stat">
                                        <span class="tweet-card__stat-value">{{ formatNum(tweet.retweets) }}</span>
                                        <span class="tweet-card__stat-label">Retweets</span>
                                    </div>
                                    <div v-if="tweet.replies != null" class="tweet-card__stat">
                                        <span class="tweet-card__stat-value">{{ formatNum(tweet.replies) }}</span>
                                        <span class="tweet-card__stat-label">Replies</span>
                                    </div>
                                    <div v-if="tweet.bookmarks != null" class="tweet-card__stat">
                                        <span class="tweet-card__stat-value">{{ formatNum(tweet.bookmarks) }}</span>
                                        <span class="tweet-card__stat-label">Bookmarks</span>
                                    </div>
                                </div>
                                <a :href="tweet.url" target="_blank" rel="noopener noreferrer" class="tweet-card__link">
                                    {{ tweet.platform === 'bluesky' ? 'View on Bluesky' : 'View on X' }} &#x2192;
                                </a>
                            </div>
                        </div>

                        <div class="text-secondary small mt-2 text-center">
                            <span v-if="tweet.platform === 'bluesky'">Data via Bluesky public API.</span>
                            <span v-else>Data via <a href="https://fxtwitter.com" target="_blank" rel="noopener noreferrer" class="text-secondary">fxtwitter.com</a>. Some fields may be unavailable due to X API restrictions.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            tweetUrl: '',
            loading: false,
            error: '',
            tweet: null,
            cardStyle: 'light',
            cardStyles: [
                { id: 'light', label: 'Light' },
                { id: 'dark', label: 'Dark' },
                { id: 'dim', label: 'Dim' },
            ]
        };
    },

    computed: {
        avatarLetter() {
            if (!this.tweet) return '?';
            return (this.tweet.displayName || this.tweet.handle || '?').trim().slice(0, 1).toUpperCase();
        },
        formattedText() {
            if (!this.tweet?.text) return '';
            let text = this.escapeHtml(this.tweet.text);
            // Linkify URLs
            text = text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="tweet-card__text-link">$1</a>');
            // Linkify hashtags
            text = text.replace(/#(\w+)/g, '<span class="tweet-card__hashtag">#$1</span>');
            // Linkify mentions
            text = text.replace(/@(\w+)/g, '<span class="tweet-card__mention">@$1</span>');
            // Line breaks
            text = text.replace(/\n/g, '<br>');
            return text;
        }
    },

    methods: {
        escapeHtml(str) {
            return String(str)
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#039;');
        },

        normalizeTweetUrl(raw) {
            let s = (raw || '').trim();
            if (!s) return null;
            if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
            let url;
            try { url = new URL(s); } catch { return null; }
            const host = url.hostname.toLowerCase();
            const isX = host === 'x.com' || host.endsWith('.x.com');
            const isTwitter = host === 'twitter.com' || host.endsWith('.twitter.com');
            const isFxTwitter = host === 'fxtwitter.com' || host === 'vxtwitter.com' || host === 'fixupx.com';
            if (!isX && !isTwitter && !isFxTwitter) return null;
            const m = url.pathname.match(/^\/([^/]+)\/status\/(\d+)/i);
            if (!m) return null;
            return { username: m[1], tweetId: m[2] };
        },

        tweetIdToDate(tweetId) {
            try {
                const id = BigInt(tweetId);
                const ms = Number((id >> 22n) + 1288834974657n);
                return new Date(ms);
            } catch {
                return null;
            }
        },

        formatDateTime(dt) {
            if (!dt) return '';
            return dt.toLocaleString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        },

        formatNum(n) {
            if (n == null) return '';
            if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
            if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
            return n.toLocaleString();
        },

        onAvatarError(e) {
            e.target.style.display = 'none';
        },

        isBlueskyUrl(raw) {
            try {
                const url = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
                const host = url.hostname.toLowerCase();
                return host === 'bsky.app' || host.endsWith('.bsky.app');
            } catch { return false; }
        },

        parseBlueskyUrl(raw) {
            try {
                const url = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
                // Format: /profile/<handle>/post/<rkey>
                const m = url.pathname.match(/^\/profile\/([^/]+)\/post\/([^/]+)/i);
                if (!m) return null;
                return { handle: m[1], rkey: m[2] };
            } catch { return null; }
        },

        async fetchBluesky(parsed) {
            // Resolve DID from handle
            const resolveRes = await fetch(`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(parsed.handle)}`);
            if (!resolveRes.ok) throw new Error(`Could not resolve handle @${parsed.handle}`);
            const { did } = await resolveRes.json();

            const atUri = `at://${did}/app.bsky.feed.post/${parsed.rkey}`;
            const threadRes = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(atUri)}&depth=0`);
            if (!threadRes.ok) throw new Error(`Bluesky API error ${threadRes.status}`);
            const data = await threadRes.json();

            const post = data?.thread?.post;
            if (!post) throw new Error('Post not found');

            const record = post.record || {};
            const author = post.author || {};
            const createdAt = record.createdAt ? new Date(record.createdAt) : null;

            // Extract media (images)
            let mediaUrl = null;
            const images = record?.embed?.images || record?.embed?.media?.images || [];
            if (images.length > 0) mediaUrl = images[0].image?.ref?.$link
                ? `https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${images[0].image.ref.$link}@jpeg`
                : null;

            this.tweet = {
                platform: 'bluesky',
                displayName: author.displayName || author.handle || parsed.handle,
                handle: author.handle || parsed.handle,
                avatarUrl: author.avatar || null,
                verified: false,
                text: record.text || '',
                formattedDate: this.formatDateTime(createdAt),
                likes: post.likeCount ?? null,
                retweets: post.repostCount ?? null,
                replies: post.replyCount ?? null,
                views: null,
                bookmarks: null,
                mediaUrl,
                url: `https://bsky.app/profile/${parsed.handle}/post/${parsed.rkey}`
            };
        },

        async fetchTweet() {
            this.error = '';
            this.tweet = null;

            if (this.isBlueskyUrl(this.tweetUrl)) {
                const parsed = this.parseBlueskyUrl(this.tweetUrl);
                if (!parsed) {
                    this.error = 'Please enter a valid bsky.app post URL (e.g. https://bsky.app/profile/user.bsky.social/post/...)';
                    return;
                }
                this.loading = true;
                try {
                    await this.fetchBluesky(parsed);
                } catch (e) {
                    this.error = `Could not fetch Bluesky post: ${e.message}`;
                } finally {
                    this.loading = false;
                }
                return;
            }

            const parsed = this.normalizeTweetUrl(this.tweetUrl);
            if (!parsed) {
                this.error = 'Please enter a valid x.com, twitter.com or bsky.app URL.';
                return;
            }

            this.loading = true;
            try {
                const apiUrl = `https://api.fxtwitter.com/${encodeURIComponent(parsed.username)}/status/${encodeURIComponent(parsed.tweetId)}`;
                const res = await fetch(apiUrl);
                const json = await res.json();

                if (!res.ok || json.code !== 200 || !json.tweet) {
                    // Fallback to oEmbed for basic info
                    await this.fetchFromOEmbed(parsed);
                    return;
                }

                const t = json.tweet;
                const author = t.author || {};
                const createdAt = t.created_timestamp
                    ? new Date(t.created_timestamp * 1000)
                    : this.tweetIdToDate(parsed.tweetId);

                // Find the best media
                let mediaUrl = null;
                const media = t.media?.all || t.media?.photos || t.media?.videos || [];
                if (media.length > 0) {
                    const photo = media.find(m => m.type === 'photo');
                    if (photo) mediaUrl = photo.url;
                }

                this.tweet = {
                    platform: 'twitter',
                    displayName: author.name || parsed.username,
                    handle: author.screen_name || parsed.username,
                    avatarUrl: author.avatar_url || `https://unavatar.io/twitter/${encodeURIComponent(parsed.username)}?fallback=false`,
                    verified: !!(author.verified || author.is_blue_verified),
                    text: t.text || '',
                    formattedDate: this.formatDateTime(createdAt),
                    likes: t.likes ?? null,
                    retweets: t.retweets ?? null,
                    replies: t.replies ?? null,
                    views: t.views ?? null,
                    bookmarks: t.bookmarks ?? null,
                    mediaUrl,
                    url: `https://x.com/${parsed.username}/status/${parsed.tweetId}`
                };
            } catch (e) {
                // Try oEmbed fallback
                try {
                    await this.fetchFromOEmbed(parsed);
                } catch (e2) {
                    this.error = 'Could not fetch tweet data. This may be blocked by your browser or the tweet may not exist. Try disabling your ad blocker.';
                }
            } finally {
                this.loading = false;
            }
        },

        async fetchFromOEmbed(parsed) {
            const oembedUrl = new URL('https://publish.twitter.com/oembed');
            oembedUrl.searchParams.set('url', `https://twitter.com/${parsed.username}/status/${parsed.tweetId}`);
            oembedUrl.searchParams.set('omit_script', '1');
            oembedUrl.searchParams.set('dnt', 'true');

            const res = await fetch(oembedUrl.toString());
            if (!res.ok) throw new Error(`oEmbed HTTP ${res.status}`);
            const json = await res.json();

            // Extract author handle from URL
            let handle = parsed.username;
            try {
                const u = new URL(json.author_url || '');
                const seg = u.pathname.split('/').filter(Boolean).pop();
                if (seg) handle = seg;
            } catch { }

            // Extract text from oEmbed HTML
            let text = '';
            try {
                const doc = new DOMParser().parseFromString(json.html || '', 'text/html');
                text = doc.querySelector('blockquote.twitter-tweet p')?.textContent?.trim() || '';
            } catch { }

            const createdAt = this.tweetIdToDate(parsed.tweetId);

            this.tweet = {
                platform: 'twitter',
                displayName: json.author_name || handle,
                handle,
                avatarUrl: `https://unavatar.io/twitter/${encodeURIComponent(handle)}?fallback=false`,
                verified: false,
                text,
                formattedDate: this.formatDateTime(createdAt),
                likes: null,
                retweets: null,
                replies: null,
                views: null,
                bookmarks: null,
                mediaUrl: null,
                url: `https://x.com/${parsed.username}/status/${parsed.tweetId}`
            };
        },

        async captureCard() {
            const { default: html2canvas } = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js');
            const el = this.$refs.tweetCard;
            if (!el) throw new Error('Card element not found');
            el.classList.add('tweet-card--capturing');
            try {
                return await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
            } finally {
                el.classList.remove('tweet-card--capturing');
            }
        },

        async copyCard() {
            try {
                const canvas = await this.captureCard();
                canvas.toBlob(async (blob) => {
                    try {
                        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                        alert('Card copied to clipboard!');
                    } catch {
                        const url = canvas.toDataURL('image/png');
                        window.open(url, '_blank');
                    }
                }, 'image/png');
            } catch {
                alert('Could not copy card. Try right-clicking the card to save it.');
            }
        },

        async saveCard() {
            try {
                const canvas = await this.captureCard();
                const handle = this.tweet?.handle || 'tweet';
                const url = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = url;
                a.download = `tweet-${handle}.png`;
                a.click();
            } catch {
                alert('Could not save card. Try right-clicking the card to save it.');
            }
        }
    }
};
