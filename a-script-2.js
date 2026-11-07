/* RASTER — About 2 page script (GSAP only). Page settings → Custom code → Before </body>.
   Runs after the site script and uses its helpers (window.RS). */
(function () {
  const RS = window.RS;
  if (!window.gsap || !RS || !RS.ready || !RS.motion) return;

  /* KEY VARIABLES */
  const B = {
    start: 'top 75%',   // when the story strip starts to fill
    end: 'bottom 85%'   // when the last chapter has filled (phones use bottom 70%)
  };

  /* B1 — STORY STRIP [data-ab2-strip]: four chapters side by side; as the strip scrolls through, each column's line
     fills, its year lights up and its photo wipes in, one chapter after the other */
  gsap.utils.toArray('[data-ab2-strip]').forEach(st => {
    const chs = gsap.utils.toArray('[data-ab2-ch]', st);
    gsap.set(gsap.utils.toArray('[data-ab2-ch] [class^="pg_frame"]', st), { clipPath: 'inset(100% 0% 0% 0%)' });
    RS.mm.add({ phone: '(max-width: 767px)', wide: '(min-width: 768px)' }, c => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: st, start: B.start, end: c.conditions.phone ? 'bottom 70%' : B.end, scrub: 1 } });
      chs.forEach((ch, i) => tl
        .fromTo(gsap.utils.toArray('.ab2_ch_l > div', ch), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', ease: 'none', duration: 1 }, i)
        .to(gsap.utils.toArray('.ab2_ch_y', ch), { color: () => RS.color('text', '#f2f2f0'), ease: 'none', duration: 0.4 }, i + 0.3)
        .to(gsap.utils.toArray('[class^="pg_frame"]', ch), { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out', duration: 0.8 }, i + 0.15)
        .from(gsap.utils.toArray('[class^="pg_frame"] img', ch), { scale: 1.25, ease: 'power2.out', duration: 0.8 }, i + 0.15));
    });
  });

  /* B2 — TEAM ROWS [data-pg-follow]: the names rise one after another */
  gsap.utils.toArray('[data-pg-follow]').forEach(l => RS.rise(gsap.utils.toArray(l.children), l, { stagger: 0.06 }));

  /* FOLLOW CARD [data-pg-follow-card]: over a list marked data-pg-follow, the photo of the row under the pointer ([data-img])
     follows the cursor, tilted a little; it shrinks away when the pointer leaves the list. Fine pointers only. */
  const card = gsap.utils.toArray('[data-pg-follow-card]')[0];
  if (card && RS.fine && RS.motion) {
    const img = gsap.utils.toArray('img', card)[0], fx = gsap.quickTo(card, 'x', { duration: 0.6, ease: 'power3' }), fy = gsap.quickTo(card, 'y', { duration: 0.6, ease: 'power3' });
    gsap.set(card, { scale: 0 });
    gsap.utils.toArray('[data-pg-follow]').forEach(list => {
      list.addEventListener('pointermove', e => { fx(e.clientX + 24); fy(e.clientY - card.offsetHeight / 2); });
      gsap.utils.toArray('[data-img]', list).forEach(r => r.addEventListener('pointerenter', () => {
        if (img) gsap.set(img, { attr: { src: r.getAttribute('data-img'), srcset: r.getAttribute('data-img') } });
        gsap.to(card, { scale: 1, rotation: gsap.utils.random(-4, 4), duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
      }));
      list.addEventListener('pointerleave', () => gsap.to(card, { scale: 0, duration: 0.5, ease: 'expo.out', overwrite: 'auto' }));
    });
  }
})();