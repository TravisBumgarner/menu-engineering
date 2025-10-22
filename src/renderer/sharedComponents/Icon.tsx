import { FaThList } from 'react-icons/fa'
import { FaBottleWater } from 'react-icons/fa6'
import { GiPartyPopper } from 'react-icons/gi'
import { IoMdCheckbox, IoMdWarning } from 'react-icons/io'
import { IoInformationCircleOutline } from 'react-icons/io5'
import {
  MdAdd,
  MdClose,
  MdEdit,
  MdOutlineCheckBoxOutlineBlank,
} from 'react-icons/md'

export const iconMap = {
  edit: MdEdit,
  add: MdAdd,
  checkbox: IoMdCheckbox,
  checkboxOutline: MdOutlineCheckBoxOutlineBlank,
  list: FaThList,
  water: FaBottleWater,
  close: MdClose,
  partyPopper: GiPartyPopper,
  warning: IoMdWarning,
  infoCircle: IoInformationCircleOutline,
}

const Icon = ({
  name,
  size = 20,
  color = 'currentColor',
}: {
  name: keyof typeof iconMap
  size?: number
  color?: string
}) => {
  const IconComponent = iconMap[name]
  return <IconComponent size={size} color={color} />
}

export default Icon
