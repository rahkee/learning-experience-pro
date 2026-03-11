import { getInitials } from '../../data/fakeUsers.js'

const sizeMap = {
  xs: 'w-4 h-4 text-[7px]',
  sm: 'w-5 h-5 text-[8px]',
  md: 'w-6 h-6 text-[9px]',
  default: 'w-7 h-7 text-[10px]',
  lg: 'w-8 h-8 text-[10px]',
}

export default function UserAvatar({ user, size = 'default', className = '' }) {
  const color = user?.color ?? '#6366f1'
  return (
    <span
      className={`rounded-full flex items-center justify-center font-bold shrink-0 ${sizeMap[size] ?? sizeMap.default} ${className}`}
      style={{ backgroundColor: color + '33', color }}
    >
      {getInitials(user)}
    </span>
  )
}
