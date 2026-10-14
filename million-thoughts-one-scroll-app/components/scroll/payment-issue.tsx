export function PaymentIssue({ kind }: { kind: 'unpaid' | 'invalid' }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-16">
      <h2 className="text-balance text-2xl font-semibold tracking-tight">
        {kind === 'unpaid' ? 'Payment not completed' : 'We couldn’t verify this payment'}
      </h2>
      <p className="mt-4 text-pretty leading-relaxed text-neutral-400">
        {kind === 'unpaid'
          ? 'Your payment is still processing or was not completed. Nothing has been added to the scroll yet.'
          : 'This payment link is missing or invalid. If you were charged, your thought will still appear on the scroll.'}
      </p>
      <a
        href="/"
        className="mt-10 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-neutral-200"
      >
        Return to the scroll
      </a>
    </section>
  )
}
