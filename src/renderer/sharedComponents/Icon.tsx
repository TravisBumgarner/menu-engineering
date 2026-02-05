import { BiCollapseVertical, BiExpandVertical } from 'react-icons/bi'
import { CgDetailsMore } from 'react-icons/cg'
import { FaRegListAlt } from 'react-icons/fa'
import { IoMdCheckbox, IoMdSettings, IoMdWarning } from 'react-icons/io'
import { IoInformationCircleOutline } from 'react-icons/io5'
import { LuApple, LuPartyPopper } from 'react-icons/lu'

import {
  MdAdd,
  MdArrowBack,
  MdClose,
  MdDeleteOutline,
  MdDownload,
  MdEdit,
  MdError,
  MdHistory,
  MdOutlineCheckBoxOutlineBlank,
  MdOutlinePhoto,
  MdSearch,
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
  history: MdHistory,
  search: MdSearch,
  arrowBack: MdArrowBack,
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
