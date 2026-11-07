/* RASTER — About 1 page script (GSAP only). Page settings → Custom code → Before </body>.
   Runs after the site script and uses its helpers (window.RS). */
(function () {
  const RS = window.RS;
  if (!window.gsap || !RS || !RS.ready || !RS.motion) return;

  /* KEY VARIABLES */
  const A = {
    line: 0.55,      // where on screen (0 = top, 1 = bottom) a milestone becomes the active one
    roll: 0.9        // seconds each digit of the year takes to roll
  };

  /* A1 — TIMELINE [data-tl]: the progress bar fills with the list; the milestone that crosses the line lights up,
     its photo opens, and the big year rolls digit by digit (only the digits that change) */
  // desktop and tablet only: on phones every milestone shows at full opacity with its photo open, as in the reference
  gsap.matchMedia().add('(min-width: 768px)', () => {
    gsap.utils.toArray('[data-tl]').forEach(tl => {
      const list = gsap.utils.toArray('.ab1_tl_list', tl)[0], rows = gsap.utils.toArray('[data-tl-row]', tl), n = gsap.utils.toArray('[data-tl-n]', tl)[0];
      const digits = gsap.utils.toArray('[data-tl-year] > div > div', tl), texts = gsap.utils.toArray('[data-tl-row] > div:nth-child(2)', tl), frames = gsap.utils.toArray('.ab1_ms > figure', tl);
      if (!list || !rows.length) return;
      let cur = -1, year = rows[0].getAttribute('data-year');
      gsap.set(texts, { opacity: 0.32 });
      gsap.set(frames, { clipPath: 'inset(0% 0% 0% 100%)' });
      const set = (i, dir) => {
        if (i === cur) return; cur = i;
        gsap.to(texts, { opacity: k => (k === i ? 1 : 0.32), duration: 0.6, ease: 'expo.out' });
        gsap.to(frames, { clipPath: k => (k === i ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 0% 100%)'), duration: 0.9, ease: 'expo.out' });
        if (n) RS.text(n, RS.pad(i + 1));
        const to = rows[i].getAttribute('data-year');
        let d = 0;
        digits.forEach((el, k) => {
          if (year[k] === to[k]) return;
          gsap.timeline({ delay: d++ * 0.07 })
            .to(el, { yPercent: -130 * dir, duration: A.roll * 0.4, ease: 'power3.in' })
            .set(el, { textContent: to[k], modifiers: { textContent: () => to[k] }, yPercent: 130 * dir })
            .to(el, { yPercent: 0, duration: A.roll * 0.6, ease: 'expo.out' });
        });
        year = to;
      };
      gsap.fromTo(gsap.utils.toArray('[data-tl-bar]', tl), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', ease: 'none', scrollTrigger: { trigger: list, start: 'top ' + A.line * 100 + '%', end: 'bottom ' + A.line * 100 + '%', scrub: true } });
      // the active row is the last one whose top has passed the line, so a fast scroll never skips a year
      ScrollTrigger.create({ trigger: list, start: 'top ' + A.line * 100 + '%', end: 'bottom ' + A.line * 100 + '%', onUpdate: s => {
        const line = innerHeight * A.line;
        set(rows.reduce((a, r, k) => (r.getBoundingClientRect().top < line ? k : a), 0), s.direction);
      }, onEnter: () => set(0, 1) });
    });
  });
})();