interface Props { milestone?: string }

export default function ComingSoonBanner({ milestone = 'M2' }: Props) {
  return (
    <div className="border border-dashed border-accent/30 rounded-lg p-8 text-center">
      <p className="text-xs font-bold text-accent-light uppercase tracking-widest mb-2">
        🌐 EN version · Coming in {milestone}
      </p>
      <p className="text-sm text-text-muted">
        Full English copy will be available at {milestone} launch.
        Toggle back to PT to see the complete section.
      </p>
    </div>
  )
}
