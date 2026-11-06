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