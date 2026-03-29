interface Props {
  on: boolean
  color?: string
}

export default function FormToggle({ on, color = 'bg-primary' }: Props) {
  return (
    <div className="relative shrink-0">
      <div className={`h-5 w-9 rounded-full transition-colors ${on ? color : 'bg-muted'}`} />
      <div className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-transform ${on ? 'left-5' : 'left-1'}`} />
    </div>
  )
}
