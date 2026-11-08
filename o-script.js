/* RASTER — Overview page script (GSAP only). Page settings → Custom code → Before </body>.
   Runs after the site script and uses its helpers (window.RS). */
(function () {
  const RS = window.RS;
  if (!window.gsap || !RS || !RS.ready) return;
  const M = RS.motion;

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