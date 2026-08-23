const shots = [
  { src: '/images/from-site/int_ext.jpg', alt: '37-39 N. Hanover Street' },
  { src: '/images/from-site/int_bar.jpg', alt: 'The bar and draft wall' },
  { src: '/images/from-site/wings.jpg', alt: 'Wings with celery' },
  { src: '/images/from-site/int_bar2.jpg', alt: 'Back bar mirror' },
  { src: '/images/from-site/int_fire.jpg', alt: 'Fireplace dining nook' },
  { src: '/images/from-site/int_dr1.jpg', alt: 'Dining room' },
  { src: '/images/from-site/steak.jpg', alt: 'Steak plate' },
  { src: '/images/from-site/wrap.jpg', alt: 'Wrap plate' },
  { src: '/images/from-site/pasta.jpg', alt: 'Pasta plate' },
]

export default function PhotoStrip() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {shots.map((s) => (
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            className="h-36 w-52 shrink-0 rounded-[16px] object-cover shadow-[0_0_0_1px_rgba(212,175,55,0.28)] sm:h-44 sm:w-64"
          />
        ))}
      </div>
    </section>
  )
}
