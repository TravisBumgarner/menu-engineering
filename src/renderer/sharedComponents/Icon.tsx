import { BiCollapseVertical, BiExpandVertical } from 'react-icons/bi'
import { CgDetailsMore } from 'react-icons/cg'
import { FaRegListAlt } from 'react-icons/fa'
import { IoMdCheckbox, IoMdSettings, IoMdWarning } from 'react-icons/io'
import { IoInformationCircleOutline } from 'react-icons/io5'
import { LuApple, LuPartyPopper } from 'react-icons/lu'

import {
  MdAdd,
  MdClose,
  MdDeleteOutline,
  MdDownload,
  MdEdit,
  MdError,
  MdOutlineCheckBoxOutlineBlank,
  MdOutlinePhoto,
} from 'react-icons/md'

export const iconMap = {
  edit: MdEdit,
  add: MdAdd,
  checkbox: IoMdCheckbox,
  checkboxOutline: MdOutlineCheckBoxOutlineBlank,
  recipe: FaRegListAlt,
  ingredient: LuApple,
  close: MdClose,
  warning: IoMdWarning,
  info: IoInformationCircleOutline,
  error: MdError,
  success: LuPartyPopper,
  expandVertical: BiExpandVertical,
  collapseVertical: BiCollapseVertical,
  details: CgDetailsMore,
  settings: IoMdSettings,
  photo: MdOutlinePhoto,
  delete: MdDeleteOutline,
  download: MdDownload,
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
