export default function RoleBadge({ role }) {
  if (role === 'student') return null
  const colors =
    role === 'teacher'
      ? 'bg-red-500/20 text-red-400'
      : 'bg-purple-500/20 text-purple-400'
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase leading-none ${colors}`}>
      {role}
    </span>
  )
}
