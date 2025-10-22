import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { visuallyHidden } from '@mui/utils'
import * as React from 'react'
import { RecipeDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'

interface HeadCell {
  disablePadding: boolean
  id: keyof RecipeDTO | 'actions'
  label: string
  align: 'left' | 'right' | 'center'
}

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof RecipeDTO,
  ) => void
  order: 'asc' | 'desc'
  orderBy: string | number | symbol
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { t } = useAppTranslation()
  const { order, orderBy, onRequestSort } = props

  const headCells: readonly HeadCell[] = [
    {
      id: 'title',
      align: 'left',
      disablePadding: true,
      label: t('recipeName'),
    },
    {
      id: 'produces',
      align: 'right',
      disablePadding: false,
      label: t('produces'),
    },
    {
      id: 'units',
      align: 'left',
      disablePadding: false,
      label: t('units'),
    },
    {
      id: 'status',
      align: 'center',
      disablePadding: false,
      label: t('status'),
    },
    {
      id: 'showInMenu',
      align: 'left',
      disablePadding: false,
      label: t('showInMenu'),
    },
    {
      id: 'actions',
      align: 'center',
      disablePadding: false,
      label: t('actions'),
    },
  ]

  const createSortHandler =
    (property: keyof RecipeDTO) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

  const getHeaderLabel = (id: string): string => {
    switch (id) {
      case 'title':
        return t('title')
      case 'produces':
        return t('produces')
      case 'units':
        return t('units')
      case 'status':
        return t('status')
      case 'showInMenu':
        return t('showInMenu')
      case 'actions':
        return t('actions')
      default:
        return id
    }
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell />
        {headCells.map(headCell => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === 'actions' ? (
              getHeaderLabel(headCell.id)
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {getHeaderLabel(headCell.id)}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

export default EnhancedTableHead
