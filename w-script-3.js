/* RASTER — Work 3 page script (GSAP only). Page settings → Custom code → Before </body>.
   Runs after the site script and uses its helpers (window.RS). */
(function () {
  const RS = window.RS;
  if (!window.gsap || !RS || !RS.ready || !RS.motion) return;

  /* KEY VARIABLES */
  const W = {
    sink: 0.9,          // scale a cover sinks to as the next one slides over it
    dim: 0.4            // brightness it fades to
  };

  /* W1 — STICKY STACK [data-pg-stack]: the covers are CSS sticky; each one sinks and dims as the next slides over it,
     and the title of each cover rises as it arrives */
  gsap.utils.toArray('[data-pg-stack]').forEach(stack => {
    const items = gsap.utils.toArray(':scope > *', stack);
    items.forEach((c, i) => {
      gsap.from(gsap.utils.toArray('.w3_name, .w3_side > *, .w3_top > *', c), { y: 40, autoAlpha: 0, stagger: 0.06, duration: 1.1, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: c, start: 'top 60%' } });
      gsap.fromTo(gsap.utils.toArray('.pg_stack_in img', c), { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top top', scrub: true } });
      if (!items[i + 1]) return;
      gsap.fromTo(gsap.utils.toArray('.pg_stack_in', c), { scale: 1, filter: 'brightness(1)' }, { scale: W.sink, filter: 'brightness(' + W.dim + ')', ease: 'none', scrollTrigger: { trigger: items[i + 1], start: 'top bottom', end: 'top top', scrub: true } });
    });
  });
})();