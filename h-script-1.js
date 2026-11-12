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
    reelImage: 'https://cdn.prod.website-files.com/6aecdcb15d7b730d4d4bdba7/6af6319ddeb177f9145370be_me_2.webp' // photo for the twelve showreel strips (an Assets URL); empty = the launch film poster
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

})();
