const XThreadViewerView = {
    template: `
        <div class="container-fluid px-4">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <div>
                    <h1 class="h3 mb-1">X Thread Viewer</h1>
                    <p class="text-secondary mb-0">
                        Paste tweet links with leading dashes to define nesting, then render a Reddit-style thread.
                    </p>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-12 col-xl-5 x-thread-print-hide">
                    <div class="card shadow-sm">
                        <div class="card-header bg-body-tertiary d-flex align-items-center justify-content-between">
                            <div class="fw-semibold">Input</div>
                            <div class="d-flex align-items-center gap-2">
                                <div class="text-secondary small me-2">Enter adds row</div>
                                <button class="btn btn-sm btn-outline-secondary" type="button" @click="fillExample">
                                    <i class="bi bi-magic me-1"></i>
                                    Example
                                </button>
                                <button class="btn btn-sm btn-primary" type="button" @click="generate" :disabled="generating">
                                    <span v-if="generating" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                    Generate
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <div class="fw-semibold">Tweet links</div>
                                <button class="btn btn-sm btn-outline-primary" type="button" @click="addEntry()">
                                    <i class="bi bi-plus-lg me-1"></i>
                                    Add line
                                </button>
                            </div>

                            <div class="vstack gap-2">
                                <div v-for="(entry, idx) in entries" :key="entry.id" class="input-group" data-x-thread-entry>
                                    <span class="input-group-text">Level</span>
                                    <select class="form-select" v-model.number="entry.level" style="max-width: 110px;" data-x-thread-level>
                                        <option v-for="n in 11" :key="'lvl-' + n" :value="n - 1">{{ n - 1 }}</option>
                                    </select>
                                    <input
                                        :id="'x-thread-url-' + idx"
                                        type="text"
                                        class="form-control font-monospace"
                                        placeholder="https://x.com/<user>/status/<id>"
                                        v-model.trim="entry.url"
                                        data-x-thread-url
                                        @keydown="handleEntryKeydown($event, idx)"
                                    />
                                    <button class="btn btn-outline-secondary" type="button" @click="removeEntry(idx)" :disabled="entries.length === 1">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="form-text mt-2">
                                Limit: <span class="fw-semibold">{{ maxTweets }}</span> tweets. Set nesting via <span class="fw-semibold">Level</span> (0 = top). Empty lines are ignored.
                            </div>

                            <div class="d-flex justify-content-end mt-3">
                                <button class="btn btn-sm btn-outline-secondary" type="button" @click="copyLinks" :disabled="!entries || !entries.length">
                                    <i class="bi bi-clipboard me-1"></i>
                                    Copy links
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="showLoadedNotice" class="alert alert-success mt-3 mb-0 d-flex align-items-start justify-content-between gap-3" role="status">
                        <div>
                            <div class="fw-semibold mb-1">Loaded</div>
                            <div class="small">X Thread Viewer is ready.</div>
                        </div>
                        <button type="button" class="btn-close" aria-label="Close" @click="showLoadedNotice = false"></button>
                    </div>

                    <div v-if="errors.length" class="alert alert-danger mt-3 mb-0 d-flex align-items-start justify-content-between gap-3" role="alert">
                        <div>
                            <div class="fw-semibold mb-1">Couldn’t generate thread</div>
                            <ul class="mb-0 ps-3">
                                <li v-for="(e, idx) in errors" :key="'e-' + idx">{{ e }}</li>
                            </ul>
                        </div>
                        <button type="button" class="btn-close" aria-label="Close" @click="errors = []"></button>
                    </div>

                    <div v-if="warnings.length" class="alert alert-warning mt-3 mb-0 d-flex align-items-start justify-content-between gap-3" role="alert">
                        <div>
                            <div class="fw-semibold mb-1">Warnings</div>
                            <ul class="mb-0 ps-3">
                                <li v-for="(w, idx) in warnings" :key="'w-' + idx">{{ w }}</li>
                            </ul>
                        </div>
                        <button type="button" class="btn-close" aria-label="Close" @click="warnings = []"></button>
                    </div>
                </div>

                <div class="col-12 col-xl-7">
                    <div class="card shadow-sm">
                        <div class="card-header bg-body-tertiary d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div class="fw-semibold">Thread</div>
                            <div class="d-flex align-items-center gap-2">
                                <div class="text-secondary small" v-if="statsText">{{ statsText }}</div>
                                <button class="btn btn-sm btn-outline-secondary" type="button" @click="printThread" :disabled="!threadHtml || generating">
                                    <i class="bi bi-printer me-1"></i>
                                    Print
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div v-if="!threadHtml" class="text-secondary">
                                No thread yet. Paste links and click <span class="fw-semibold">Generate</span>.
                            </div>
                            <div v-else ref="threadContainer" v-html="threadHtml"></div>
                        </div>
                    </div>
                    <div class="text-secondary small mt-2">
                        Note: Tweet text/profile lookups can be blocked by browser privacy settings, ad blockers, or X restrictions.
                    </div>
                </div>
            </div>
        </div>
    `,
	    data() {
	        const mkId = () => (crypto.randomUUID?.() || `e-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	        return {
	            inputText: '',
	            entries: [{ id: mkId(), level: 0, url: '' }],
	            maxTweets: 10,
	            showLoadedNotice: true,
	            generating: false,
	            errors: [],
	            warnings: [],
	            tweetCount: 0,
	            threadHtml: '',
	            summariesByNodeId: {}
	        };
	    },
    computed: {
        statsText() {
            if (!this.threadHtml) return '';
            return `${this.tweetCount} tweet${this.tweetCount === 1 ? '' : 's'}`;
        }
    },
	    methods: {
        makeEntryId() {
            return (crypto.randomUUID?.() || `e-${Date.now()}-${Math.random().toString(16).slice(2)}`);
        },
	        addEntry(afterIndex = null) {
	            if ((this.entries?.length || 0) >= this.maxTweets) {
	                this.warnings = [...(this.warnings || []), `Limit reached: max ${this.maxTweets} tweets.`];
	                return;
	            }
	            const newEntry = { id: this.makeEntryId(), level: 0, url: '' };
	            if (afterIndex === null || afterIndex < 0 || afterIndex >= this.entries.length) {
	                this.entries.push(newEntry);
	            } else {
                this.entries.splice(afterIndex + 1, 0, newEntry);
            }
        },
        removeEntry(index) {
            if (this.entries.length <= 1) return;
            if (index < 0 || index >= this.entries.length) return;
            this.entries.splice(index, 1);
        },
        handleEntryKeydown(e, idx) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addEntry(idx);
                this.$nextTick(() => {
                    const el = this.$el?.querySelector?.(`#x-thread-url-${idx + 1}`);
                    el?.focus?.();
                });
            }
        },
        fillExample() {
            const sample = [
                { level: 0, url: 'https://x.com/jack/status/20' },
                { level: 1, url: 'https://x.com/jack/status/21' },
                { level: 1, url: 'https://x.com/jack/status/22' },
                { level: 2, url: 'https://x.com/jack/status/23' },
                { level: 1, url: 'https://x.com/jack/status/24' }
            ];
            this.entries = sample.map((s) => ({
                id: this.makeEntryId(),
                level: s.level,
                url: s.url
            }));
            this.errors = [];
            this.warnings = [];
        },
        printThread() {
            // Print current page with print CSS rules to focus on the thread.
            window.print();
        },
        async copyLinks() {
            const rawInput = this.entriesToRawInput();
            try {
                await navigator.clipboard.writeText(rawInput);
                this.warnings = [...(this.warnings || []), 'Copied links to clipboard.'];
            } catch {
                this.warnings = [...(this.warnings || []), 'Could not copy to clipboard.'];
            }
        },
	        entriesToRawInput() {
	            const lines = [];
	            for (const entry of this.entries || []) {
	                const url = String(entry?.url || '').trim();
	                if (!url) continue;
	                const level = Math.max(0, Math.min(30, Number(entry?.level ?? 0) || 0));
	                lines.push(`${'-'.repeat(level)}${url}`);
	                if (lines.length >= this.maxTweets) break;
	            }
	            return lines.join('\n');
	        },
	        entriesArrayToRawInput(entries) {
	            const lines = [];
	            for (const entry of entries || []) {
	                const url = String(entry?.url || '').trim();
	                if (!url) continue;
	                const level = Math.max(0, Math.min(30, Number(entry?.level ?? 0) || 0));
	                lines.push(`${'-'.repeat(level)}${url}`);
	                if (lines.length >= this.maxTweets) break;
	            }
	            return lines.join('\n');
	        },
        readEntriesFromDom() {
            const root = this.$el;
            if (!root?.querySelectorAll) return null;

            const rows = Array.from(root.querySelectorAll('[data-x-thread-entry]'));
            return rows.map((row) => {
                const levelEl = row.querySelector('[data-x-thread-level]');
                const urlEl = row.querySelector('[data-x-thread-url]');
                const level = Math.max(0, Math.min(30, Number(levelEl?.value ?? 0) || 0));
                const url = String(urlEl?.value ?? '').trim();
                return { level, url };
            });
        },
        escapeHtml(text) {
            return String(text)
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#039;');
        },
        stripUrlPunctuation(text) {
            let s = String(text || '').trim();
            if (!s) return s;

            const leading = /^[<(\["'`]+/;
            const trailing = /[>)\]"'`,.]+$/;
            s = s.replace(leading, '').replace(trailing, '');
            return s;
        },
        extractFirstUrl(text) {
            const s = String(text || '');
            const match = s.match(/(https?:\/\/\S+|(?:x|twitter)\.com\/\S+|t\.co\/\S+)/i);
            if (!match) return null;
            return this.stripUrlPunctuation(match[1]);
        },
        normalizeTweetUrl(raw) {
            let urlString = this.stripUrlPunctuation(raw || '');
            if (!urlString) return null;
            if (!/^https?:\/\//i.test(urlString)) urlString = `https://${urlString}`;

            let url;
            try {
                url = new URL(urlString);
            } catch {
                return null;
            }

            if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

            const host = url.hostname.toLowerCase();

            if (host === 't.co') {
                return { href: url.href, tweetId: null };
            }

            const isX = host === 'x.com' || host.endsWith('.x.com');
            const isTwitter = host === 'twitter.com' || host.endsWith('.twitter.com');
            const isMobileTwitter = host === 'mobile.twitter.com';
            const isKnownWrapper = [
                'fxtwitter.com',
                'vxtwitter.com',
                'fixupx.com',
                'nitter.net'
            ].includes(host);
            if (!isX && !isTwitter && !isMobileTwitter && !isKnownWrapper) return null;

            const path = url.pathname;
            const matchUserStatus = path.match(/^\/([^/]+)\/status\/(\d+)/i);
            const matchWebStatus = path.match(/^\/i\/web\/status\/(\d+)/i);

            let normalizedPath = null;
            if (matchUserStatus) normalizedPath = `/${matchUserStatus[1]}/status/${matchUserStatus[2]}`;
            if (!normalizedPath && matchWebStatus) normalizedPath = `/i/web/status/${matchWebStatus[1]}`;
            if (!normalizedPath) return null;

            return {
                href: `https://twitter.com${normalizedPath}`,
                tweetId: matchUserStatus?.[2] || matchWebStatus?.[1] || null,
                username: matchUserStatus?.[1] || null
            };
        },
        tweetIdToDate(tweetId) {
            if (!tweetId) return null;
            try {
                const id = BigInt(tweetId);
                const twitterEpochMs = 1288834974657n;
                const ms = Number((id >> 22n) + twitterEpochMs);
                if (!Number.isFinite(ms)) return null;
                return new Date(ms);
            } catch {
                return null;
            }
        },
        formatDateTime(dt) {
            if (!(dt instanceof Date) || Number.isNaN(dt.getTime())) return '';
            return dt.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        parseOEmbedHtmlToTextAndDate(oembedHtml) {
            if (!oembedHtml) return { text: null, dateText: null };
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(oembedHtml, 'text/html');
                const p = doc.querySelector('blockquote.twitter-tweet p');
                const a = doc.querySelector('blockquote.twitter-tweet a');
                return {
                    text: p?.textContent?.trim() || null,
                    dateText: a?.textContent?.trim() || null
                };
            } catch {
                return { text: null, dateText: null };
            }
        },
        async fetchTweetSummary(node) {
            const createdAt = this.tweetIdToDate(node.tweetId);
            const createdAtText = this.formatDateTime(createdAt);
            const fallbackAuthor = node.username ? `@${node.username}` : 'Unknown';

            try {
                const oembedUrl = new URL('https://publish.twitter.com/oembed');
                oembedUrl.searchParams.set('url', node.href);
                oembedUrl.searchParams.set('omit_script', '1');
                oembedUrl.searchParams.set('dnt', 'true');

                const res = await fetch(oembedUrl.toString(), { method: 'GET' });
                if (!res.ok) throw new Error(`oEmbed HTTP ${res.status}`);
                const json = await res.json();

                const authorName = (json?.author_name || '').trim();
                const authorUrl = (json?.author_url || '').trim();
                let author = authorName || fallbackAuthor;
                let handle = node.username || null;
                if (authorUrl) {
                    try {
                        const u = new URL(authorUrl);
                        const seg = u.pathname.split('/').filter(Boolean).pop();
                        if (seg) {
                            author = `@${seg}`;
                            handle = handle || seg;
                        }
                    } catch { }
                }

                const parsed = this.parseOEmbedHtmlToTextAndDate(json?.html);
                return {
                    author,
                    handle,
                    text: parsed.text,
                    createdAtText,
                    href: node.href
                };
            } catch (e) {
                return {
                    author: fallbackAuthor,
                    handle: node.username || null,
                    text: null,
                    createdAtText,
                    href: node.href,
                    error: String(e?.message || e)
                };
            }
        },
        flattenNodes(nodes) {
            const out = [];
            const walk = (list) => {
                for (const n of list) {
                    out.push(n);
                    if (n.children?.length) walk(n.children);
                }
            };
            walk(nodes || []);
            return out;
        },
        parseLinesToTree(input) {
            const errors = [];
            const warnings = [];

            const root = { id: 'root', depth: -1, children: [] };
            const stack = [root];
            let tweetCount = 0;
            let seq = 0;

            const normalizedInput = String(input || '')
                // Handle uncommon line separators that can show as newlines in <pre> but won't match \n.
                .replaceAll('\u2028', '\n')
                .replaceAll('\u2029', '\n')
                .replaceAll('\u0085', '\n');
            const lines = normalizedInput.split(/\r\n|\n|\r/);
            for (let i = 0; i < lines.length; i++) {
                const line = String(lines[i] || '');
                let s = line.trim();
                if (!s) continue;

                let desiredDepth = 0;
                while (desiredDepth < s.length) {
                    const ch = s[desiredDepth];
                    if (ch === '-' || ch === '–' || ch === '—') {
                        desiredDepth++;
                        continue;
                    }
                    break;
                }

                const rawRemainder = s.slice(desiredDepth).trim();
                if (!rawRemainder) {
                    warnings.push(`Line ${i + 1}: Only dashes found; ignored.`);
                    continue;
                }

                const urlCandidate = this.extractFirstUrl(rawRemainder);
                if (!urlCandidate) {
                    errors.push(`Line ${i + 1}: No URL found.`);
                    continue;
                }

                const normalized = this.normalizeTweetUrl(urlCandidate);
                if (!normalized) {
                    errors.push(`Line ${i + 1}: Not a valid tweet URL: "${rawRemainder}"`);
                    continue;
                }

                let depth = desiredDepth;
                const maxAllowedDepth = stack.length - 1;
                if (depth > maxAllowedDepth) {
                    warnings.push(`Line ${i + 1}: Depth ${depth} has no parent; clamped to ${maxAllowedDepth}.`);
                    depth = maxAllowedDepth;
                }

                while (stack.length > depth + 1) stack.pop();
                const parent = stack[depth];

                const node = {
                    id: `t-${seq++}`,
                    depth,
                    href: normalized.href,
                    tweetId: normalized.tweetId,
                    username: normalized.username,
                    lineNumber: i + 1,
                    children: []
                };

                parent.children.push(node);
                stack.push(node);
                tweetCount++;
            }

            return { root, errors, warnings, tweetCount };
        },
        renderTreeHtml(nodes) {
            const renderNodes = (list) => {
                return list.map((n) => {
                    const safeHref = this.escapeHtml(n.href);
                    const summary = this.summariesByNodeId?.[n.id] || null;
                    const author = summary?.author ? this.escapeHtml(summary.author) : 'Unknown';
                    const avatarLetter = this.escapeHtml((String(summary?.author || '')
                        .replace(/^@/, '')
                        .trim()
                        .slice(0, 1) || '?').toUpperCase());
                    const handle = (summary?.handle || String(summary?.author || '').replace(/^@/, '').trim() || '').trim();
                    const avatarSrc = handle ? this.escapeHtml(`https://unavatar.io/twitter/${encodeURIComponent(handle)}?fallback=false`) : '';
                    const when = summary?.createdAtText ? this.escapeHtml(summary.createdAtText) : '';
                    const text = summary?.text ? this.escapeHtml(summary.text) : '';
                    const header = `
                        <div class="x-thread-node-header d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div class="d-flex align-items-center gap-2">
                                <div class="x-thread-avatar bg-primary-subtle text-primary-emphasis">
                                    ${avatarSrc ? `<img class="x-thread-avatar-img" src="${avatarSrc}" alt="" referrerpolicy="no-referrer" loading="lazy" onerror="this.style.display='none'; this.parentElement.classList.add('x-thread-avatar-fallback');" />` : ''}
                                    <span class="x-thread-avatar-fallback-text">${avatarLetter}</span>
                                </div>
                                <span class="fw-semibold">${author}</span>
                                ${when ? `<span class="text-secondary small">${when}</span>` : ''}
                            </div>
                            <a class="small" href="${safeHref}" target="_blank" rel="noopener noreferrer">Open</a>
                        </div>
                    `;

                    const body = text
                        ? `<div class="x-tweet-text mt-2">${text}</div>`
                        : `<div class="x-tweet-text text-secondary mt-2">Tweet text unavailable (blocked by CORS/X). Use “Open”.</div>`;

                    const note = summary?.error
                        ? `<div class="small text-warning-emphasis mt-2">Fetch failed: ${this.escapeHtml(summary.error)}</div>`
                        : '';

                    const children = n.children.length ? `<div class="x-thread-children">${renderNodes(n.children)}</div>` : '';

                    return `
                        <div class="x-thread-node">
                            <div class="x-thread-row">
                                <div class="x-thread-content">
                                    ${header}
                                    <div class="x-thread-node-body">
                                        ${body}
                                        ${note}
                                    </div>
                                </div>
                            </div>
                            ${children}
                        </div>
                    `;
                }).join('');
            };

            return `<div class="x-thread-root">${renderNodes(nodes)}</div>`;
        },
        ensureTwitterWidgets() {
            if (window.twttr?.widgets?.load) return Promise.resolve(window.twttr);

            return new Promise((resolve, reject) => {
                const existing = document.getElementById('twitter-wjs');
                if (existing) {
                    const started = Date.now();
                    const tick = () => {
                        if (window.twttr?.widgets?.load) return resolve(window.twttr);
                        if (Date.now() - started > 8000) return reject(new Error('Timed out loading twitter widgets.'));
                        setTimeout(tick, 100);
                    };
                    return tick();
                }

                const script = document.createElement('script');
                script.id = 'twitter-wjs';
                script.async = true;
                script.src = 'https://platform.twitter.com/widgets.js';
                script.charset = 'utf-8';
                script.onload = () => {
                    const started = Date.now();
                    const tick = () => {
                        if (window.twttr?.widgets?.load) return resolve(window.twttr);
                        if (Date.now() - started > 8000) return reject(new Error('Timed out loading twitter widgets.'));
                        setTimeout(tick, 100);
                    };
                    tick();
                };
                script.onerror = () => reject(new Error('Failed to load twitter widgets.'));
                document.head.appendChild(script);
            });
        },
	        async generate() {
            this.generating = true;
            this.errors = [];
            this.warnings = [];
            this.threadHtml = '';
            this.tweetCount = 0;
            this.summariesByNodeId = {};

            try {
                const domEntries = this.readEntriesFromDom();
                const rawInput = domEntries?.length ? this.entriesArrayToRawInput(domEntries) : this.entriesToRawInput();
                this.inputText = rawInput;
                if (!rawInput.trim()) {
                    this.warnings = ['Input is empty. Paste one tweet URL per line, then click Generate.'];
                    return;
                }

	                if (domEntries?.length) {
	                    const nonEmpty = domEntries.filter((e) => String(e?.url || '').trim()).length;
	                    if (nonEmpty > 1 && !rawInput.includes('\n')) {
	                        this.warnings = [
	                            ...(this.warnings || []),
	                            `Only 1 URL was detected from ${nonEmpty} rows. Check the preview above.`
	                        ];
	                    }
	                    if (nonEmpty > this.maxTweets) {
	                        this.warnings = [...(this.warnings || []), `Only the first ${this.maxTweets} tweets will be generated.`];
	                    }
	                }

                const normalizedInput = (!rawInput.includes('\n') && /\\[nr]/.test(rawInput))
                    ? rawInput.replaceAll('\\r\\n', '\n').replaceAll('\\n', '\n').replaceAll('\\r', '\n')
                    : rawInput;

                const parsed = this.parseLinesToTree(normalizedInput);
                this.errors = parsed.errors;
                this.warnings = parsed.warnings;

                if (parsed.errors.length) return;
                if (!parsed.root.children.length) {
                    this.warnings = [
                        'No tweet URLs found. Make sure each line contains a tweet link like "https://x.com/<user>/status/<id>".'
                    ];
                    return;
                }

                const nodes = this.flattenNodes(parsed.root.children);
                const summaries = {};
	                const maxToFetch = this.maxTweets;
	                if (nodes.length > maxToFetch) {
	                    this.warnings = [...this.warnings, `Only fetching tweet text for the first ${maxToFetch} items.`];
	                }

                for (const n of nodes.slice(0, maxToFetch)) {
                    summaries[n.id] = await this.fetchTweetSummary(n);
                }

                this.summariesByNodeId = summaries;
                this.threadHtml = this.renderTreeHtml(parsed.root.children);
                this.tweetCount = parsed.tweetCount;

                await this.$nextTick();
            } finally {
                this.generating = false;
            }
	        }
	    }
	};
