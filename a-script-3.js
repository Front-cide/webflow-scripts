/* RASTER — About 3 page script (GSAP only). Page settings → Custom code → Before </body>.
   Runs after the site script and uses its helpers (window.RS). */
(function () {
  const RS = window.RS;
  if (!window.gsap || !RS || !RS.ready) return;
  const D = RS.D, MOTION = RS.motion;

  /* G23 — TEAM SPOTLIGHT [data-ab3-team] (About 3): hover or tap a name and the portrait wipes up to that person;
     it cycles on its own (RS.autoplay seconds) while in view */
  gsap.utils.toArray('[data-ab3-team]').forEach(t => {
    const imgs = gsap.utils.toArray('figure img', t), rows = gsap.utils.toArray('[data-name]', t), lines = gsap.utils.toArray('.ab3_row_l', t);
    const cap = gsap.utils.toArray('[data-ab3-cap]', t)[0], city = gsap.utils.toArray('[data-ab3-city]', t)[0], n = gsap.utils.toArray('[data-ab3-n]')[0];
    const names = rows.map(r => gsap.utils.toArray('[class^="ab3_row_n_b"]', r)[0] || r), on = 'var(--_theme---color--text)', off = 'var(--_theme---color--muted)';
    let cur = 0, timer = null, z = 2;
    const show = (i, auto) => {
      gsap.to(names, { color: k => (k === i ? on : off), duration: D(0.4) });
      gsap.killTweensOf(lines); gsap.set(lines, { scaleX: 0, transformOrigin: '0% 50%' });
      if (lines[i]) gsap.fromTo(lines[i], { scaleX: 0 }, { scaleX: 1, duration: auto ? RS.autoplay : D(0.5), ease: auto ? 'none' : RS.ease });
      if (i === cur) return;
      cur = i; z++;
      gsap.set(imgs[i], { zIndex: z });
      gsap.fromTo(imgs[i], { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: D(1.1), ease: RS.ease, overwrite: true });
      if (cap) RS.swap(cap, rows[i].getAttribute('data-name'), 1);
      if (city) RS.swap(city, rows[i].getAttribute('data-city'), 1, 0.05);
      if (n) RS.text(n, RS.pad(i + 1));
    };
    const stop = () => { if (timer) timer.kill(); timer = null; };
    const next = () => { timer = gsap.delayedCall(RS.autoplay, () => { show((cur + 1) % imgs.length, true); next(); }); };
    const auto = () => { stop(); show(cur, true); next(); };
    imgs.forEach((im, k) => gsap.set(im, { clipPath: k ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)' }));
    rows.forEach((r, k) => { const go = () => { stop(); show(k, false); }; r.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') go(); }); r.addEventListener('click', go); });
    t.addEventListener('pointerleave', () => { if (!timer && MOTION) auto(); });
    show(0, false);
    if (MOTION) ScrollTrigger.create({ trigger: t, start: 'top 70%', end: 'bottom 20%', onToggle: s => (s.isActive ? auto() : stop()) });
  });
})();