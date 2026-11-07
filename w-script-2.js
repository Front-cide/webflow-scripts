/* RASTER — Work 2 page script (GSAP only). Page settings → Custom code → Before </body>.
   Runs after the site script and uses its helpers (window.RS). */
(function () {
  const RS = window.RS;
  if (!window.gsap || !RS || !RS.ready) return;

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