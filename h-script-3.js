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