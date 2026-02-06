import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import { visuallyHidden } from '@mui/utils'
import type * as React from 'react'
import type { IngredientDTO } from '../../../../shared/recipe.types'
import { useAppTranslation } from '../../../hooks/useTranslation'

interface HeadCell {
  id: keyof IngredientDTO | 'actions' | 'recipeCount'
  label: string
  align: 'left' | 'right' | 'center'
  width: string
}

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof IngredientDTO | 'recipeCount') => void

  order: 'asc' | 'desc'
  orderBy: string | number | symbol
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { t } = useAppTranslation()
  const { order, orderBy, onRequestSort } = props

  const headCells: readonly HeadCell[] = [
    {
      id: 'createdAt',
      align: 'left',
      label: t('created'),
      width: '8%',
    },
    {
      id: 'title',
      align: 'left',
      label: t('title'),
      width: '35%',
    },
    {
      id: 'units',
      align: 'left',
      label: t('units'),
      width: '15%',
    },
    {
      id: 'unitCost',
      align: 'right',
      width: '15%',
      label: t('unitCost'),
    },
    {
      id: 'recipeCount',
      align: 'right',
      width: '15%',
      label: t('usedIn'),
    },
    {
      id: 'actions',
      align: 'right',
      width: '12%',
      label: '',
    },
  ]

  const createSortHandler = (property: keyof IngredientDTO | 'recipeCount') => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sx={{ width: headCell.width, border: 'none' }}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === 'actions' ? (
              headCell.label
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
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
