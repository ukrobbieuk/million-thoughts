export function BillboardBanner() {
  return (
    <section aria-label="The 2062 Billboard Project" className="mx-auto w-full max-w-3xl px-5">
      <div className="border-y border-neutral-900 py-4">
        <p className="text-pretty text-sm leading-relaxed text-neutral-400">
          <span aria-hidden="true">{'📜 '}</span>
          <span className="font-medium text-white">The 2062 Billboard Project:</span> If, and only if,
          we reach our ultimate goal of 1,000,000 thoughts, this entire master scroll will be
          broadcast across a massive public digital billboard on 13th October 2062. If the milestone
          is not met, it will remain permanently locked as a digital time capsule online forever.
        </p>
      </div>
    </section>
  )
}
