import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
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

const headCells: readonly HeadCell[] = [
  {
    id: 'title',
    align: 'left',
    disablePadding: true,
    label: 'Recipe Name',
  },
  {
    id: 'produces',
    align: 'right',
    disablePadding: false,
    label: 'Produces',
  },
  {
    id: 'units',
    align: 'left',
    disablePadding: false,
    label: 'Units',
  },
  {
    id: 'status',
    align: 'left',
    disablePadding: false,
    label: 'Status',
  },
  {
    id: 'showInMenu',
    align: 'left',
    disablePadding: false,
    label: 'Show in Menu',
  },
  {
    id: 'actions',
    align: 'center',
    disablePadding: false,
    label: 'Actions',
  },
]

interface EnhancedTableProps {
  numSelected: number
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof RecipeDTO,
  ) => void
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  order: 'asc' | 'desc'
  orderBy: string | number | symbol
  rowCount: number
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { t } = useAppTranslation()
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props
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
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            slotProps={{
              input: {
                'aria-label': t('selectAllRecipes'),
              },
            }}
          />
        </TableCell>
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
