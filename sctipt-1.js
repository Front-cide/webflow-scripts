/* RASTER — Home page script (GSAP only). Page settings → Custom code → Before </body>.
   Runs after the site script and uses its helpers (window.RS). Blocks H1 to H11, each runs only where its elements exist. */
(function () {
  const RS = window.RS;
  if (!window.gsap || !RS || !RS.ready) return;
  const M = RS.motion;

  /* KEY VARIABLES */
  const H = {
    loader: true,      // % preloader on every Home load (false = skip it)
    loaderFill: 1.4,   // seconds the logo takes to fill from 0 to 100%
    bandSpeed: 30,     // seconds for one loop of the discipline band
    bandBoost: 5,      // how much a fast scroll speeds the band up
    reelImage: 'https://cdn.prod.website-files.com/6ad697da1ea90c4d0127c28f/6ad697da1ea90c4d0127c35d_raster-hq-hero-3.webp' // photo for the twelve showreel strips (an Assets URL); empty = the launch film poster
  };

  /* H0 — DOT FIELD [data-field] (Home hero): a dot on every half column; the pointer pushes and grows the dots,
     a band of light sweeps down. Page scripts call RS.fieldIntro() to grow the dots in. */
  gsap.utils.toArray('[data-field]').forEach(svg => {
    const host = svg.parentElement, R = 230, m = { x: -999, y: -999, p: 0 };
    let dots = [], pos = [], hot = [], rows = 0, sweep = null, lastW = 0;
    const build = () => {
      const W = host.clientWidth, H = host.clientHeight, pad = 20, cw = (W - pad * 2) / 12, step = cw / 2;
      rows = Math.max(1, Math.floor((H - step * 2.5) / step) + 1); lastW = W;
      pos = Array.from({ length: rows * 13 }, (_, k) => ({ x: pad + (k % 13) * cw, y: step * 2 + Math.floor(k / 13) * step }));
      gsap.set(svg, { attr: { viewBox: '0 0 ' + W + ' ' + H }, innerHTML: pos.map(() => '<rect x="-1.5" y="-1.5" width="3" height="3"></rect>').join('') });
      dots = gsap.utils.toArray('rect', svg);
      gsap.set(dots, { x: i => pos[i].x, y: i => pos[i].y, opacity: 0.14, scale: RS.motion ? 0 : 1, transformOrigin: '50% 50%', fill: 'currentColor' });
      if (sweep) sweep.kill();
      if (RS.motion) sweep = gsap.timeline({ repeat: -1, repeatDelay: 1.5, paused: true }).to(dots, { opacity: 0.36, duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut', stagger: { each: 0.09, grid: [rows, 13], axis: 'y' } });
    };
    build();
    RS.fieldIntro = () => gsap.to(dots, { scale: 1, duration: 1.2, ease: RS.ease, stagger: { each: 0.012, grid: [rows, 13], from: 'center' } });
    addEventListener('resize', () => { if (Math.abs(host.clientWidth - lastW) > 40) gsap.delayedCall(0.2, () => { build(); gsap.set(dots, { scale: 1 }); if (sweep) sweep.play(); }); });
    if (!RS.motion) return;
    const push = () => {
      if (m.p < 0.01) return;
      dots.forEach((dot, i) => {
        const dx = pos[i].x - m.x, dy = pos[i].y - m.y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = gsap.utils.clamp(0, 1, 1 - d / R) * m.p, e = f * f * (3 - 2 * f);
        if (e > 0.001 || hot[i]) { hot[i] = e > 0.001; gsap.set(dot, { x: pos[i].x + dx / d * e * 22, y: pos[i].y + dy / d * e * 22, scale: 1 + e * 2.2 }); }
      });
    };
    if (RS.fine) {
      host.addEventListener('pointermove', e => { const b = svg.getBoundingClientRect(); gsap.to(m, { x: e.clientX - b.left, y: e.clientY - b.top, p: 1, duration: 0.6, ease: 'power3', overwrite: 'auto' }); });
      host.addEventListener('pointerleave', () => gsap.to(m, { p: 0, duration: 1, ease: 'power3', overwrite: 'auto', onComplete: push }));
    }
    ScrollTrigger.create({ trigger: host, start: 'top bottom', end: 'bottom top', onToggle: s => { if (s.isActive) { gsap.ticker.add(push); if (sweep) sweep.play(); } else { gsap.ticker.remove(push); if (sweep) sweep.pause(); } } });
  });


  /* H1 — PRELOADER [data-loader]: the word rises letter by letter, fills from 0 to 100% like a progress bar,
     then flies into the navbar logo while the four columns fold up; the hero intro plays as it lands */
  const loader = gsap.utils.toArray('[data-loader]')[0];
  if (loader && M && H.loader) {
    RS.hold = true;
    const word = gsap.utils.toArray('[data-loader-word]', loader)[0], fill = gsap.utils.toArray('[data-loader-fill]', loader)[0];
    const chars = SplitText.create(gsap.utils.toArray('.lw_base, [data-loader-fill]', loader), { type: 'chars' }).chars, pct = { v: 0 };
    // where the word lands: on the navbar logo, same top-left, scaled down to its height
    const lw = gsap.utils.toArray('.lw', word)[0], brand = gsap.utils.toArray('[data-nav-brand]')[0];
    const land = () => { if (!brand || !lw) return { x: 0, y: -40, s: 1 }; const a = lw.getBoundingClientRect(), b = brand.getBoundingClientRect(), k = gsap.getProperty(word, 'scale') || 1; return { x: b.left - a.left + gsap.getProperty(word, 'x'), y: b.top - a.top + gsap.getProperty(word, 'y'), s: b.height / a.height * k }; };
    const done = () => { if (brand) gsap.set(brand, { autoAlpha: 1 }); gsap.set(loader, { display: 'none' }); gsap.set(document.body, { overflow: '' }); };
    if (brand) gsap.set(brand, { autoAlpha: 0 });
    gsap.set(loader, { display: 'block', autoAlpha: 1, attr: { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100 } });
    gsap.set(document.body, { overflow: 'hidden' });
    gsap.timeline({ onStart: () => gsap.set(word, { visibility: 'visible' }) })
      .from(chars, { yPercent: 80, scaleY: 1.4, skewX: -6, transformOrigin: '50% 100%', duration: 0.75, stagger: 0.03, ease: 'expo.out' }, 0)
      .from(chars, { filter: 'blur(10px)', autoAlpha: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out', clearProps: 'filter' }, 0)
      .to(pct, { v: 100, duration: H.loaderFill, ease: 'power2.inOut', onUpdate: () => gsap.set(fill, { clipPath: 'inset(0% ' + (100 - pct.v) + '% 0% 0%)' }) }, 0.45)
      .addLabel('fly', '+=0.05')
      .add(() => { const w = word.getBoundingClientRect(), l = lw.getBoundingClientRect(); gsap.set(word, { overflow: 'visible', transformOrigin: (l.left - w.left) + 'px ' + (l.top - w.top) + 'px' }); }, 'fly')
      .to(word, { x: () => land().x, y: () => land().y, scale: () => land().s, duration: 1, ease: 'expo.inOut' }, 'fly')
      .to(gsap.utils.toArray('.loader_cols > div', loader), { scaleY: 0, transformOrigin: '50% 0%', duration: 0.85, ease: 'expo.inOut', stagger: 0.05 }, 'fly')
      .add(() => RS.intro.play(0), 'fly+=0.4')
      .add(done, 'fly+=1.05');
    gsap.delayedCall(8, () => { done(); if (!RS.intro.isActive() && RS.intro.progress() === 0) RS.intro.play(0); });
  }

  /* H2 — HERO INTRO [data-hero]: dots grow from the centre, the headline rises line by line, the founder card opens,
     the rules draw. Added to the shared intro timeline. */
  const hero = gsap.utils.toArray('[data-hero]')[0];
  if (hero && M) {
    const title = gsap.utils.toArray('[data-hero-title]', hero)[0];
    RS.intro.add(() => RS.fieldIntro && RS.fieldIntro(), 0)
      .from(title ? RS.maskPad(SplitText.create(title, { type: 'lines', mask: 'lines' })).lines : [], { yPercent: 130, duration: 1.3, stagger: 0.1, ease: 'expo.out' }, 0.25)
      .from(gsap.utils.toArray('.hero_top > p', hero), { y: 14, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.5)
      .from(gsap.utils.toArray('.socials > *', hero), { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, 0.6)
      .fromTo(gsap.utils.toArray('.hc_group', hero), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, stagger: 0.2, ease: RS.easeInOut }, 0.7)
      .from(gsap.utils.toArray('.hc_top, .hc_person, .hc_slots-h, .hc_btn', hero), { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 1)
      .from(gsap.utils.toArray('.hc_cells > div', hero), { scaleY: 0, transformOrigin: '50% 100%', stagger: 0.04, duration: 0.6, ease: 'expo.out' }, 1.2)
      .fromTo(gsap.utils.toArray('.hero_rule, [class^="divider"]:not([class*="_after"])', hero), { clipPath: 'inset(-4px 100% -4px -4px)' }, { clipPath: 'inset(-4px -4px -4px -4px)', duration: 1.4, stagger: 0.15, ease: RS.easeInOut }, 0.3)
      .from(gsap.utils.toArray('.hero_foot > p', hero), { y: 12, autoAlpha: 0, stagger: 0.06, duration: 0.8 }, 0.7);
    gsap.to(gsap.utils.toArray('.hc_cells .is-open', hero), { opacity: 0.25, duration: 0.7, stagger: 0.35, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.fromTo(gsap.utils.toArray('.hero_scroll_icon', hero), { backgroundPosition: '0% -100%' }, { backgroundPosition: '0% 220%', duration: 1.6, ease: 'power1.inOut', repeat: -1 });
  }

  /* H3 — STUDIO → SHOWREEL [data-scene]: the manifesto inks in word by word, then twelve strips (one per column)
     slide in from alternate sides and build the reel photo; the Play button opens last */
  const scene = gsap.utils.toArray('[data-scene]')[0];
  if (scene) {
    const wrap = gsap.utils.toArray('[data-scene-strips]', scene)[0], poster = gsap.utils.toArray('[data-phil-media] img')[0];
    const src = H.reelImage || (poster && poster.getAttribute('src'));
    if (wrap && src) {
      gsap.set(wrap, { innerHTML: Array(12).fill('<div><img src="' + src + '" alt=""></div>').join('') });
      const W = () => wrap.clientWidth;
      gsap.set(gsap.utils.toArray(':scope > div', wrap), { position: 'relative', flex: '1 1 0%', overflow: 'hidden', yPercent: i => (M ? (i % 2 ? -101 : 101) : 0) });
      gsap.set(gsap.utils.toArray('img', wrap), { position: 'absolute', top: 0, height: '100%', maxWidth: 'none', objectFit: 'cover', width: W, left: i => -i * W() / 12 });
    }
    const words = SplitText.create(gsap.utils.toArray('[data-scene-text]', scene), { type: 'words' }).words;
    const strips = gsap.utils.toArray('[data-scene-strips] > div', scene), play = gsap.utils.toArray('.scene_play', scene);
    if (M) {
      gsap.set(words, { opacity: 0.1 });
      // desktop: the scene holds (CSS sticky) for 3.6 screens of scroll while it plays; tablet and phone: it plays as it passes
      const track = innerWidth > 991 ? RS.track(scene) : null;
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: track ? { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true } : { trigger: scene, start: 'top 75%', end: 'bottom 20%', scrub: 1, invalidateOnRefresh: true } })
        .to(words, { opacity: 1, stagger: { amount: 1 }, duration: 0.3 }, 0)
        .addLabel('reel', '>+0.15')
        .to(gsap.utils.toArray('.scene_facts > p', scene), { autoAlpha: 0, y: -8, stagger: 0.03, duration: 0.2 }, 'reel')
        .to(strips, { yPercent: 0, duration: 0.5, stagger: { each: 0.035, from: 'center' }, ease: 'power3.out' }, 'reel')
        .fromTo(gsap.utils.toArray('[data-scene-strips] img', scene), { scale: 1.3 }, { scale: 1, duration: 1.2, ease: 'power2.out' }, 'reel')
        .from(gsap.utils.toArray('.scene_meta > p', scene), { autoAlpha: 0, y: 10, stagger: 0.05, duration: 0.2 }, 'reel+=0.7')
        .fromTo(play, { scale: 1, clipPath: 'inset(0% 100% 0% 0%)' }, { scale: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3, ease: 'power3.out' }, 'reel+=1');
    } else gsap.set(play, { scale: 1 });
  }

    // the big number rolls like an odometer, one column per digit: a digit that stays the same (the leading 0) does not move
  const mkRoll = el => {
    if (!el) return null;
    const ten = '0123456789'.split(''), first = RS.pad(parseInt(el.textContent, 10) || 1); let shown = first;
    const strip = '<span style="display:block">' + ten.map(d => '<span style="display:block;height:1.2em;line-height:1.2">' + d + '</span>').join('') + '</span>';
    gsap.set(el, { display: 'inline-flex', overflow: 'visible', attr: { 'aria-label': 'No. ' + first }, innerHTML: first.split('').map(() => '<span style="display:inline-block;height:1.2em;line-height:1.2;overflow:hidden;clip-path:inset(0 -0.35em)">' + strip + '</span>').join('') });
    const cols = gsap.utils.toArray(':scope > span', el);
    const widths = () => { const pr = document.createElement('span'); el.appendChild(pr); gsap.set(pr, { position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap' }); const fs = parseFloat(getComputedStyle(el).fontSize) || 1; const w = ten.map(d => { gsap.set(pr, { textContent: d }); return pr.getBoundingClientRect().width / fs; }); pr.remove(); return w; };
    const put = (txt, t) => { const w = widths(); txt.split('').forEach((d, k) => { const c = cols[k]; if (!c) return; const v = t ? { duration: 0.9, ease: 'expo.out', delay: k * 0.06, overwrite: 'auto' } : { duration: 0 }; gsap.to(c.firstChild, Object.assign({ yPercent: -10 * d }, v)); gsap.to(c, Object.assign({ width: w[d] + 'em' }, v)); }); };
    put(first); addEventListener('load', () => put(shown)); // text like "01" is kept in the script: GSAP would read an attribute "01" as the number 1
    return txt => { shown = txt; gsap.set(el, { attr: { 'aria-label': 'No. ' + txt } }); put(txt, true); };
  };

  /* H4 — SELECTED WORK [data-work]: the index lights the case in view and its number rolls; the progress line fills;
     each case opens from a clipped frame while its photo settles */
  const work = gsap.utils.toArray('[data-work]')[0];
  if (work && M) {
    const items = gsap.utils.toArray('[data-work-index] li', work), n = gsap.utils.toArray('[data-work-n]', work)[0], projs = gsap.utils.toArray('.work_list > a', work);
    const look = items.length > 1 ? RS.look(items[0], items[1], ['paddingLeft']) : null;
    // colours are theme variables, so the active name stays readable in day mode too
    const tone = on => (on ? 'var(--_theme---color--text)' : 'var(--_theme---color--muted)');
    const roll = mkRoll(n);
    let cur = 0;
    items.forEach((li, j) => gsap.set(li, { color: tone(j === 0) }));
    gsap.fromTo(gsap.utils.toArray('[data-work-progress]', work), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', ease: 'none', scrollTrigger: { trigger: '.work_list', start: 'top 60%', end: 'bottom 60%', scrub: true } });
    projs.forEach((p, i) => {
      ScrollTrigger.create({ trigger: p, start: 'top 55%', end: 'bottom 55%', onToggle: s => {
        if (!s.isActive || i === cur) return;
        items.forEach((li, j) => { gsap.set(li, { color: tone(j === i) }); if (look) gsap.to(li, { ...(j === i ? look.on : look.off), duration: 0.5, ease: 'expo.out' }); });
        if (roll) roll(RS.pad(i + 1));
        cur = i;
      } });
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: p, start: 'top bottom', end: 'top 30%', scrub: 1 } })
        .fromTo(gsap.utils.toArray('.proj_img', p), { clipPath: 'inset(10% 8% 10% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
        .fromTo(gsap.utils.toArray('.proj_img img', p), { scale: 1.22 }, { scale: 1.06 }, 0);
      gsap.fromTo(gsap.utils.toArray('.proj_img img', p), { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.from(gsap.utils.toArray('.proj_meta > *', p), { y: 20, autoAlpha: 0, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 60%' } });
    });
  }

  /* H5 — BAND [data-band]: the discipline marquee runs right to left; a fast scroll either way speeds it up, then it eases back */
  const band = gsap.utils.toArray('[data-band] .band_track')[0];
  if (band && M) {
    const loop = gsap.to(band, { xPercent: -50, duration: H.bandSpeed, ease: 'none', repeat: -1 });
    ScrollTrigger.create({ trigger: '[data-band]', start: 'top bottom', end: 'bottom top', onToggle: s => (s.isActive ? loop.play() : loop.pause()), onUpdate: s => {
      gsap.to(loop, { timeScale: 1 + gsap.utils.clamp(0, H.bandBoost, Math.abs(s.getVelocity()) / 400), duration: 0.3, overwrite: true, onComplete: () => gsap.to(loop, { timeScale: 1, duration: 1.2 }) });
    } });
    gsap.fromTo(gsap.utils.toArray('.thumb img', band), { yPercent: -12 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '[data-band]', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  }

  /* H6 — RESULTS: the four KPIs rise; the launch film frame opens and drifts; the caption follows */
  if (M) {
    RS.rise(gsap.utils.toArray('.kpis > *'), '.kpis', { y: 50, stagger: 0.1 });
    gsap.utils.toArray('[data-phil-media]').forEach(m => {
      gsap.fromTo(gsap.utils.toArray('.phil_frame', m), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: RS.easeInOut, scrollTrigger: { trigger: m, start: 'top 85%' } });
      gsap.fromTo(gsap.utils.toArray('.phil_frame img', m), { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.from(gsap.utils.toArray('figcaption > *', m), { y: 10, autoAlpha: 0, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: m, start: 'top 80%' } });
    });
  }

  /* H7 — PROCESS [data-pstack]: the week ruler (CSS sticky) fills week by week with the scroll and the week number rolls;
     each card (CSS sticky) settles its photo, its text rises, and it sinks into the dark as the next card covers it */
  const stack = gsap.utils.toArray('[data-pstack]')[0];
  if (stack && M) {
    const cards = gsap.utils.toArray('[data-pcard]', stack), bars = gsap.utils.toArray('[data-pruler] .pr_w_icon_b'), labels = gsap.utils.toArray('[data-pruler] .pr_w_span'), wk = gsap.utils.toArray('[data-pweek]')[0];
    let last = 1;
    const wroll = mkRoll(wk);
    ScrollTrigger.create({ trigger: stack, start: 'top 60%', end: 'bottom bottom', onUpdate: s => {
      const w = s.progress * 8;
      bars.forEach((b, i) => gsap.set(b, { scaleX: gsap.utils.clamp(0, 1, w - i) }));
      labels.forEach((l, i) => gsap.set(l, { color: w > i ? 'var(--_theme---color--text)' : '' })); // a week lights up as its line starts
      const now = gsap.utils.clamp(1, 8, Math.ceil(w));
      if (wroll && now !== last) { wroll(RS.pad(now)); last = now; }
    } });
    cards.forEach((c, i) => {
      gsap.fromTo(gsap.utils.toArray('.pc_frame img', c), { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top 30%', scrub: 0.6 } });
      gsap.from(gsap.utils.toArray('.pc_n, .pc_txt > *, .pc_out li', c), { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 60%' } });
      if (cards[i + 1]) gsap.to(gsap.utils.toArray('.pc_dim', c), { opacity: 0.8, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 30%', scrub: 1.2 } });
    });
  }

  /* H8 — CASE STUDY: the photo opens, the blocks rise, the chart draws: grid lines, the flat "before" line, then "after" climbs */
  if (M) {
    gsap.utils.toArray('.case_img').forEach(f => RS.wipe(f));
    gsap.utils.toArray('.case_block, .case_rows > div, [data-case-quote]').forEach(b => gsap.from(b, { y: 40, autoAlpha: 0, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'top 88%' } }));
    const chart = gsap.utils.toArray('[data-chart] svg')[0];
    if (chart) {
      const draw = !!window.DrawSVGPlugin, main = gsap.utils.toArray(':scope > polyline', chart), dots = gsap.utils.toArray(':scope > rect', chart);
      gsap.timeline({ scrollTrigger: { trigger: chart, start: 'top 80%' } })
        .from(gsap.utils.toArray(':scope > g:first-of-type line', chart), draw ? { drawSVG: 0, duration: 1, stagger: 0.08, ease: RS.easeInOut } : { autoAlpha: 0, duration: 0.8, stagger: 0.08 })
        .fromTo(gsap.utils.toArray('clipPath rect', chart), { attr: { width: 0 } }, { attr: { width: 700 }, duration: 1.6, ease: 'power2.inOut' }, 0.2)
        .from(main, draw ? { drawSVG: 0, duration: 2, ease: 'power3.inOut' } : { autoAlpha: 0, duration: 1.2 }, 1.1)
        .from(dots, { scale: 0, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.3, ease: 'back.out(3)' }, 1.6);
    }
  }

  /* H9 — VOICES [data-deck]: a deck of quote cards (CSS sticky stage) thrown away one by one with the scroll; the counter rolls */
  const deck = gsap.utils.toArray('[data-deck]')[0];
  if (deck && M) RS.mm.add('(min-width: 768px)', () => {
    const cards = gsap.utils.toArray('.qcard', deck), n = gsap.utils.toArray('[data-deck-n]', deck)[0], peek = 14;
    let shown = 0;
    cards.forEach((c, i) => { gsap.set(c, { zIndex: cards.length - i, y: -i * peek }); if (i) gsap.set(gsap.utils.toArray(c.children), { autoAlpha: 0 }); });
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: deck, start: 'top top', end: 'bottom bottom', scrub: 1, onUpdate: s => {
      const i = gsap.utils.clamp(0, cards.length - 1, Math.floor(s.progress * cards.length));
      if (n && i !== shown) { RS.swap(n, RS.pad(i + 1), i > shown ? 1 : -1); shown = i; }
    } } });
    cards.forEach((c, i) => {
      if (i === cards.length - 1) return;
      tl.to(c, { yPercent: -115, rotation: -5, duration: 1 }, i).to(c, { autoAlpha: 0, duration: 0.3, ease: 'none' }, i + 0.7);
      cards.slice(i + 1).forEach((b, j) => tl.to(b, { y: -j * peek, duration: 1 }, i));
      tl.to(gsap.utils.toArray(cards[i + 1].children), { autoAlpha: 1, stagger: 0.08, duration: 0.45 }, i + 0.35);
    });
    tl.to({}, { duration: 0.6 });
    gsap.from(gsap.utils.toArray('.rating_b, .dots > *, .deck_sub', deck), { y: 30, autoAlpha: 0, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: deck, start: 'top 70%' } });
  });

  /* H10 — CLIENTS, AWARDS, ENGAGEMENTS, QUESTIONS, JOURNAL: calm staggered entrances; the featured essay opens */
  if (M) {
    gsap.from(gsap.utils.toArray('[data-logos] > [class^="logos_item"], [data-logos] > .logos_more'), { y: 40, autoAlpha: 0, stagger: { each: 0.04, grid: [3, 4] }, ease: 'expo.out', scrollTrigger: { trigger: '[data-logos]', start: 'top 86%' } });
    RS.rise(gsap.utils.toArray('[data-awards] > *'), '[data-awards]', { y: 40, stagger: 0.06 });
    RS.rise(gsap.utils.toArray('.plans > *, .plans_aside > *'), '.pricing_body', { y: 40, stagger: 0.08 });
    RS.rise(gsap.utils.toArray('[data-acc] > *'), '[data-acc]', { y: 40, stagger: 0.05 });
    RS.rise(gsap.utils.toArray('[data-posts] > *'), '.journal_body', { y: 40, stagger: 0.08 });
    gsap.utils.toArray('.feature_img').forEach(f => RS.wipe(f).from(gsap.utils.toArray('.feature_cap > *'), { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out' }, 0.7));
  }

  /* H11 — FULL-WIDTH BREAK [data-break]: the photo opens from the middle columns to full bleed, then drifts; the caption rises */
  gsap.utils.toArray('[data-break]').forEach(b => {
    if (!M) return;
    const img = gsap.utils.toArray('.break_media img', b);
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: b, start: 'top bottom', end: 'center center', scrub: 1 } })
      .fromTo(gsap.utils.toArray('.break_media', b), { clipPath: 'inset(14% 25% 14% 25%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
      .fromTo(img, { scale: 1.35 }, { scale: 1.05 }, 0);
    gsap.to(img, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: b, start: 'center center', end: 'bottom top', scrub: 1 } });
    gsap.from(gsap.utils.toArray('.break_cap > *', b), { y: 24, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: b, start: 'center 70%' } });
  });
  /* H12 — SERVICES CUBE [data-cube] (Home): turns slowly, tilts with the pointer, shows the face of the hovered service */
  const srvRows = gsap.utils.toArray('[data-srv] article');
  const cubeWrap = gsap.utils.toArray('[data-cube]')[0];
  if (cubeWrap) {
    const cube = gsap.utils.toArray('.cube', cubeWrap)[0], st = { ry: -30, rx: -16 };
    const render = () => gsap.set(cube, { rotationX: st.rx, rotationY: st.ry, transformPerspective: 1000 });
    const spin = gsap.to(st, { ry: '-=360', duration: 28, ease: 'none', repeat: -1, onUpdate: render, paused: !RS.motion });
    render();
    RS.face = i => { spin.pause(); gsap.to(st, { ry: gsap.utils.snap(360, st.ry) - i * 90, duration: RS.D(1.1), ease: RS.ease, onUpdate: render, overwrite: 'auto' }); };
    if (RS.fine && RS.motion) {
      addEventListener('pointermove', e => gsap.to(st, { rx: gsap.utils.mapRange(0, innerHeight, -7, -25, e.clientY), duration: 1.4, ease: 'power3', onUpdate: render, overwrite: 'auto' }));
      srvRows.forEach((r, i) => { r.addEventListener('pointerenter', () => RS.face(i)); r.addEventListener('pointerleave', () => spin.invalidate().restart()); });
    }
    if (RS.motion) gsap.from(srvRows, { y: 60, autoAlpha: 0, stagger: 0.1, ease: RS.ease, scrollTrigger: { trigger: '[data-srv]', start: 'top 85%' } });
  }

  /* H13 — FLOATING PREVIEW (Home journal [data-posts] + [data-float]): a photo follows the pointer over the post rows.
     Each row's data-img should hold a full image URL from the Assets panel. */
  const floatBox = gsap.utils.toArray('[data-float]')[0], posts = gsap.utils.toArray('[data-posts]')[0];
  if (floatBox && posts && RS.fine && RS.motion) {
    const img = gsap.utils.toArray('img', floatBox)[0];
    const xTo = gsap.quickTo(floatBox, 'x', { duration: 0.7, ease: 'power3' }), yTo = gsap.quickTo(floatBox, 'y', { duration: 0.7, ease: 'power3' }), rot = gsap.quickTo(floatBox, 'rotation', { duration: 0.9, ease: 'power3' });
    let lx = 0;
    posts.addEventListener('pointermove', e => { xTo(e.clientX + 28); yTo(e.clientY - floatBox.offsetHeight / 2); rot(gsap.utils.clamp(-8, 8, (e.clientX - lx) * 0.5)); lx = e.clientX; });
    gsap.utils.toArray('[data-img]', posts).forEach(a => a.addEventListener('pointerenter', () => {
      const src = a.getAttribute('data-img');
      if (img && src.indexOf('http') === 0) gsap.set(img, { attr: { src: src } });
      if (img && img.getAttribute('src')) gsap.to(floatBox, { scale: 1, duration: 0.6, ease: RS.ease, overwrite: 'auto' });
    }));
    posts.addEventListener('pointerleave', () => gsap.to(floatBox, { scale: 0, duration: 0.5, ease: RS.ease, overwrite: 'auto' }));
  }

})();</script>




<script>
/* RASTER — Home 2 page script (GSAP only). Page settings → Custom code → Before </body>.
   Runs after the site script and uses its helpers (window.RS). Blocks V1 to V12, each runs only where its elements exist.
   The services tabs are at the end of this script; voices hover logic lives in the site script. */
(function () {
  const RS = window.RS;
  if (!window.gsap || !RS || !RS.ready) return;
  const M = RS.motion;

  /* KEY VARIABLES */
  const V = {
    slideEvery: 3,      // seconds per project in the hero slideshow
    workDrift: 80,      // px the right-hand work column drifts against the left (desktop)
    bandShift: 0.18     // share of its width each discipline line slides with the scroll
  };

  /* V1 — HERO INTRO [data-v2hero]: the stepped headline rises, the corner slideshow opens, the rest follows */
  const hero = gsap.utils.toArray('[data-v2hero]')[0];
  if (hero && M) {
    RS.intro.from(gsap.utils.toArray('.v2l_in', hero), { yPercent: 110, duration: 1.4, stagger: 0.12, ease: 'expo.out' }, 0.25)
      .fromTo(gsap.utils.toArray('[data-v2slides]', hero), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: RS.easeInOut }, 0.5)
      .from(gsap.utils.toArray('[data-v2slides] figure img', hero).slice(0, 1), { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.6)
      .from(gsap.utils.toArray('.v2hero_top > *, .v2rev_av > *, .v2rev_t, .v2hero_intro2, .v2scroll, .v2soc_b > *', hero), { y: 14, autoAlpha: 0, stagger: 0.06, duration: 0.9, ease: 'expo.out' }, 0.8)
      .fromTo(gsap.utils.toArray('[class^="divider"]:not([class*="_after"])', hero), { clipPath: 'inset(-4px 100% -4px -4px)' }, { clipPath: 'inset(-4px -4px -4px -4px)', duration: 1.4, stagger: 0.15, ease: RS.easeInOut }, 0.3);
  }

  /* V2 — HERO SLIDESHOW: a project turns every V.slideEvery seconds, wiping up from the bottom; the counter rolls */
  const slides = gsap.utils.toArray('[data-v2slides] > figure'), sn = gsap.utils.toArray('[data-v2slide-n]')[0];
  if (slides.length > 1) {
    let cur = 0;
    slides.forEach((s, k) => gsap.set(s, { zIndex: k ? 1 : 2, clipPath: k ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)' }));
    if (M) gsap.to({}, { duration: V.slideEvery, repeat: -1, onRepeat: () => {
      const prev = slides[cur]; cur = (cur + 1) % slides.length;
      gsap.set(slides[cur], { zIndex: 3 });
      gsap.fromTo(slides[cur], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: RS.easeInOut, onComplete: () => { gsap.set(prev, { zIndex: 1, clipPath: 'inset(100% 0% 0% 0%)' }); gsap.set(slides[cur], { zIndex: 2 }); } });
      gsap.fromTo(gsap.utils.toArray('img', slides[cur]), { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'expo.out' });
      if (sn) RS.swap(sn, RS.pad(cur + 1), 1);
    } });
  }

  if (!M) return;

  /* V3 — STUDIO REEL [data-v2reel]: the frame opens and the film poster settles as it scrolls in; the facts rise */
  gsap.utils.toArray('[data-v2reel]').forEach(reel => {
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: reel, start: 'top bottom', end: 'center center', scrub: 1 } })
      .fromTo(gsap.utils.toArray('.v2reel_frame', reel), { clipPath: 'inset(12% 12% 12% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
      .fromTo(gsap.utils.toArray('.v2reel_frame img', reel), { scale: 1.3 }, { scale: 1 }, 0);
    RS.rise(gsap.utils.toArray('.v2facts > div'), '.v2facts', { y: 24, stagger: 0.08 });
  });

  /* V4 — WORK [data-v2work]: each photo opens, its details follow; on desktop the right column drifts up faster than the left */
  gsap.utils.toArray('[data-v2work] > a').forEach((p, i) => {
    gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 85%' } })
      .fromTo(gsap.utils.toArray('.v2proj_img', p), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0)
      .from(gsap.utils.toArray('.v2proj_meta > *', p), { y: 16, autoAlpha: 0, stagger: 0.05, duration: 0.8, ease: 'expo.out', clearProps: 'transform' }, 0.6);
    gsap.fromTo(gsap.utils.toArray('.v2proj_img img', p), { yPercent: -5, scale: 1.1 }, { yPercent: 5, scale: 1.1, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
    if (i % 2) RS.mm.add('(min-width: 992px)', () => gsap.fromTo(p, { y: V.workDrift }, { y: -V.workDrift, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
  });

  /* V5 — DISCIPLINES [data-v2band]: each line slides with the scroll, alternating direction */
  gsap.utils.toArray('[data-v2band] [data-dir]').forEach((l, i) => {
    const t = gsap.utils.toArray('.v2bl_track', l)[0], dir = i % 2 ? -1 : 1;
    if (t) gsap.fromTo(t, { x: () => (dir > 0 ? 0 : -t.scrollWidth * V.bandShift) }, { x: () => (dir > 0 ? -t.scrollWidth * V.bandShift : 0), ease: 'none', scrollTrigger: { trigger: l, start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true } });
  });

  /* V6 — SERVICES ENTRANCE [data-v2srv]: the photo frame opens, the tabs rise (switching is in the site script) */
  gsap.utils.toArray('[data-v2srv]').forEach(srv => {
    gsap.fromTo(gsap.utils.toArray('.v2srv_img', srv), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: srv, start: 'top 60%' } });
    gsap.from(gsap.utils.toArray('[data-v2tab]', srv), { y: 20, autoAlpha: 0, stagger: 0.06, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: srv, start: 'top 60%' } });
  });

  /* V7 — RESULTS BARS [data-v2bars]: the bars rise from the base line (grow sideways on phones) with their numbers */
  gsap.utils.toArray('[data-v2bars]').forEach(bars => RS.mm.add({ phone: '(max-width: 767px)', wide: '(min-width: 768px)' }, c => {
    gsap.timeline({ scrollTrigger: { trigger: bars, start: 'top 75%' } })
      .from(gsap.utils.toArray('.v2bar_col > div:first-child', bars), c.conditions.phone ? { scaleX: 0, transformOrigin: '0% 50%', duration: 1.6, stagger: 0.12, ease: 'expo.out' } : { scaleY: 0, transformOrigin: '50% 100%', duration: 1.8, stagger: 0.12, ease: 'expo.out' }, 0)
      .from(gsap.utils.toArray('.v2bar_col > div:last-child', bars), { y: () => bars.offsetHeight * 0.3, autoAlpha: 0, duration: 1.8, stagger: 0.12, ease: 'expo.out' }, 0);
  }));

  /* V8 — PROCESS [data-v2pp]: each phase lights up as it reaches the middle and its photo wipes in;
     the eight week bars fill with the scroll and the week number rolls */
  gsap.utils.toArray('[data-v2pp]').forEach(pp => {
    const imgs = gsap.utils.toArray('.v2pp_media img', pp), phs = gsap.utils.toArray('[data-v2pp-ph]', pp), n = gsap.utils.toArray('[data-v2pp-n]', pp)[0];
    const bars = gsap.utils.toArray('.v2pp_bar_icon_b', pp), wn = gsap.utils.toArray('[data-v2week]')[0];
    let cur = 0, z = 2, week = 1;
    const show = i => {
      if (i === cur) return;
      gsap.to(phs, { opacity: k => (k === i ? 1 : 0.25), duration: 0.6 });
      gsap.killTweensOf(imgs[i]); gsap.set(imgs[i], { zIndex: ++z });
      gsap.fromTo(imgs[i], { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1, ease: 'expo.out' });
      if (n) RS.swap(n, RS.pad(i + 1), i > cur ? 1 : -1);
      cur = i;
    };
    RS.mm.add('(min-width: 768px)', () => gsap.set(phs, { opacity: k => (k ? 0.25 : 1) }));
    phs.forEach((p, k) => ScrollTrigger.create({ trigger: p, start: 'top 60%', end: 'bottom 60%', onEnter: () => show(k), onEnterBack: () => show(k) }));
    ScrollTrigger.create({ trigger: pp, start: 'top 60%', end: 'bottom bottom', onUpdate: s => {
      const w = s.progress * 8, now = gsap.utils.clamp(1, 8, Math.ceil(w));
      bars.forEach((b, k) => gsap.set(b, { scaleX: gsap.utils.clamp(0, 1, w - k) }));
      if (wn && now !== week) { RS.swap(wn, RS.pad(now), now > week ? 1 : -1); week = now; }
    } });
  });

  /* V9 — CASE CHAPTERS [data-v2chs]: on desktop the stage holds (CSS sticky) while the track of chapters slides sideways;
     the four segments fill and the chapter number rolls. Tablet and phone: the chapters rise one after another. */
  gsap.utils.toArray('[data-v2chs]').forEach(chs => {
    const stage = gsap.utils.toArray('[data-v2chs-stage]', chs)[0], track = gsap.utils.toArray('[data-v2chs-track]', chs)[0], panels = gsap.utils.toArray('[data-v2ch]', chs);
    const segs = gsap.utils.toArray('.v2chs_seg_icon_b', chs), cn = gsap.utils.toArray('[data-v2chs-n]', chs)[0];
    RS.mm.add({ desk: '(min-width: 992px)', small: '(max-width: 991px)' }, c => {
      if (c.conditions.small) { RS.rise(panels, track, { y: 40, stagger: 0.08 }); return; }
      const dist = () => track.scrollWidth - track.parentElement.clientWidth + 40;
      let last = 1;
      const trk = RS.track(stage, () => dist() * 1.2);
      gsap.timeline({ scrollTrigger: { trigger: trk, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true, onUpdate: s => {
        const p = s.progress * 4, now = gsap.utils.clamp(1, 4, Math.floor(p) + 1);
        segs.forEach((g, k) => gsap.set(g, { scaleX: gsap.utils.clamp(0, 1, p - k) }));
        if (cn && now !== last) { RS.swap(cn, RS.pad(now), now > last ? 1 : -1); last = now; }
      } } })
        .to(track, { x: () => -dist(), ease: 'none' }, 0)
        .fromTo(gsap.utils.toArray('.v2ch_img img', chs), { xPercent: 3, scale: 1.08 }, { xPercent: -3, scale: 1.08, ease: 'none' }, 0);
    });
  });

  /* V10 — PEOPLE, AWARDS, PRICING, QUESTIONS: rows rise one after another */
  RS.rise(gsap.utils.toArray('[data-v2team] > *'), '[data-v2team]', { stagger: 0.08, duration: 0.9 });
  RS.rise(gsap.utils.toArray('[data-v2awards] > *'), '[data-v2awards]', { stagger: 0.08 });
  RS.rise(gsap.utils.toArray('[data-v2pcs] > *'), '[data-v2pcs]', { stagger: 0.1 });
  RS.rise(gsap.utils.toArray('[data-v2qa] > *'), '[data-v2qa]', { y: 24, stagger: 0.06 });

  /* V11 — BREAK [data-v2break]: three photos open and drift at three speeds */
  gsap.utils.toArray('[data-v2break] .v2tri').forEach(tri => {
    const cols = gsap.utils.toArray(':scope > div', tri), from = [-8, 6, -12];
    cols.forEach((d, i) => gsap.fromTo(gsap.utils.toArray('img', d), { yPercent: from[i % 3], scale: 1.2 }, { yPercent: -from[i % 3], scale: 1.2, ease: 'none', scrollTrigger: { trigger: tri, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
    gsap.fromTo(cols, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, stagger: 0.12, ease: 'expo.inOut', scrollTrigger: { trigger: tri, start: 'top 75%' } });
    gsap.from(gsap.utils.toArray('.v2break_cap > *'), { y: 24, autoAlpha: 0, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: tri, start: 'center 70%' } });
  });

  /* V12 — JOURNAL + CONTACT: post photos open, the contact title rises line by line, the form fields follow */
  gsap.utils.toArray('[data-v2posts] > a').forEach((p, i) => gsap.timeline({ scrollTrigger: { trigger: '[data-v2posts]', start: 'top 85%' } })
    .fromTo(gsap.utils.toArray('.v2post_img', p), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, i * 0.1)
    .from(gsap.utils.toArray('.v2post_meta, h3', p), { y: 16, autoAlpha: 0, stagger: 0.06, duration: 0.8, ease: 'expo.out' }, 0.6 + i * 0.1));
  gsap.utils.toArray('[data-v2ct-t]').forEach(t => RS.lines(t, 'top 85%'));
  RS.rise(gsap.utils.toArray('.v2ct_who, .v2ct_info > div'), '.v2ct_who', { y: 24, stagger: 0.06 });
  RS.rise(gsap.utils.toArray('.v2f_two > *, [data-v2ct-f] > fieldset, [data-v2ct-f] > label, .v2f_foot'), '[data-v2ct-f]', { stagger: 0.08 });
  /* V0 — VOICES (Home 2 [data-h2q]): one quote at a time; prev / next buttons, auto-advance every RS.quoteDelay seconds */
  gsap.utils.toArray('[data-h2q]').forEach(q => {
    const items = gsap.utils.toArray('.hq_stage > figure', q), pics = gsap.utils.toArray('[data-v2qimg] figure', q), n = gsap.utils.toArray('[data-h2q-n]', q)[0];
    const splits = items.map(it => RS.maskPad(SplitText.create(gsap.utils.toArray('blockquote', it)[0], { type: 'lines', mask: 'lines' })));
    let cur = 0, timer = null, z = 2;
    const show = i => {
      i = gsap.utils.wrap(0, items.length, i); if (i === cur) return;
      const prev = cur; cur = i;
      gsap.to(splits[prev].lines, { yPercent: -130, duration: RS.D(0.6), stagger: 0.04, ease: 'power3.in' });
      gsap.to(items[prev], { autoAlpha: 0, duration: RS.D(0.4), delay: RS.D(0.4) });
      gsap.set(items[i], { autoAlpha: 1 });
      gsap.fromTo(splits[i].lines, { yPercent: 130 }, { yPercent: 0, duration: RS.D(1.1), stagger: 0.07, ease: RS.ease, delay: RS.D(0.45) });
      gsap.fromTo(gsap.utils.toArray('figcaption', items[i]), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: RS.D(0.8), delay: RS.D(0.8), ease: RS.ease });
      if (pics[i]) { gsap.set(pics[i], { zIndex: ++z }); gsap.fromTo(pics[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: RS.D(1), ease: RS.easeInOut }); }
      if (n) RS.swap(n, RS.pad(i + 1), 1);
      if (timer) timer.kill();
      if (RS.motion) timer = gsap.delayedCall(RS.quoteDelay, () => show(cur + 1));
    };
    items.forEach((it, k) => gsap.set(it, { autoAlpha: k ? 0 : 1 }));
    pics.forEach((p, k) => gsap.set(p, { clipPath: k ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)' }));
    gsap.utils.toArray('[data-h2q-next]', q).forEach(b => b.addEventListener('click', () => show(cur + 1)));
    gsap.utils.toArray('[data-h2q-prev]', q).forEach(b => b.addEventListener('click', () => show(cur - 1)));
    if (RS.motion && splits[0]) {
      gsap.set(splits[0].lines, { yPercent: 130 });
      ScrollTrigger.create({ trigger: q, start: 'top 75%', once: true, onEnter: () => { gsap.to(splits[0].lines, { yPercent: 0, duration: 1.2, stagger: 0.08, ease: RS.ease }); timer = gsap.delayedCall(RS.quoteDelay, () => show(1)); } });
    }
  });

  {
  const D = RS.D, FINE = RS.fine, MOTION = RS.motion;
  /* V10 — SERVICES TABS [data-v2srv] (moved from the site script).
     The hovered item lights up and its photo wipes in on top. */
  gsap.utils.toArray('[data-v2srv]').forEach(srv => {
    const tabs = gsap.utils.toArray('[data-v2tab]', srv), imgs = gsap.utils.toArray('.v2srv_img img', srv), panels = gsap.utils.toArray('.v2panels > div', srv);
    const on = RS.color('text', '#f2f2f0'), off = RS.color('muted', '#8a8a86');
    let cur = 0, z = 2, wait = null;
    const paint = (i, d) => tabs.forEach((t, k) => { gsap.to(t, { color: k === i ? on : off, duration: d }); gsap.to(gsap.utils.toArray(':scope > div:nth-child(2)', t), { x: k === i ? '0.4rem' : 0, duration: d, ease: RS.ease }); gsap.to(gsap.utils.toArray(':scope > div:last-child', t), { scale: k === i ? 1 : 0, duration: d, ease: RS.ease }); });
    const show = i => {
      if (i === cur) return;
      const prev = cur; cur = i; paint(i, D(0.5));
      gsap.set(imgs[i], { zIndex: ++z });
      gsap.fromTo(imgs[i], { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: D(0.85), ease: RS.ease, overwrite: true });
      gsap.set(panels[prev], { autoAlpha: 0 });
      gsap.set(panels[i], { autoAlpha: 1 });
      gsap.fromTo(gsap.utils.toArray(panels[i].children), { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.04, duration: D(0.5), ease: RS.ease, overwrite: true });
    };
    paint(0, 0);
    panels.forEach((p, k) => gsap.set(p, { autoAlpha: k ? 0 : 1 }));
    imgs.forEach((im, k) => gsap.set(im, { clipPath: k ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)', zIndex: k ? 0 : 1 }));
    tabs.forEach((t, k) => { t.addEventListener('click', () => show(k)); if (FINE) t.addEventListener('pointerenter', () => { if (wait) wait.kill(); wait = gsap.delayedCall(0.07, () => show(k)); }); });
  });
  }

  /* PRELOADER [data-loader] (same as Home 1): the word rises letter by letter, fills from 0 to 100% like a progress bar,
     then flies into the navbar logo while the four columns fold up; the hero intro plays as it lands */
  const loader = gsap.utils.toArray('[data-loader]')[0];
  if (loader && M) {
    RS.hold = true;
    const word = gsap.utils.toArray('[data-loader-word]', loader)[0], fill = gsap.utils.toArray('[data-loader-fill]', loader)[0];
    const chars = SplitText.create(gsap.utils.toArray('.lw_base, [data-loader-fill]', loader), { type: 'chars' }).chars, pct = { v: 0 };
    // where the word lands: on the navbar logo, same top-left, scaled down to its height
    const lw = gsap.utils.toArray('.lw', word)[0], brand = gsap.utils.toArray('[data-nav-brand]')[0];
    const land = () => { if (!brand || !lw) return { x: 0, y: -40, s: 1 }; const a = lw.getBoundingClientRect(), b = brand.getBoundingClientRect(), k = gsap.getProperty(word, 'scale') || 1; return { x: b.left - a.left + gsap.getProperty(word, 'x'), y: b.top - a.top + gsap.getProperty(word, 'y'), s: b.height / a.height * k }; };
    const done = () => { if (brand) gsap.set(brand, { autoAlpha: 1 }); gsap.set(loader, { display: 'none' }); gsap.set(document.body, { overflow: '' }); };
    if (brand) gsap.set(brand, { autoAlpha: 0 });
    gsap.set(loader, { display: 'block', autoAlpha: 1, attr: { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100 } });
    gsap.set(document.body, { overflow: 'hidden' });
    gsap.timeline({ onStart: () => gsap.set(word, { visibility: 'visible' }) })
      .from(chars, { yPercent: 80, scaleY: 1.4, skewX: -6, transformOrigin: '50% 100%', duration: 0.75, stagger: 0.03, ease: 'expo.out' }, 0)
      .from(chars, { filter: 'blur(10px)', autoAlpha: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out', clearProps: 'filter' }, 0)
      .to(pct, { v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => gsap.set(fill, { clipPath: 'inset(0% ' + (100 - pct.v) + '% 0% 0%)' }) }, 0.45)
      .addLabel('fly', '+=0.05')
      .add(() => { const w = word.getBoundingClientRect(), l = lw.getBoundingClientRect(); gsap.set(word, { overflow: 'visible', transformOrigin: (l.left - w.left) + 'px ' + (l.top - w.top) + 'px' }); }, 'fly')
      .to(word, { x: () => land().x, y: () => land().y, scale: () => land().s, duration: 1, ease: 'expo.inOut' }, 'fly')
      .to(gsap.utils.toArray('.loader_cols > div', loader), { scaleY: 0, transformOrigin: '50% 0%', duration: 0.85, ease: 'expo.inOut', stagger: 0.05 }, 'fly')
      .add(() => RS.intro.play(0), 'fly+=0.4')
      .add(done, 'fly+=1.05');
    gsap.delayedCall(8, () => { done(); if (!RS.intro.isActive() && RS.intro.progress() === 0) RS.intro.play(0); });
  }
})();
</script>




<script>
/* RASTER — Home 3 page script (GSAP only). Page settings → Custom code → Before </body>.
   Runs after the site script and uses its helpers (window.RS). Blocks T1 to T12, each runs only where its elements exist.
   Work names and service panels are at the end of this script; FAQ and copy address live in the site script. */
(function () {
  const RS = window.RS;
  if (!window.gsap || !RS || !RS.ready) return;
  const M = RS.motion;

  /* KEY VARIABLES */
  const T = {
    wordEvery: 2.6,     // seconds per word in the rotating hero word
    phase: 3.2,         // seconds per phase in the process stage (desktop)
    grain: 0.9          // seconds per loop of the film grain over the hero photo
  };

  /* T1 — HERO INTRO [data-h3hero]: the photo rises in from below, then the headline, then the services and the note */
  const hero = gsap.utils.toArray('[data-h3hero]')[0];
  if (hero && M) {
    RS.intro.fromTo(gsap.utils.toArray('[data-h3hero-img]', hero), { clipPath: 'inset(100% 0px 0px 0px)' }, { clipPath: 'inset(0% 0px 0px 0px)', duration: 1.5, ease: RS.easeInOut }, 0.1)
      .from(gsap.utils.toArray('[data-h3hero-img] img', hero), { scale: 1.3, duration: 2.2, ease: 'expo.out' }, 0.2)
      .from(gsap.utils.toArray('.h3l > div', hero), { yPercent: 110, duration: 1.4, stagger: 0.12, ease: 'expo.out' }, 0.8)
      .from(gsap.utils.toArray('.h3hero_tag > p, .h3hero_srv li, .h3hero_r > *, .h3scroll', hero), { y: 14, autoAlpha: 0, stagger: 0.05, duration: 0.9, ease: 'expo.out' }, 1.1);

    /* T2 — HERO SCROLL-OUT: the full-bleed photo pulls back into a frame on the grid, the headline lifts away */
    const pad = () => { const g = gsap.utils.toArray('.guides')[0]; return g ? g.offsetLeft : 20; };
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 40%', scrub: true, invalidateOnRefresh: true } })
      .fromTo(gsap.utils.toArray('[data-h3hero-img]', hero), { clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: () => 'inset(0px ' + pad() + 'px 0px ' + pad() + 'px)', ease: 'none', immediateRender: false }, 0)
      .to(gsap.utils.toArray('[data-h3hero-img] img', hero), { scale: 1.12, ease: 'none' }, 0)
      .to(gsap.utils.toArray('.h3hero_b, .h3hero_tag', hero), { y: -60, autoAlpha: 0, ease: 'none' }, 0);
    gsap.to(gsap.utils.toArray('.h3grain', hero), { keyframes: { xPercent: [0, -6, 5, -3, 8, -7, 0], yPercent: [0, 4, -7, 8, 2, -4, 0], easeEach: 'none' }, duration: T.grain, ease: 'steps(6)', repeat: -1 });
  }

  /* T3 — ROTATING WORD [data-h3rot]: the last word of the headline turns every T.wordEvery seconds, letters rolling up through a mask */
  const rot = gsap.utils.toArray('[data-h3rot]')[0];
  if (rot && M) {
    const ws = gsap.utils.toArray(':scope > div', rot), chars = ws.map(w => SplitText.create(w, { type: 'chars' }).chars);
    let cur = 0;
    ws.forEach((w, k) => gsap.set(w, { visibility: k ? 'hidden' : 'visible' }));
    gsap.to({}, { duration: T.wordEvery, repeat: -1, delay: 1.6, onRepeat: () => {
      const prev = cur; cur = (cur + 1) % ws.length;
      gsap.to(chars[prev], { yPercent: -110, duration: 0.6, stagger: 0.025, ease: 'power3.in', onComplete: () => { gsap.set(ws[prev], { visibility: 'hidden' }); gsap.set(chars[prev], { yPercent: 0 }); } });
      gsap.set(ws[cur], { visibility: 'visible' });
      gsap.fromTo(chars[cur], { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.03, delay: 0.3, ease: 'expo.out' });
    } });
  }

  if (!M) return;

  /* T4 — TITLES + CLIENTS: section titles rise line by line; the logo tiles rise out of the hero blurred and sharpen */
  gsap.utils.toArray('.h3h, .h3rres_t, .h3cs_t, .h3cs_t-2, .h3tm_h, [data-h3stu-t], [data-h3cx-t]').forEach(el => RS.lines(el, 'top 85%'));
  gsap.utils.toArray('[data-h3lgs] > a').forEach((t, i) => gsap.fromTo(t, { y: 80 + (i % 4) * 30, scale: 0.9, filter: 'blur(14px)', autoAlpha: 0 }, { y: 0, scale: 1, filter: 'blur(0px)', autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: t, start: 'top bottom', end: 'top 70%', scrub: 0.6 } }));
  RS.rise(gsap.utils.toArray('.h3stu_f > *'), '.h3stu_f', { y: 14 });
  gsap.utils.toArray('.h3lab, .h3work_lab, .h3lgs_f').forEach(l => gsap.from(l, { autoAlpha: 0, y: 12, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: l, start: 'top 90%' } }));

  /* T5 — WORK [data-h3work] + SERVICES [data-h3acc]: the names rise, the room photo settles; the panels open from the bottom */
  gsap.utils.toArray('[data-h3work]').forEach(wk => {
    gsap.from(gsap.utils.toArray('[data-h3w]', wk), { yPercent: 40, autoAlpha: 0, duration: 1.1, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: wk, start: 'top 70%' } });
    gsap.fromTo(gsap.utils.toArray('.h3work_bg img', wk).slice(0, 1), { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: wk, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.utils.toArray('[data-h3acc]').forEach(acc => gsap.from(gsap.utils.toArray('[data-h3ap]', acc), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, stagger: 0.1, ease: RS.easeInOut, scrollTrigger: { trigger: acc, start: 'top 80%' } }));

  /* T6 — RESULTS [data-h3rr]: each giant number rises while it counts (count in the site script), its text follows */
  gsap.utils.toArray('[data-h3rr]').forEach(r => {
    gsap.from(gsap.utils.toArray('[data-h3rr-n]', r), { yPercent: 35, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 85%' } });
    RS.rise(gsap.utils.toArray('.h3rr_t > *', r), r);
  });

  /* T7 — PROCESS [data-h3pr]: on desktop the stage holds while the four phases play in turn with the scroll: the bar of the phase
     fills, its photo wipes up, its text swaps, the week rolls. Tablet and phone: the phases rise. */
  gsap.utils.toArray('[data-h3pr]').forEach(pr => {
    const imgs = gsap.utils.toArray('.h3pr_ph img', pr), arts = gsap.utils.toArray('[data-h3pa]', pr), lis = gsap.utils.toArray('[data-h3pi]', pr);
    const bars = gsap.utils.toArray('[data-h3pi] > div:last-child > div', pr), wk = gsap.utils.toArray('[data-h3pr-wk]', pr)[0];
    RS.mm.add({ desk: '(min-width: 992px)', small: '(max-width: 991px)' }, c => {
      if (c.conditions.small) { RS.rise(arts, pr); return; }
      const on = 'var(--_theme---color--text)', off = 'var(--_theme---color--muted)'; // theme colours, so the night/day switch keeps working
      let cur = 0, z = 2;
      const go = i => {
        if (i === cur) return;
        const dn = i > cur; cur = i;
        gsap.to(lis, { color: k => (k <= i ? on : off), duration: 0.5, overwrite: true }); // finished phases stay lit
        gsap.set(imgs[i], { zIndex: ++z });
        gsap.fromTo(imgs[i], { clipPath: dn ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)', scale: 1.2 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.1, ease: RS.easeInOut, overwrite: true });
        gsap.killTweensOf(arts); // only one phase text is ever visible, even when scrolling fast
        gsap.set(arts, { autoAlpha: 0, y: 0 });
        gsap.fromTo(arts[i], { autoAlpha: 0, y: dn ? 30 : -30 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' });
      };
      gsap.set(arts, { autoAlpha: k => (k ? 0 : 1) });
      gsap.set(imgs, { clipPath: k => (k ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)') });
      // the stage holds (CSS sticky) for three screens of scroll; each quarter is one phase, its bar fills with the scroll
      const st = gsap.utils.toArray('[data-h3pr-stage]', pr)[0], trk = RS.track(st);
      gsap.set(bars, { scaleX: 0, transformOrigin: '0% 50%' });
      let wn = 0;
      ScrollTrigger.create({ trigger: trk, start: 'top top', end: 'bottom bottom', onUpdate: s => {
        const p = s.progress * 4, w = gsap.utils.clamp(1, 8, Math.floor(p * 2) + 1);
        go(gsap.utils.clamp(0, 3, Math.floor(p)));
        bars.forEach((b, k) => gsap.set(b, { scaleX: gsap.utils.clamp(0, 1, p - k) }));
        if (wk && w !== wn) { RS.swap(wk, RS.pad(w), w > wn ? 1 : -1); wn = w; }
      } });
      gsap.fromTo(gsap.utils.toArray('.h3pr_ph', pr), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: RS.easeInOut, scrollTrigger: { trigger: pr, start: 'top 70%' } });
    });
  });

  /* T8 — CASE BENTO [data-h3bento]: the tiles rise one after another, then the chips fade in, the bars grow, the checks slide in */
  gsap.utils.toArray('[data-h3bento]').forEach(bn => {
    gsap.from(gsap.utils.toArray('[data-h3b]', bn), { y: 50, autoAlpha: 0, duration: 1.1, stagger: 0.07, ease: 'expo.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: bn, start: 'top 80%' } });
    gsap.utils.toArray('figure > img', bn).forEach(im => gsap.fromTo(im, { objectPosition: '50% 25%' }, { objectPosition: '50% 55%', ease: 'none', scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 } }));
    gsap.timeline({ scrollTrigger: { trigger: bn, start: 'top 65%' } })
      .from(gsap.utils.toArray('[data-h3chip]', bn), { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'expo.out' }, 0.5)
      .from(gsap.utils.toArray('.h3chip_bar > div', bn), { scaleX: 0, transformOrigin: '0% 50%', duration: 1.4, stagger: 0.12, ease: 'expo.inOut' }, 0.9)
      .from(gsap.utils.toArray('.h3b_bars [class^="is-b"]', bn), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.8, stagger: 0.04, ease: 'expo.out' }, 0.3)
      .from(gsap.utils.toArray('.h3b_bars [class^="h3b_bars_span_icon"]', bn), { scaleY: 0, transformOrigin: '50% 100%', duration: 1.1, stagger: 0.05, ease: 'expo.out' }, 0.6)
      .from(gsap.utils.toArray('.h3b_checks li', bn), { x: -16, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'expo.out' }, 0.6);
    gsap.to(gsap.utils.toArray('.h3chip_l_em', bn), { opacity: 0.25, duration: 0.8, repeat: -1, yoyo: true, ease: 'steps(1)' });
  });

  /* T9 — SHOWREEL [data-h3sr]: on desktop the stage holds (CSS sticky); the middle reel starts covering it and closes onto its cell while the
     rest of the wall arrives; the caption appears once it has settled. Tablet and phone: the tiles rise. */
  gsap.utils.toArray('[data-h3sr]').forEach(sr => {
    const full = gsap.utils.toArray('[data-h3sr-full]', sr)[0], slot = gsap.utils.toArray('[data-h3sr-slot]', sr)[0], stage = gsap.utils.toArray('[data-h3sr-stage]', sr)[0];
    const others = gsap.utils.toArray('[data-h3sr-o]', sr), cap = gsap.utils.toArray('[data-h3sr-cap]', sr);
    if (!full || !slot || !stage) return;
    RS.mm.add({ desk: '(min-width: 992px)', small: '(max-width: 991px)' }, c => {
      if (c.conditions.small) { RS.rise([slot].concat(others), sr, { y: 40, stagger: 0.06 }); return; }
      const box = () => { const s = stage.getBoundingClientRect(), r = slot.getBoundingClientRect(); return 'inset(' + (r.top - s.top) + 'px ' + (s.right - r.right) + 'px ' + (s.bottom - r.bottom) + 'px ' + (r.left - s.left) + 'px)'; };
      const trk = RS.track(stage);
      gsap.timeline({ scrollTrigger: { trigger: trk, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true } })
        .fromTo(full, { clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: box, ease: 'power2.inOut', duration: 1 }, 0)
        .from(others, { autoAlpha: 0, scale: 0.86, stagger: 0.04, ease: 'power2.out', duration: 0.5 }, 0.35)
        .fromTo(cap, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0.95);
    });
  });

  /* T10 — VOICES + PEOPLE: quotes rise and the stat lines fill with the scroll; portraits open one by one; the role ticker drifts */
  gsap.utils.toArray('[data-h3tm]').forEach(tm => {
    RS.rise(gsap.utils.toArray('.h3tm_l > *, [data-h3t]', tm), tm);
    gsap.utils.toArray('[data-h3ts]', tm).forEach(li => gsap.fromTo(gsap.utils.toArray(':scope > div:last-child > div', li), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', ease: 'none', scrollTrigger: { trigger: li, start: 'top 90%', end: 'bottom 45%', scrub: 0.8 } }));
  });
  gsap.utils.toArray('[data-h3tps]').forEach(tps => {
    const cards = gsap.utils.toArray('[data-h3tp]', tps);
    gsap.fromTo(gsap.utils.toArray('.h3tp_img', tps), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, stagger: 0.1, ease: RS.easeInOut, scrollTrigger: { trigger: tps, start: 'top 80%' } });
    gsap.from(gsap.utils.toArray('.h3tp_img img', tps), { scale: 1.25, duration: 1.8, stagger: 0.1, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: tps, start: 'top 80%' } });
    RS.rise(cards.map(c => gsap.utils.toArray('figcaption', c)[0]), tps, { delay: 0.3 });
  });
  RS.rise(gsap.utils.toArray('.h3ts > div:not([class$="_before"]):not([class$="_after"]), .h3ts > a'), '.h3ts');
  gsap.utils.toArray('[data-h3tick]').forEach(tk => gsap.fromTo(tk, { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: tk.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 } }));

  /* T11 — RECOGNITION, PLANS, JOURNAL, CONTACT TILES [data-h3x]: tiles rise in batches as they arrive; share lines draw */
  gsap.set(gsap.utils.toArray('[data-h3x]'), { y: 30, autoAlpha: 0 });
  ScrollTrigger.batch('[data-h3x]', { start: 'top 85%', once: true, onEnter: b => gsap.to(b, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08, ease: 'expo.out', clearProps: 'transform' }) });
  gsap.utils.toArray('.h3rc_bar > div').forEach(u => gsap.from(u, { scaleX: 0, transformOrigin: '0% 50%', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: u, start: 'top 92%' } }));

  /* T12 — QUESTIONS: the rows rise one after another (open / close is in the site script) */
  RS.rise(gsap.utils.toArray('[data-h3fx]'), '.h3fxs', { stagger: 0.05 });

  {
  const D = RS.D, FINE = RS.fine, MOTION = RS.motion;
  /* T12 — WORK NAMES [data-h3work] + SERVICE PANELS [data-h3acc] (moved from the site script): the hovered item lights up,
     its photo fades in on top; the panel under the pointer opens. */
  gsap.utils.toArray('[data-h3work]').forEach(wk => {
    const imgs = gsap.utils.toArray('.h3work_bg img', wk), links = gsap.utils.toArray('[data-h3w]', wk), names = links.map(a => gsap.utils.toArray(':scope > div', a)[1]);
    const on = names[0] && String(gsap.getProperty(names[0], 'color')), off = names[1] && String(gsap.getProperty(names[1], 'color'));
    let cur = 0, z = 1, wait = null, loop = null;
    const show = i => {
      if (i === cur) return; cur = i;
      names.forEach((nm, k) => gsap.to(nm, { color: k === i ? on : off, duration: D(0.5) }));
      gsap.killTweensOf(imgs[i]); gsap.set(imgs[i], { zIndex: ++z });
      gsap.fromTo(imgs[i], { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: D(1.1), ease: RS.ease });
    };
    imgs.forEach((im, k) => gsap.set(im, { autoAlpha: k ? 0 : 1 }));
    links.forEach((a, i) => {
      a.addEventListener('pointerenter', () => { if (loop) loop.kill(); if (wait) wait.kill(); wait = gsap.delayedCall(0.06, () => show(i)); });
      if (!FINE) a.addEventListener('click', e => { if (cur !== i) { e.preventDefault(); if (loop) loop.kill(); show(i); } });
    });
    if (!FINE && MOTION) loop = gsap.to({}, { duration: 2.8, repeat: -1, onRepeat: () => show((cur + 1) % links.length) });
  });
  gsap.utils.toArray('[data-h3acc]').forEach(acc => {
    const ps = gsap.utils.toArray('[data-h3ap]', acc);
    RS.mm.add('(min-width: 992px)', () => {
      let wait = null;
      const set = (i, d) => ps.forEach((p, k) => {
        const on = k === i;
        gsap.to(p, { flexGrow: on ? 2.8 : 1, duration: d * 1.2, ease: RS.easeInOut });
        gsap.to(gsap.utils.toArray('img', p), { scale: on ? 1 : 1.08, filter: on ? 'brightness(0.62)' : 'brightness(0.45)', duration: d * 1.3, ease: RS.ease });
        gsap.to(gsap.utils.toArray(':scope > [class^="h3ap_v"]', p), { opacity: on ? 0 : 1, duration: d * 0.5 });
        gsap.to(gsap.utils.toArray(':scope > [class^="h3ap_c"]', p), { opacity: on ? 1 : 0, y: on ? 0 : 16, duration: d * 0.6, delay: on ? d * 0.25 : 0, ease: RS.ease });
      });
      const keep = () => { const gap = parseFloat(getComputedStyle(acc).columnGap) || 0, open = (acc.clientWidth - gap * (ps.length - 1)) * 2.8 / (2.8 + ps.length - 1); gsap.set(gsap.utils.toArray('[class^="h3ap_c"]', acc), { right: 'auto', width: Math.min(480, open - 40) }); };
      keep(); ScrollTrigger.addEventListener('refreshInit', keep);
      set(0, 0);
      ps.forEach((p, i) => p.addEventListener('pointerenter', () => { if (wait) wait.kill(); wait = gsap.delayedCall(0.07, () => set(i, D(0.75))); }));
    });
  });
  }

  /* PRELOADER [data-loader] (same as Home 1): the word rises letter by letter, fills from 0 to 100% like a progress bar,
     then flies into the navbar logo while the four columns fold up; the hero intro plays as it lands */
  const loader = gsap.utils.toArray('[data-loader]')[0];
  if (loader && M) {
    RS.hold = true;
    const word = gsap.utils.toArray('[data-loader-word]', loader)[0], fill = gsap.utils.toArray('[data-loader-fill]', loader)[0];
    const chars = SplitText.create(gsap.utils.toArray('.lw_base, [data-loader-fill]', loader), { type: 'chars' }).chars, pct = { v: 0 };
    // where the word lands: on the navbar logo, same top-left, scaled down to its height
    const lw = gsap.utils.toArray('.lw', word)[0], brand = gsap.utils.toArray('[data-nav-brand]')[0];
    const land = () => { if (!brand || !lw) return { x: 0, y: -40, s: 1 }; const a = lw.getBoundingClientRect(), b = brand.getBoundingClientRect(), k = gsap.getProperty(word, 'scale') || 1; return { x: b.left - a.left + gsap.getProperty(word, 'x'), y: b.top - a.top + gsap.getProperty(word, 'y'), s: b.height / a.height * k }; };
    const done = () => { if (brand) gsap.set(brand, { autoAlpha: 1 }); gsap.set(loader, { display: 'none' }); gsap.set(document.body, { overflow: '' }); };
    if (brand) gsap.set(brand, { autoAlpha: 0 });
    gsap.set(loader, { display: 'block', autoAlpha: 1, attr: { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100 } });
    gsap.set(document.body, { overflow: 'hidden' });
    gsap.timeline({ onStart: () => gsap.set(word, { visibility: 'visible' }) })
      .from(chars, { yPercent: 80, scaleY: 1.4, skewX: -6, transformOrigin: '50% 100%', duration: 0.75, stagger: 0.03, ease: 'expo.out' }, 0)
      .from(chars, { filter: 'blur(10px)', autoAlpha: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out', clearProps: 'filter' }, 0)
      .to(pct, { v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => gsap.set(fill, { clipPath: 'inset(0% ' + (100 - pct.v) + '% 0% 0%)' }) }, 0.45)
      .addLabel('fly', '+=0.05')
      .add(() => { const w = word.getBoundingClientRect(), l = lw.getBoundingClientRect(); gsap.set(word, { overflow: 'visible', transformOrigin: (l.left - w.left) + 'px ' + (l.top - w.top) + 'px' }); }, 'fly')
      .to(word, { x: () => land().x, y: () => land().y, scale: () => land().s, duration: 1, ease: 'expo.inOut' }, 'fly')
      .to(gsap.utils.toArray('.loader_cols > div', loader), { scaleY: 0, transformOrigin: '50% 0%', duration: 0.85, ease: 'expo.inOut', stagger: 0.05 }, 'fly')
      .add(() => RS.intro.play(0), 'fly+=0.4')
      .add(done, 'fly+=1.05');
    gsap.delayedCall(8, () => { done(); if (!RS.intro.isActive() && RS.intro.progress() === 0) RS.intro.play(0); });
  }
})();